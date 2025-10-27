"use client";

import * as React from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Mail, Lock, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SignPage() {
  const router = useRouter();
  const [mode, setMode] = React.useState<"signin" | "signup">("signin");
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
    name: "",
  });

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "signup") {
        const { data, error } = await authClient.signUp.email(
          {
            email: formData.email,
            password: formData.password,
            name: formData.name,
            callbackURL: "/",
          },
          {
            onRequest: () => {
              setIsLoading(true);
            },
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
        const { data, error } = await authClient.signIn.email(
          {
            email: formData.email,
            password: formData.password,
            callbackURL: "/",
            rememberMe: true,
          },
          {
            onRequest: () => {
              setIsLoading(true);
            },
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
    } catch (err) {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (err) {
      setIsLoading(false);
      toast.error("שגיאה בהתחברות עם Google");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">
            {mode === "signin" ? "כניסה" : "הרשמה"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {mode === "signin" ? "התחבר לחשבון שלך" : "צור חשבון חדש"}
          </p>
        </div>

        <div className="border-input bg-card flex rounded-lg border p-1">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              mode === "signin"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            כניסה
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              mode === "signup"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            הרשמה
          </button>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === "signup" && (
            <InputGroup>
              <InputGroupAddon align="inline-start" className="pl-0 px-1">
                <InputGroupText>
                  <User />
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                type="text"
                placeholder="שם מלא"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </InputGroup>
          )}

          <InputGroup>
            <InputGroupAddon align="inline-start" className="pl-0 px-1">
              <InputGroupText>
                <Mail />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              type="email"
              placeholder="אימייל"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </InputGroup>

          <InputGroup>
            <InputGroupAddon align="inline-start" className="pl-0 px-1">
              <InputGroupText>
                <Lock />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              type="password"
              placeholder="סיסמא"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              minLength={8}
            />
          </InputGroup>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "מעבד..." : mode === "signin" ? "התחבר" : "הירשם"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="border-input w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background text-muted-foreground px-2">או</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <svg className="size-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          המשך עם Google
        </Button>
      </div>
    </div>
  );
}
