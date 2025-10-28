"use client";

import { DataTable } from "@/components/ui/data-table";
import type { AdminUserRow } from "@/lib/admin-data";

import { userColumns } from "./user-columns";

export function UserTable({
  data,
  enableSearch = true,
}: {
  data: AdminUserRow[];
  enableSearch?: boolean;
}) {
  return (
    <DataTable
      columns={userColumns}
      data={data}
      searchKey={enableSearch ? "name" : undefined}
      searchPlaceholder={
        enableSearch ? "חיפוש לפי שם או אימייל" : undefined
      }
    />
  );
}
