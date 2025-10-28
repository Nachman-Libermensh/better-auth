"use client";

import { DataTable } from "@/components/ui/data-table";
import type { AdminSessionRow } from "@/lib/admin-data";

import { sessionColumns } from "./session-columns";

export function SessionTable({
  data,
  enableSearch = true,
}: {
  data: AdminSessionRow[];
  enableSearch?: boolean;
}) {
  return (
    <DataTable
      columns={sessionColumns}
      data={data}
      searchKey={enableSearch ? "userName" : undefined}
      searchPlaceholder={
        enableSearch ? "חיפוש לפי שם משתמש" : undefined
      }
    />
  );
}
