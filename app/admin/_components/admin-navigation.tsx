"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  Clock3,
  LayoutDashboard,
  Users2,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP = {
  dashboard: LayoutDashboard,
  users: Users2,
  sessions: Clock3,
} satisfies Record<string, LucideIcon>;

export type AdminNavIcon = keyof typeof ICON_MAP;

export type AdminNavItem = {
  href: string;
  label: string;
  icon: AdminNavIcon;
};

export function AdminNavigation({ items }: { items: AdminNavItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarGroup className="items-end text-right">
      <SidebarGroupLabel className="w-full text-right">ניהול</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.href;
            const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className="justify-end text-right"
                >
                  <Link
                    href={item.href}
                    className="flex w-full items-center gap-3"
                  >
                    <Icon className="order-1 size-4" />
                    <span className="order-2 flex-1 text-right">
                      {item.label}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
