import * as React from "react";
import { Lock, Mail, User } from "lucide-react";

import { ActionButton } from "@/components/public/action-button";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { PasswordInput } from "@/components/ui/password-input";

export type EmailAuthFormValues = {
  email: string;
  password: string;
  name: string;
};

type EmailAuthFormProps = {
  mode: "signin" | "signup";
  values: EmailAuthFormValues;
  isLoading: boolean;
  onChange: (field: keyof EmailAuthFormValues, value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function EmailAuthForm({
  mode,
  values,
  isLoading,
  onChange,
  onSubmit,
}: EmailAuthFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {mode === "signup" && (
        <Field>
          <FieldLabel
            className="text-sm font-semibold text-slate-600"
            htmlFor="name"
          >
            שם מלא
          </FieldLabel>
          <FieldContent>
            <InputGroup>
              <InputGroupAddon align="inline-start" className="px-1 pl-0">
                <InputGroupText>
                  <User className="size-4" />
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="name"
                type="text"
                placeholder="שם מלא"
                value={values.name}
                onChange={(event) => onChange("name", event.target.value)}
                required
                disabled={isLoading}
                autoComplete="name"
              />
            </InputGroup>
          </FieldContent>
        </Field>
      )}

      <Field>
        <FieldLabel
          className="text-sm font-semibold text-slate-600"
          htmlFor="email"
        >
          אימייל
        </FieldLabel>
        <FieldContent>
          <InputGroup>
            <InputGroupAddon align="inline-start" className="px-1 pl-0">
              <InputGroupText>
                <Mail className="size-4" />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id="email"
              type="email"
              placeholder="אימייל"
              value={values.email}
              onChange={(event) => onChange("email", event.target.value)}
              required
              disabled={isLoading}
              autoComplete="email"
            />
          </InputGroup>
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel
          className="text-sm font-semibold text-slate-600"
          htmlFor="password"
        >
          סיסמה
        </FieldLabel>
        <FieldContent>
          <PasswordInput
            id="password"
            placeholder="סיסמה"
            value={values.password}
            onChange={(event) => onChange("password", event.target.value)}
            required
            minLength={8}
            disabled={isLoading}
            icon={<Lock className="size-4" />}
            iconPosition="inline-start"
            togglePosition="inline-end"
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
          />
        </FieldContent>
      </Field>

      <ActionButton
        type="submit"
        className="w-full gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-500 hover:via-blue-500 hover:to-indigo-600 hover:shadow-xl disabled:from-slate-400 disabled:via-slate-400 disabled:to-slate-500"
        disabled={isLoading}
        loading={isLoading}
      >
        {mode === "signin" ? "התחבר" : "הירשם"}
      </ActionButton>
    </form>
  );
}
