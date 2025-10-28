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

export type AdminNavItem = {
  href: string;
  label: string;
};

export function AdminNavigation({ items }: { items: AdminNavItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>ניהול</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.href;

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link href={item.href}>{item.label}</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
