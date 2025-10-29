"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma, type Prisma, type UserStatus } from "@/lib/prisma";

function userUpdateData(data: Record<string, unknown>) {
  return data as unknown as Prisma.UserUpdateInput;
}

const createUserSchema = z.object({
  name: z.string().min(2, "שם קצר מדי"),
  email: z.string().email("אימייל לא תקין"),
  password: z
    .string()
    .min(8, "הסיסמה חייבת להכיל לפחות 8 תווים")
    .max(128, "הסיסמה ארוכה מדי"),
  role: z.enum(["USER", "ADMIN"], {
    message: "חובה לבחור תפקיד",
  }),
});

const userIdSchema = z.object({
  userId: z.string().min(1),
});

const userStatusValues = [
  "ACTIVE",
  "INACTIVE",
] as const satisfies readonly UserStatus[];

const updateStatusSchema = z.object({
  userId: z.string().min(1),
  status: z.enum(userStatusValues),
});

export type AdminActionResult = {
  success: boolean;
  message?: string;
  error?: string;
};

async function requireAdminSession() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session || session.user?.role !== "ADMIN" || !session.user?.id) {
    throw new Error("לא הותרה גישה לפעולה זו");
  }

  return { session, headers: requestHeaders };
}

async function ensureCanDisableTarget(
  currentAdminId: string,
  targetUserId: string
) {
  if (currentAdminId === targetUserId) {
    throw new Error("לא ניתן לחסום את עצמך");
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { role: true },
  });

  if (!targetUser) {
    throw new Error("המשתמש המבוקש לא נמצא");
  }

  if (targetUser.role === "ADMIN") {
    throw new Error("לא ניתן לחסום מנהלי מערכת אחרים");
  }
}

async function refreshAdminData() {
  revalidatePath("/admin");
  revalidatePath("/admin/users");
}

export async function createUserAction(
  input: z.infer<typeof createUserSchema>
): Promise<AdminActionResult> {
  try {
    const { headers: requestHeaders } = await requireAdminSession();
    const parsed = createUserSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "הנתונים שסופקו אינם תקינים",
      };
    }

    const response = await auth.api.createUser({
      headers: requestHeaders,
      body: {
        ...parsed.data,
        role: parsed.data.role.toLowerCase() as "user" | "admin",
      },
    });

    await prisma.user.update({
      where: { id: response.user.id },
      data: userUpdateData({
        status: "ACTIVE",
        deletedAt: null,
      }),
    });

    await refreshAdminData();

    return {
      success: true,
      message: "המשתמש נוצר בהצלחה",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "אירעה שגיאה בעת יצירת המשתמש";

    return {
      success: false,
      error: message,
    };
  }
}

export async function disconnectUserSessionsAction(
  input: z.infer<typeof userIdSchema>
): Promise<AdminActionResult> {
  try {
    await requireAdminSession();
    const parsed = userIdSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: "מזהה המשתמש אינו תקין",
      };
    }

    await prisma.session.deleteMany({
      where: { userId: parsed.data.userId },
    });

    await refreshAdminData();

    return {
      success: true,
      message: "כל הסשנים הפעילים נותקו בהצלחה",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "אירעה שגיאה בעת ניתוק המשתמש";

    return {
      success: false,
      error: message,
    };
  }
}

export async function softDeleteUserAction(
  input: z.infer<typeof userIdSchema>
): Promise<AdminActionResult> {
  try {
    const { session } = await requireAdminSession();
    const parsed = userIdSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: "מזהה המשתמש אינו תקין",
      };
    }

    await ensureCanDisableTarget(session.user.id, parsed.data.userId);

    await prisma.$transaction([
      prisma.session.deleteMany({
        where: { userId: parsed.data.userId },
      }),
      prisma.user.update({
        where: { id: parsed.data.userId },
        data: userUpdateData({
          status: "INACTIVE",
          deletedAt: new Date(),
        }),
      }),
    ]);

    await refreshAdminData();

    return {
      success: true,
      message: "המשתמש הועבר למחיקה רכה והסשנים נותקו",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "אירעה שגיאה בעת מחיקת המשתמש";

    return {
      success: false,
      error: message,
    };
  }
}

export async function restoreUserAction(
  input: z.infer<typeof userIdSchema>
): Promise<AdminActionResult> {
  try {
    await requireAdminSession();
    const parsed = userIdSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: "מזהה המשתמש אינו תקין",
      };
    }

    await prisma.user.update({
      where: { id: parsed.data.userId },
      data: userUpdateData({
        status: "ACTIVE",
        deletedAt: null,
      }),
    });

    await refreshAdminData();

    return {
      success: true,
      message: "המשתמש שוחזר בהצלחה",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "אירעה שגיאה בעת שחזור המשתמש";

    return {
      success: false,
      error: message,
    };
  }
}

export async function updateUserStatusAction(
  input: z.infer<typeof updateStatusSchema>
): Promise<AdminActionResult> {
  try {
    const { session } = await requireAdminSession();
    const parsed = updateStatusSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: "הנתונים שסופקו אינם תקינים",
      };
    }

    if (parsed.data.status === "INACTIVE") {
      await ensureCanDisableTarget(session.user.id, parsed.data.userId);
    }

    await prisma.user.update({
      where: { id: parsed.data.userId },
      data: userUpdateData({
        status: parsed.data.status,
        ...(parsed.data.status === "ACTIVE" ? { deletedAt: null } : {}),
      }),
    });

    if (parsed.data.status === "INACTIVE") {
      await prisma.session.deleteMany({
        where: { userId: parsed.data.userId },
      });
    }

    await refreshAdminData();

    return {
      success: true,
      message:
        parsed.data.status === "ACTIVE"
          ? "המשתמש סומן כפעיל"
          : "המשתמש סומן כלא פעיל והסשנים נותקו",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "אירעה שגיאה בעת עדכון הסטטוס";

    return {
      success: false,
      error: message,
    };
  }
}
