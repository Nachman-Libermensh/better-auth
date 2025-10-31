"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

const banUserSchema = z.object({
  userId: z.string().min(1),
  banReason: z.string().min(1).optional(),
  banExpiresIn: z.number().int().positive().optional(),
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

    await auth.api.createUser({
      headers: requestHeaders,
      body: {
        ...parsed.data,
        role: parsed.data.role.toLowerCase() as "user" | "admin",
      },
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

export async function revokeUserSessionsAction(
  input: z.infer<typeof userIdSchema>
): Promise<AdminActionResult> {
  try {
    const { headers: requestHeaders } = await requireAdminSession();
    const parsed = userIdSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: "מזהה המשתמש אינו תקין",
      };
    }

    await auth.api.revokeUserSessions({
      headers: requestHeaders,
      body: {
        userId: parsed.data.userId,
      },
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

export async function banUserAction(
  input: z.infer<typeof banUserSchema>
): Promise<AdminActionResult> {
  try {
    const { session, headers: requestHeaders } = await requireAdminSession();
    const parsed = banUserSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: "הנתונים שסופקו אינם תקינים",
      };
    }

    await ensureCanDisableTarget(session.user.id, parsed.data.userId);

    await auth.api.banUser({
      headers: requestHeaders,
      body: {
        userId: parsed.data.userId,
        banReason: parsed.data.banReason,
        banExpiresIn: parsed.data.banExpiresIn,
      },
    });

    await refreshAdminData();

    return {
      success: true,
      message: "המשתמש נחסם והסשנים בוטלו",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "אירעה שגיאה בעת חסימת המשתמש";

    return {
      success: false,
      error: message,
    };
  }
}

export async function unbanUserAction(
  input: z.infer<typeof userIdSchema>
): Promise<AdminActionResult> {
  try {
    const { headers: requestHeaders } = await requireAdminSession();
    const parsed = userIdSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: "מזהה המשתמש אינו תקין",
      };
    }

    await auth.api.unbanUser({
      headers: requestHeaders,
      body: {
        userId: parsed.data.userId,
      },
    });

    await refreshAdminData();

    return {
      success: true,
      message: "המשתמש שוחרר מהחסימה",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "אירעה שגיאה בעת שחרור החסימה";

    return {
      success: false,
      error: message,
    };
  }
}

export async function removeUserAction(
  input: z.infer<typeof userIdSchema>
): Promise<AdminActionResult> {
  try {
    const { session, headers: requestHeaders } = await requireAdminSession();
    const parsed = userIdSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: "מזהה המשתמש אינו תקין",
      };
    }

    await ensureCanDisableTarget(session.user.id, parsed.data.userId);

    await auth.api.removeUser({
      headers: requestHeaders,
      body: {
        userId: parsed.data.userId,
      },
    });

    await refreshAdminData();

    return {
      success: true,
      message: "המשתמש הוסר לחלוטין מהמערכת",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "אירעה שגיאה בעת הסרת המשתמש";

    return {
      success: false,
      error: message,
    };
  }
}
