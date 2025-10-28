"use client";

import { DataTable } from "@/components/ui/data-table";
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
    <DataTable
      columns={userColumns}
      data={data}
      searchKey={enableSearch ? "name" : undefined}
      searchPlaceholder={
        enableSearch ? "חיפוש לפי שם או אימייל" : undefined
      }
      className={className}
      scrollAreaClassName={scrollAreaClassName}
    />
  );
}
