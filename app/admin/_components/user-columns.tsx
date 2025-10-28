"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import type { AdminUserRow } from "@/lib/admin-data";

import { UserRowActions } from "./user-row-actions";

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
      const fallbackSource = name || email || "";
      const initials = fallbackSource
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0] ?? "")
        .join("")
        .slice(0, 2)
        .toUpperCase();
      const fallbackText = initials || (email?.[0] ?? "?").toUpperCase();

      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            {image ? (
              <AvatarImage src={image} alt={name ?? email ?? ""} />
            ) : null}
            <AvatarFallback>{fallbackText}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="font-medium">{name}</div>
            <div className="text-muted-foreground text-xs">{email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "תפקיד",
    cell: ({ row }) => {
      const role = row.original.role;
      const variant = role === "ADMIN" ? "default" : "secondary";
      const label = role === "ADMIN" ? "מנהל" : "משתמש";
      return <Badge variant={variant}>{label}</Badge>;
    },
  },
  {
    id: "accountStatus",
    header: "מצב חשבון",
    cell: ({ row }) => {
      if (row.original.isDeleted) {
        return <Badge variant="destructive">נמחק</Badge>;
      }

      const isInactive = row.original.status === "INACTIVE";
      return (
        <Badge variant={isInactive ? "outline" : "default"}>
          {isInactive ? "לא פעיל" : "פעיל"}
        </Badge>
      );
    },
    sortingFn: (a, b) => {
      const aWeight = a.original.isDeleted
        ? 0
        : a.original.status === "ACTIVE"
        ? 2
        : 1;
      const bWeight = b.original.isDeleted
        ? 0
        : b.original.status === "ACTIVE"
        ? 2
        : 1;
      return bWeight - aWeight;
    },
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
