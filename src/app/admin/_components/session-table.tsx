"use client";

import { DataGrid } from "@/components/ui/data-grid";
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
    <DataGrid
      columns={sessionColumns}
      data={data}
      className={className}
      scrollAreaClassName={scrollAreaClassName}
      showHeaderActions={enableSearch}
      showSearch={enableSearch}
      rowId="id"
      noDataMessage="לא נמצאו סשנים"
      initialSorting={[{ id: "createdAt", desc: true }]}
    />
  );
}
