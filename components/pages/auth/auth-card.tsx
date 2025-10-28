"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
          scopes: ["openid", "email", "profile"],
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

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">
          {mode === "signin" ? "כניסה" : "הרשמה"}
        </CardTitle>
        <CardDescription>
          {mode === "signin" ? "התחבר לחשבון שלך" : "צור חשבון חדש"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs
          dir="rtl"
          value={mode}
          onValueChange={(value) => setMode(value as AuthMode)}
          className="space-y-6"
        >
          <TabsList className="w-full">
            <TabsTrigger className="flex-1" value="signin">
              כניסה
            </TabsTrigger>
            <TabsTrigger className="flex-1" value="signup">
              הרשמה
            </TabsTrigger>
          </TabsList>

          <TabsContent dir="rtl" value="signin">
            <EmailAuthForm
              mode="signin"
              values={formValues}
              isLoading={isLoading}
              onChange={handleInputChange}
              onSubmit={(event) => handleEmailAuth(event, "signin")}
            />
          </TabsContent>

          <TabsContent value="signup">
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
      </CardContent>
    </Card>
  );
}
