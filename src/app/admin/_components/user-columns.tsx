"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import type { DataTableColumnMeta } from "@/components/ui/data-table-column-header";
import { formatDateTime } from "@/lib/format";
import type { AdminUserRow } from "@/lib/admin-data";

import { UserRowActions } from "./user-row-actions";
import { UserIdentity } from "./user-identity";

export const userColumns: ColumnDef<AdminUserRow>[] = [
  {
    accessorKey: "name",
    header: "שם",
    meta: {
      title: "שם",
      filterVariant: "text",
      filterPlaceholder: "חיפוש לפי שם או אימייל",
    } satisfies DataTableColumnMeta,
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
    meta: {
      title: "תפקיד",
      filterVariant: "options",
      filterOptions: [
        { label: "מנהל", value: "admin" },
        { label: "משתמש", value: "user" },
      ],
    } satisfies DataTableColumnMeta,
    filterFn: (row, columnId, filterValue) => {
      const selected = Array.isArray(filterValue)
        ? filterValue
        : filterValue
          ? [filterValue]
          : [];
      if (!selected.length) return true;
      const value = String(row.getValue(columnId));
      return selected.map(String).includes(value);
    },
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
    meta: {
      title: "חסימה",
      filterVariant: "options",
      filterOptions: [
        { label: "חסום", value: "banned" },
        { label: "פעיל", value: "active" },
      ],
    } satisfies DataTableColumnMeta,
    filterFn: (row, _columnId, filterValue) => {
      const selected = Array.isArray(filterValue)
        ? filterValue
        : filterValue
          ? [filterValue]
          : [];
      if (!selected.length) return true;
      const value = row.original.banned ? "banned" : "active";
      return selected.map(String).includes(value);
    },
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
    meta: {
      title: "סטטוס",
      filterVariant: "options",
      filterOptions: [
        { label: "מחובר", value: "מחובר" },
        { label: "מנותק", value: "מנותק" },
      ],
    } satisfies DataTableColumnMeta,
    filterFn: (row, columnId, filterValue) => {
      const selected = Array.isArray(filterValue)
        ? filterValue
        : filterValue
          ? [filterValue]
          : [];
      if (!selected.length) return true;
      const value = String(row.getValue(columnId));
      return selected.map(String).includes(value);
    },
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
    meta: {
      title: "סשנים פעילים",
    } satisfies DataTableColumnMeta,
  },
  {
    accessorKey: "totalSessions",
    header: "סה\"כ סשנים",
    meta: {
      title: "סה\"כ סשנים",
    } satisfies DataTableColumnMeta,
  },
  {
    accessorKey: "banExpiresAt",
    header: "תוקף חסימה",
    meta: {
      title: "תוקף חסימה",
    } satisfies DataTableColumnMeta,
    cell: ({ row }) =>
      row.original.banExpiresAt ? formatDateTime(row.original.banExpiresAt) : "—",
  },
  {
    accessorKey: "createdAt",
    header: "נוצר בתאריך",
    meta: {
      title: "נוצר בתאריך",
    } satisfies DataTableColumnMeta,
    cell: ({ row }) => formatDateTime(row.original.createdAt),
  },
  {
    accessorKey: "lastActiveAt",
    header: "פעילות אחרונה",
    meta: {
      title: "פעילות אחרונה",
    } satisfies DataTableColumnMeta,
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
