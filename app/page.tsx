import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import SignOutButton from "./sign-out";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  if (!session) redirect("login");
  console.log("session: ", session);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card>
        <CardContent>
          <div>שם: {session?.user.name}</div>
          <div>אימייל: {session?.user.email}</div>
        </CardContent>
        <CardAction>
          <SignOutButton />
        </CardAction>
      </Card>
    </div>
  );
}
