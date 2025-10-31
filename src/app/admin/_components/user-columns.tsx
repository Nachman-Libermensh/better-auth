"use client";

import { Badge } from "@/components/ui/badge";
import type { DataGridColumnDef } from "@/components/ui/data-grid";
import type { AdminUserRow } from "@/lib/admin-data";

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
    type: "options",
    meta: {
      align: "center",
      options: {
        optionDisplay: "badge",
        optionItems: [
          { value: "admin", label: "מנהל", variant: "default" },
          { value: "user", label: "משתמש", variant: "secondary" },
        ],
      },
    },
  },
  {
    accessorKey: "banned",
    header: "חסימה",
    type: "boolean",
    meta: {
      align: "center",
      options: {
        boolean: {
          trueLabel: "חסום",
          falseLabel: "פעיל",
          trueVariant: "destructive",
          falseVariant: "secondary",
          emptyLabel: "—",
        },
      },
    },
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
];
