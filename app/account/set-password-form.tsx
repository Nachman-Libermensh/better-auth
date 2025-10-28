"use client";

import { useFormState, useFormStatus } from "react-dom";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

import { setPasswordAction, type SetPasswordActionState } from "./actions";

const initialState: SetPasswordActionState = { status: "idle" };

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending || disabled} className="w-full sm:w-auto">
      {pending ? "שומר..." : "שמירת סיסמה"}
    </Button>
  );
}

export function SetPasswordForm() {
  const [state, formAction] = useFormState(setPasswordAction, initialState);

  const isDisabled =
    state.status === "success" ||
    (state.status === "error" && state.code === "HAS_PASSWORD");

  return (
    <form action={formAction} className="space-y-4" dir="rtl">
      <div className="space-y-2">
        <Label htmlFor="newPassword" className="text-right">
          סיסמה חדשה
        </Label>
        <PasswordInput
          id="newPassword"
          name="newPassword"
          placeholder="הזינו סיסמה באורך של לפחות 8 תווים"
          minLength={8}
          maxLength={128}
          autoComplete="new-password"
          disabled={isDisabled}
          required
        />
      </div>

      <SubmitButton disabled={isDisabled} />

      {state.status === "success" ? (
        <Alert variant="default" dir="rtl">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      {state.status === "error" ? (
        <Alert variant="destructive" dir="rtl">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
    </form>
  );
}
