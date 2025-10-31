"use client";

import { Badge } from "@/components/ui/badge";
import type { DataGridColumnDef } from "@/components/ui/data-grid";
import type { AdminUserRow } from "@/lib/admin-data";

import { UserRowActions } from "./user-row-actions";
import { UserIdentity } from "./user-identity";

export const userColumns: DataGridColumnDef<AdminUserRow>[] = [
  {
    accessorKey: "name",
    header: "משתמש",
    type: "custom",
    meta: { align: "left" },
    cell: (user) => (
      <UserIdentity
        name={user.name}
        email={user.email}
        image={user.image}
        primaryClassName="text-sm font-medium"
      />
    ),
  },
  {
    accessorKey: "role",
    header: "תפקיד",
    type: "badge",
    meta: {
      align: "center",
      options: {
        variants: {
          admin: "default",
          user: "secondary",
        },
      },
    },
    cell: (user) => {
      const isAdmin = user.roles.includes("admin");
      return (
        <Badge variant={isAdmin ? "default" : "secondary"}>
          {isAdmin ? "מנהל" : "משתמש"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "banned",
    header: "חסימה",
    type: "boolean",
    meta: { align: "center" },
    cell: (user) => (
      <Badge variant={user.banned ? "destructive" : "secondary"}>
        {user.banned ? "חסום" : "פעיל"}
      </Badge>
    ),
  },
  {
    id: "status",
    accessorKey: "activeSessions",
    header: "סטטוס",
    type: "custom",
    enableSorting: false,
    enableFiltering: false,
    meta: { align: "center" },
    cell: (user) => {
      const isActive = user.activeSessions > 0;
      return (
        <Badge variant={isActive ? "default" : "outline"}>
          {isActive ? "מחובר" : "מנותק"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "activeSessions",
    header: "סשנים פעילים",
    type: "number",
    meta: { align: "center" },
  },
  {
    accessorKey: "totalSessions",
    header: "סה\"כ סשנים",
    type: "number",
    meta: { align: "center" },
  },
  {
    accessorKey: "banExpiresAt",
    header: "תוקף חסימה",
    type: "datetime",
    meta: { align: "center", emptyValue: "—", options: { dateFormat: "short" } },
  },
  {
    accessorKey: "createdAt",
    header: "נוצר בתאריך",
    type: "datetime",
    meta: { align: "center", options: { dateFormat: "short" } },
  },
  {
    accessorKey: "lastActiveAt",
    header: "פעילות אחרונה",
    type: "datetime",
    meta: { align: "center", emptyValue: "—", options: { dateFormat: "relative" } },
  },
  {
    id: "actions",
    accessorKey: "id",
    header: "פעולות",
    type: "custom",
    enableSorting: false,
    enableFiltering: false,
    enableHiding: false,
    meta: { align: "center", sticky: "right" },
    cell: (user) => (
      <div className="flex justify-end">
        <UserRowActions user={user} />
      </div>
    ),
  },
];
