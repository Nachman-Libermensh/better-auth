"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import type { AdminUserRow } from "@/lib/admin-data";

import { UserRowActions } from "./user-row-actions";
import { UserIdentity } from "./user-identity";

export const userColumns: ColumnDef<AdminUserRow>[] = [
  {
    accessorKey: "name",
    header: "שם",
    filterFn: (row, columnId, filterValue) => {
      const value = String(filterValue).toLowerCase();
      const { name, email } = row.original;
      return (
        (name ?? "").toLowerCase().includes(value) ||
        (email ?? "").toLowerCase().includes(value)
      );
    },
    cell: ({ row }) => {
      const { name, email, image } = row.original;
      return <UserIdentity name={name} email={email} image={image} />;
    },
  },
  {
    accessorKey: "role",
    header: "תפקיד",
    cell: ({ row }) => {
      const isAdmin = row.original.roles.includes("admin");
      const variant = isAdmin ? "default" : "secondary";
      const label = isAdmin ? "מנהל" : "משתמש";
      return <Badge variant={variant}>{label}</Badge>;
    },
  },
  {
    id: "banStatus",
    header: "חסימה",
    cell: ({ row }) => {
      if (row.original.banned) {
        return <Badge variant="destructive">חסום</Badge>;
      }

      return <Badge variant="default">פעיל</Badge>;
    },
    sortingFn: (a, b) => Number(b.original.banned) - Number(a.original.banned),
  },
  {
    id: "status",
    header: "סטטוס",
    accessorFn: (row) => (row.activeSessions > 0 ? "מחובר" : "מנותק"),
    cell: ({ row }) => {
      const isActive = row.original.activeSessions > 0;
      return (
        <Badge variant={isActive ? "default" : "outline"}>
          {isActive ? "מחובר" : "מנותק"}
        </Badge>
      );
    },
    sortingFn: (a, b) => {
      const aActive = a.original.activeSessions > 0;
      const bActive = b.original.activeSessions > 0;
      return Number(bActive) - Number(aActive);
    },
  },
  {
    accessorKey: "activeSessions",
    header: "סשנים פעילים",
  },
  {
    accessorKey: "totalSessions",
    header: "סה\"כ סשנים",
  },
  {
    accessorKey: "banExpiresAt",
    header: "תוקף חסימה",
    cell: ({ row }) =>
      row.original.banExpiresAt ? formatDateTime(row.original.banExpiresAt) : "—",
  },
  {
    accessorKey: "createdAt",
    header: "נוצר בתאריך",
    cell: ({ row }) => formatDateTime(row.original.createdAt),
  },
  {
    accessorKey: "lastActiveAt",
    header: "פעילות אחרונה",
    cell: ({ row }) => formatDateTime(row.original.lastActiveAt),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex justify-end">
        <UserRowActions user={row.original} />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
];
