"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";

import { setPasswordAction } from "../actions";

type FeedbackState =
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | null;

const formSchema = z.object({
  newPassword: z
    .string()
    .min(8, "הסיסמה חייבת להכיל לפחות 8 תווים")
    .max(128, "הסיסמה ארוכה מדי"),
});

type FormValues = z.infer<typeof formSchema>;

export function SetPasswordForm() {
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [hasPassword, setHasPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { newPassword: "" },
    mode: "onBlur",
  });

  const handleSubmit = form.handleSubmit((values) => {
    setFeedback(null);

    startTransition(async () => {
      const result = await setPasswordAction(values);

      if (!result.success) {
        setFeedback({
          type: "error",
          message:
            result.error ?? "לא הצלחנו להגדיר את הסיסמה החדשה, נסו שוב במועד מאוחר יותר.",
        });

        if (result.alreadyHasPassword) {
          setHasPassword(true);
        }

        return;
      }

      form.reset({ newPassword: "" });
      setHasPassword(true);
      setFeedback({
        type: "success",
        message:
          result.message ?? "הסיסמה הוגדרה בהצלחה. מעתה תוכלו להתחבר עם הסיסמה שבחרתם.",
      });
    });
  });

  return (
    <div className="space-y-6 text-right">
      <p className="text-muted-foreground text-sm">
        הפעולה מיועדת למשתמשים שנרשמו באמצעות Google ועדיין לא הגדירו סיסמה לחשבון.
        לאחר הגדרת הסיסמה תוכלו להיכנס גם באמצעות אימייל וסיסמה רגילה.
      </p>

      {feedback ? (
        <Alert variant={feedback.type === "error" ? "destructive" : "default"}>
          <AlertTitle>{feedback.type === "error" ? "שגיאה" : "הצלחה"}</AlertTitle>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      ) : null}

      {hasPassword ? (
        <p className="rounded-md bg-muted px-4 py-3 text-sm">
          לחשבון זה כבר מוגדרת סיסמה. אם אינכם זוכרים אותה ניתן לבצע איפוס באמצעות מסך ההתחברות.
        </p>
      ) : null}

      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>סיסמה חדשה</FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    dir="ltr"
                    disabled={isPending || hasPassword}
                    autoComplete="new-password"
                  />
                </FormControl>
                <FormDescription>
                  על הסיסמה להכיל לפחות 8 תווים ולהיות ייחודית לחשבון זה.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending || hasPassword}>
              שמירת סיסמה
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
