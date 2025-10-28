"use server";

import { cookies, headers } from "next/headers";
import { z } from "zod";

import { auth } from "@/lib/auth";

const setPasswordSchema = z.object({
  newPassword: z
    .string({ required_error: "חובה להזין סיסמה חדשה" })
    .min(8, "הסיסמה חייבת להכיל לפחות 8 תווים")
    .max(128, "הסיסמה ארוכה מדי"),
});

export type SetPasswordActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; code?: "HAS_PASSWORD" | "VALIDATION" | "UNKNOWN" };

export async function setPasswordAction(
  _prevState: SetPasswordActionState,
  formData: FormData
): Promise<SetPasswordActionState> {
  const parsed = setPasswordSchema.safeParse({
    newPassword: formData.get("newPassword"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      code: "VALIDATION",
      message: parsed.error.issues[0]?.message ?? "הסיסמה שסופקה אינה תקינה",
    };
  }

  try {
    const requestHeaders = await headers();
    const requestCookies = cookies();

    await auth.api.setPassword({
      headers: requestHeaders,
      cookies: requestCookies,
      body: {
        newPassword: parsed.data.newPassword,
      },
    });

    return {
      status: "success",
      message: "הסיסמה החדשה נשמרה בהצלחה",
    };
  } catch (error) {
    const fallbackMessage = "אירעה שגיאה בעת ניסיון שמירת הסיסמה";
    const message = error instanceof Error ? error.message : fallbackMessage;

    if (typeof message === "string" && message.includes("user already has a password")) {
      return {
        status: "error",
        code: "HAS_PASSWORD",
        message: "כבר מוגדרת סיסמה לחשבון זה. ניתן להמשיך ולהשתמש בהתחברות הרגילה.",
      };
    }

    return {
      status: "error",
      code: "UNKNOWN",
      message: fallbackMessage,
    };
  }
}
