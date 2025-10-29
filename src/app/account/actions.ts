"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { auth } from "@/lib/auth";

const setPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "הסיסמה חייבת להכיל לפחות 8 תווים")
    .max(128, "הסיסמה ארוכה מדי"),
});

export type SetPasswordActionResult = {
  success: boolean;
  message?: string;
  error?: string;
  alreadyHasPassword?: boolean;
};

export async function setPasswordAction(
  input: z.infer<typeof setPasswordSchema>
): Promise<SetPasswordActionResult> {
  try {
    const parsed = setPasswordSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error:
          parsed.error.issues[0]?.message ?? "הסיסמה שסופקה אינה עומדת בדרישות",
      };
    }

    await auth.api.setPassword({
      headers: await headers(),
      body: parsed.data,
    });

    return {
      success: true,
      message: "הסיסמה עודכנה בהצלחה. מעתה תוכלו להתחבר גם באמצעות אימייל וסיסמה.",
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "אירעה שגיאה בעת הגדרת הסיסמה";

    const alreadyHasPassword = message
      .toLowerCase()
      .includes("user already has a password");

    return {
      success: false,
      error: message,
      alreadyHasPassword,
    };
  }
}
