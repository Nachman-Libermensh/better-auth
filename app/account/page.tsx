import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";

import { SetPasswordForm } from "./set-password-form";

export default async function AccountPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto flex min-h-dvh max-w-3xl items-center justify-center py-12">
      <Card className="w-full" dir="rtl">
        <CardHeader className="space-y-3 text-right">
          <CardTitle className="text-2xl font-semibold">הגדרת סיסמה לחשבון</CardTitle>
          <CardDescription className="leading-relaxed">
            פעולה זו מיועדת למשתמשים שנרשמו באמצעות Google ועדיין לא הגדירו סיסמה עצמאית. לאחר
            שמירת סיסמה תוכלו להמשיך ולהתחבר באמצעות אימייל וסיסמה בנוסף להתחברות החברתית.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-4 py-6">
          <p className="text-sm text-muted-foreground">
            אם כבר הוגדרה סיסמה לחשבון, תוצג הודעה מתאימה והטופס ינוטרל.
          </p>
          <SetPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
