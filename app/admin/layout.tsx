import type { ReactNode } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import SignOutButton from "@/components/public/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";
import { AdminNavigation } from "./_components/admin-navigation";

const navigation = [
  { href: "/admin", label: "דשבורד" },
  { href: "/admin/users", label: "משתמשים" },
  { href: "/admin/sessions", label: "סשנים" },
];

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  if (session.user?.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">פאנל ניהול</h1>
            <p className="text-muted-foreground text-sm">
              ניהול משתמשים, סשנים ופעילות בזמן אמת.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-medium">{session.user?.name}</div>
              <div className="text-muted-foreground text-sm">
                {session.user?.email}
              </div>
            </div>
            <Badge variant="outline">מנהל</Badge>
            <SignOutButton variant="outline" />
          </div>
        </div>
      </header>
      <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[220px_1fr]">
        <aside>
          <Card className="sticky top-20">
            <CardContent className="space-y-2 p-4">
              <div className="text-muted-foreground text-sm">תפריט</div>
              <Separator />
              <AdminNavigation items={navigation} />
              <Separator />
              <nav className="space-y-1">
                <Link
                  href="/"
                  className="hover:bg-muted/60 flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors"
                >
                  חזרה לאתר
                </Link>
              </nav>
            </CardContent>
          </Card>
        </aside>
        <main>
          <div className="space-y-6 pb-12">{children}</div>
        </main>
      </div>
    </div>
  );
}
