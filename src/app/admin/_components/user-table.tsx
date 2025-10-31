"use client";

import { DataGrid } from "@/components/ui/data-grid";
import type { AdminUserRow } from "@/lib/admin-data";

import { userColumns } from "./user-columns";

export function UserTable({
  data,
  enableSearch = true,
  className,
  scrollAreaClassName,
}: {
  data: AdminUserRow[];
  enableSearch?: boolean;
  className?: string;
  scrollAreaClassName?: string;
}) {
  return (
    <DataGrid
      columns={userColumns}
      data={data}
      className={className}
      scrollAreaClassName={scrollAreaClassName}
      showHeaderActions={enableSearch}
      showSearch={enableSearch}
      rowId="id"
      noDataMessage="לא נמצאו משתמשים"
      initialSorting={[{ id: "createdAt", desc: true }]}
    />
  );
}
