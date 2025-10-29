import type { ReactNode } from "react";
import Link from "next/link";

import SignOutButton from "@/components/public/sign-out-button";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { requireAdminUser } from "@/lib/auth-guards";

import {
  AdminNavigation,
  type AdminNavItem,
} from "./_components/admin-navigation";

const navigation: AdminNavItem[] = [
  { href: "/admin", label: "דשבורד", icon: "dashboard" },
  { href: "/admin/users", label: "משתמשים", icon: "users" },
  { href: "/admin/sessions", label: "סשנים", icon: "sessions" },
];

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireAdminUser();

  return (
    <SidebarProvider dir="rtl" className="bg-muted/30">
      <Sidebar side="right" className="border-l">
        <SidebarHeader className="border-b px-4 py-5 text-right">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">מחובר כאדמין</p>
            <div className="font-semibold">{session.user?.name}</div>
            <p className="text-xs text-muted-foreground">{session.user?.email}</p>
          </div>
        </SidebarHeader>
        <SidebarContent className="text-right">
          <AdminNavigation items={navigation} />
        </SidebarContent>
        <SidebarFooter className="border-t px-4 py-4 text-right">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/">חזרה לאתר</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SignOutButton variant="outline" className="mt-4 w-full" />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="border-b bg-background">
          <div
            className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6"
            dir="rtl"
          >
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <div>
                <h1 className="text-lg font-semibold">פאנל ניהול</h1>
                <p className="text-muted-foreground text-sm">
                  ניהול משתמשים, סשנים ופעילות בזמן אמת.
                </p>
              </div>
            </div>
            <Badge variant="outline" className="px-3 py-1 text-xs">
              מנהל
            </Badge>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
            {children}
          </div>
        </div>
      </SidebarInset>
      <SidebarRail />
    </SidebarProvider>
  );
}
