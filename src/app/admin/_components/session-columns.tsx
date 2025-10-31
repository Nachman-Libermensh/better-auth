"use client";

import { differenceInMinutes } from "date-fns";

import type { DataGridColumnDef } from "@/components/ui/data-grid";
import type { AdminSessionRow } from "@/lib/admin-data";

import { UserIdentity } from "./user-identity";

const formatDuration = (row: AdminSessionRow) => {
  const createdAt = new Date(row.createdAt);
  const expiresAt = new Date(row.expiresAt);

  if (Number.isNaN(createdAt.getTime()) || Number.isNaN(expiresAt.getTime())) {
    return "—";
  }

  const minutes = Math.max(differenceInMinutes(expiresAt, createdAt), 0);
  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;

  if (hours === 0) {
    return `${restMinutes} דק'`;
  }

  return `${hours} ש' ${restMinutes} דק'`;
};

export const sessionColumns: DataGridColumnDef<AdminSessionRow>[] = [
  {
    accessorKey: "userName",
    header: "משתמש",
    type: "custom",
    meta: { align: "left" },
    cell: (session) => (
      <UserIdentity
        name={session.userName || null}
        email={session.userEmail || null}
        image={session.userImage}
        primaryClassName="text-sm font-medium"
        secondaryClassName="text-xs text-muted-foreground"
      />
    ),
  },
  {
    accessorKey: "status",
    header: "סטטוס",
    type: "options",
    meta: {
      align: "center",
      options: {
        optionDisplay: "badge",
        optionItems: [
          { value: "ACTIVE", label: "פעיל", variant: "default" },
          { value: "EXPIRED", label: "פג", variant: "outline" },
        ],
      },
    },
  },
  {
    accessorKey: "token",
    header: "טוקן",
    type: "text-copy",
    enableSorting: false,
    meta: { align: "left" },
  },
  {
    accessorKey: "ipAddress",
    header: "כתובת IP",
    type: "text",
    meta: { align: "center", emptyValue: "—" },
  },
  {
    accessorKey: "userAgent",
    header: "דפדפן",
    type: "text-long",
    enableSorting: false,
    meta: { align: "left", emptyValue: "—" },
  },
  {
    accessorKey: "createdAt",
    header: "נוצר",
    type: "datetime",
    meta: { align: "center", options: { dateFormat: "short" } },
  },
  {
    accessorKey: "expiresAt",
    header: "פג",
    type: "datetime",
    meta: { align: "center", options: { dateFormat: "short" } },
  },
  {
    id: "duration",
    accessorKey: "expiresAt",
    header: "משך הסשן",
    type: "custom",
    enableSorting: false,
    enableFiltering: false,
    meta: { align: "center", emptyValue: "—" },
    cell: (session) => formatDuration(session),
  },
];
