import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import SignOutButton from "@/components/public/sign-out-button";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  if (!session) redirect("login");
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card>
        <CardContent>
          <div>שם: {session?.user.name}</div>
          <div>אימייל: {session?.user.email}</div>
          <div>
            תפקיד: {session?.user.role === "ADMIN" ? "מנהל" : "משתמש"}
          </div>
        </CardContent>
        <CardAction className="flex items-center gap-2">
          {session?.user.role === "ADMIN" && (
            <Button asChild variant="outline">
              <Link href="/admin">כניסה לפאנל ניהול</Link>
            </Button>
          )}
          <SignOutButton />
        </CardAction>
      </Card>
    </div>
  );
}
