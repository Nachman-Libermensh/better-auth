"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

import { authClient } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useQueryParams from "@/hooks/use-query-params";
import { EmailAuthForm, EmailAuthFormValues } from "./email-auth-form";
import { SocialAuthSection } from "./social-auth-section";

type AuthMode = "signin" | "signup";

export function AuthCard() {
  const router = useRouter();
  const { getParam, setParam } = useQueryParams();
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

  const queryMode = getParam("mode");

  React.useEffect(() => {
    const normalizedMode =
      queryMode === "signup" || queryMode === "signin" ? queryMode : "signin";

    if (queryMode !== normalizedMode) {
      setParam("mode", normalizedMode, { method: "replace" });
      return;
    }

    if (mode !== normalizedMode) {
      setMode(normalizedMode);
    }
  }, [mode, queryMode, setParam]);

  const handleModeChange = React.useCallback(
    (nextMode: AuthMode) => {
      if (nextMode === mode) return;
      setMode(nextMode);
      setParam("mode", nextMode, { method: "replace" });
    },
    [mode, setParam]
  );

  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-blue-200/40 via-white to-sky-100/60 blur-3xl" />
      <Card className="relative overflow-hidden border border-slate-200/70 bg-white/90 shadow-2xl backdrop-blur">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500" />
        <CardHeader className="space-y-3 text-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <CardTitle className="bg-gradient-to-r from-blue-600 via-blue-700 to-slate-900 bg-clip-text text-3xl font-bold text-transparent">
                {mode === "signin" ? "ברוכים השבים" : "נעים להכיר"}
              </CardTitle>
              <CardDescription className="text-base text-slate-500">
                {mode === "signin"
                  ? "התחברו והמשיכו מהמקום שהפסקתם"
                  : "מלאו את הפרטים והצטרפו לקהילה שלנו"}
              </CardDescription>
            </motion.div>
          </AnimatePresence>
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
                className="rounded-lg transition-all duration-150 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow"
                value="signin"
              >
                כניסה
              </TabsTrigger>
              <TabsTrigger
                className="rounded-lg transition-all duration-150 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow"
                value="signup"
              >
                הרשמה
              </TabsTrigger>
            </TabsList>

            <div className="relative overflow-hidden" dir="rtl">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: mode === "signin" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: mode === "signin" ? -20 : 20 }}
                  transition={{
                    duration: 0.2,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                >
                  <EmailAuthForm
                    mode={mode}
                    values={formValues}
                    isLoading={isLoading}
                    onChange={handleInputChange}
                    onSubmit={(event) => handleEmailAuth(event, mode)}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </Tabs>

          <SocialAuthSection
            isLoading={isLoading}
            onGoogleClick={handleGoogleSignIn}
          />
        </CardContent>
      </Card>
    </div>
  );
}
