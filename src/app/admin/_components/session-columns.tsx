"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { differenceInMinutes } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
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

export const sessionColumns: ColumnDef<AdminSessionRow>[] = [
  {
    accessorKey: "userName",
    header: "משתמש",
    filterFn: (row, columnId, filterValue) => {
      const value = String(filterValue).toLowerCase();
      const { userName, userEmail } = row.original;
      return (
        (userName ?? "").toLowerCase().includes(value) ||
        (userEmail ?? "").toLowerCase().includes(value)
      );
    },
    cell: ({ row }) => {
      const { userName, userEmail, userImage } = row.original;
      return (
        <UserIdentity
          name={userName || null}
          email={userEmail || null}
          image={userImage}
        />
      );
    },
  },
  {
    accessorKey: "status",
    header: "סטטוס",
    cell: ({ row }) => {
      const { status } = row.original;
      const isActive = status === "ACTIVE";
      return (
        <Badge variant={isActive ? "default" : "outline"}>
          {isActive ? "פעיל" : "פג"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "token",
    header: "טוקן",
    cell: ({ row }) => {
      const token = row.original.token;
      if (!token) return "—";
      return `${token.slice(0, 8)}...`;
    },
  },
  {
    accessorKey: "ipAddress",
    header: "כתובת IP",
    cell: ({ row }) => row.original.ipAddress ?? "—",
  },
  {
    accessorKey: "userAgent",
    header: "דפדפן",
    cell: ({ row }) => (
      <span className="line-clamp-2 max-w-[240px] text-xs">
        {row.original.userAgent ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "נוצר",
    cell: ({ row }) => formatDateTime(row.original.createdAt),
  },
  {
    accessorKey: "expiresAt",
    header: "פג",
    cell: ({ row }) => formatDateTime(row.original.expiresAt),
  },
  {
    id: "duration",
    header: "משך הסשן",
    accessorFn: (row) => formatDuration(row),
    cell: ({ row }) => formatDuration(row.original),
  },
];
