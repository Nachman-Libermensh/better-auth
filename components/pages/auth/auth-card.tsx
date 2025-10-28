"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailAuthForm, EmailAuthFormValues } from "./email-auth-form";
import { SocialAuthSection } from "./social-auth-section";

type AuthMode = "signin" | "signup";

export function AuthCard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mode, setMode] = React.useState<AuthMode>("signin");
  const [isLoading, setIsLoading] = React.useState(false);
  const [formValues, setFormValues] = React.useState<EmailAuthFormValues>({
    email: "",
    password: "",
    name: "",
  });

  const handleInputChange = React.useCallback(
    (field: keyof EmailAuthFormValues, value: string) => {
      setFormValues((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const handleEmailAuth = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>, currentMode: AuthMode) => {
      event.preventDefault();
      setIsLoading(true);

      try {
        if (currentMode === "signup") {
          await authClient.signUp.email(
            {
              email: formValues.email,
              password: formValues.password,
              name: formValues.name,
              callbackURL: "/",
            },
            {
              onRequest: () => setIsLoading(true),
              onSuccess: () => {
                router.push("/");
              },
              onError: (ctx) => {
                toast.error(ctx.error.message);
                setIsLoading(false);
              },
            }
          );
        } else {
          await authClient.signIn.email(
            {
              email: formValues.email,
              password: formValues.password,
              callbackURL: "/",
              rememberMe: true,
            },
            {
              onRequest: () => setIsLoading(true),
              onSuccess: () => {
                router.push("/");
              },
              onError: (ctx) => {
                toast.error(ctx.error.message);
                setIsLoading(false);
              },
            }
          );
        }
      } catch {
        setIsLoading(false);
      }
    },
    [formValues.email, formValues.name, formValues.password, router]
  );

  const handleGoogleSignIn = React.useCallback(async () => {
    try {
      await authClient.signIn.social(
        {
          provider: "google",
          callbackURL: "/",
        },
        {
          onRequest: () => setIsLoading(true),
          onSuccess: () => setIsLoading(false),
          onError: (ctx) => {
            toast.error(ctx.error.message);
            setIsLoading(false);
          },
        }
      );
    } catch {
      setIsLoading(false);
      toast.error("שגיאה בהתחברות עם Google");
    }
  }, []);

  const updateQueryMode = React.useCallback(
    (nextMode: AuthMode) => {
      if (nextMode === mode) return;

      setMode(nextMode);

      const params = new URLSearchParams(searchParams.toString());
      params.set("mode", nextMode);
      const queryString = params.toString();

      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [mode, pathname, router, searchParams]
  );

  React.useEffect(() => {
    const paramMode = searchParams.get("mode");

    if (paramMode === "signin" || paramMode === "signup") {
      if (paramMode !== mode) {
        setMode(paramMode);
      }
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", mode);
    const queryString = params.toString();

    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }, [mode, pathname, router, searchParams]);

  const handleModeChange = React.useCallback(
    (nextMode: AuthMode) => {
      updateQueryMode(nextMode);
    },
    [updateQueryMode]
  );

  return (
    <div className="relative animate-in fade-in-0 slide-in-from-bottom-6 duration-500">
      <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-blue-200/40 via-white to-sky-100/60 blur-3xl" />
      <Card className="relative overflow-hidden border border-slate-200/70 bg-white/90 shadow-2xl transition-all duration-500 backdrop-blur">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500" />
        <CardHeader className="space-y-3 text-center">
          <CardTitle className="bg-gradient-to-r from-blue-600 via-blue-700 to-slate-900 bg-clip-text text-3xl font-bold text-transparent">
            {mode === "signin" ? "ברוכים השבים" : "נעים להכיר"}
          </CardTitle>
          <CardDescription className="text-base text-slate-500">
            {mode === "signin"
              ? "התחברו והמשיכו מהמקום שהפסקתם"
              : "מלאו את הפרטים והצטרפו לקהילה שלנו"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-7 pb-6">
          <Tabs
            dir="rtl"
            value={mode}
            onValueChange={(value) => handleModeChange(value as AuthMode)}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-2 gap-2 rounded-xl bg-slate-100/70 p-1 text-sm font-semibold text-slate-500">
              <TabsTrigger
                className="rounded-lg transition data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow"
                value="signin"
              >
                כניסה
              </TabsTrigger>
              <TabsTrigger
                className="rounded-lg transition data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow"
                value="signup"
              >
                הרשמה
              </TabsTrigger>
            </TabsList>

            <TabsContent
              dir="rtl"
              value="signin"
              className="h-[24rem] space-y-6 overflow-y-auto data-[state=inactive]:pointer-events-none data-[state=inactive]:opacity-0 data-[state=inactive]:duration-200 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-4"
            >
              <EmailAuthForm
                mode="signin"
                values={formValues}
                isLoading={isLoading}
                onChange={handleInputChange}
                onSubmit={(event) => handleEmailAuth(event, "signin")}
              />
            </TabsContent>

            <TabsContent
              dir="rtl"
              value="signup"
              className="h-[24rem] space-y-6 overflow-y-auto data-[state=inactive]:pointer-events-none data-[state=inactive]:opacity-0 data-[state=inactive]:duration-200 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-4"
            >
              <EmailAuthForm
                mode="signup"
                values={formValues}
                isLoading={isLoading}
                onChange={handleInputChange}
                onSubmit={(event) => handleEmailAuth(event, "signup")}
              />
            </TabsContent>
          </Tabs>

          <SocialAuthSection
            isLoading={isLoading}
            onGoogleClick={handleGoogleSignIn}
          />

          <div className="text-sm text-center text-slate-500">
            {mode === "signin" ? (
              <>
                אין לכם חשבון?{" "}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleModeChange("signup")}
                  className="font-semibold text-blue-600 underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-blue-300"
                >
                  הירשמו כאן
                </button>
              </>
            ) : (
              <>
                כבר יש לכם חשבון?{" "}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleModeChange("signin")}
                  className="font-semibold text-blue-600 underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-blue-300"
                >
                  התחברו כאן
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
