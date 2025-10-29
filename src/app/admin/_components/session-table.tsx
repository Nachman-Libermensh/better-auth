"use client";

import { DataTable } from "@/components/ui/data-table";
import type { AdminSessionRow } from "@/lib/admin-data";

import { sessionColumns } from "./session-columns";

export function SessionTable({
  data,
  enableSearch = true,
  className,
  scrollAreaClassName,
}: {
  data: AdminSessionRow[];
  enableSearch?: boolean;
  className?: string;
  scrollAreaClassName?: string;
}) {
  return (
    <DataTable
      columns={sessionColumns}
      data={data}
      searchKey={enableSearch ? "userName" : undefined}
      searchPlaceholder={
        enableSearch ? "חיפוש לפי משתמש או סטטוס" : undefined
      }
      className={className}
      scrollAreaClassName={scrollAreaClassName}
    />
  );
}
