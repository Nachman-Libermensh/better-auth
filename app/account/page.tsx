import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";

import { SetPasswordForm } from "./_components/set-password-form";

export default async function AccountPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const userName = session.user?.name ?? "";
  const userEmail = session.user?.email ?? "";

  return (
    <div className="container mx-auto flex min-h-dvh max-w-2xl items-center justify-center px-4 py-10">
      <Card className="w-full" dir="rtl">
        <CardHeader className="text-right">
          <CardTitle>הגדרת סיסמה לחשבון</CardTitle>
          <CardDescription className="space-y-1 text-sm">
            {userName ? <p>שלום {userName}.</p> : null}
            {userEmail ? (
              <p>החשבון המשויך לכתובת {userEmail} יכול להוסיף כאן סיסמה.</p>
            ) : (
              <p>כאן תוכלו להוסיף סיסמה לחשבון המחובר.</p>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SetPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
