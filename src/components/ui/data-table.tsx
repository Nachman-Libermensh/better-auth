"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import {
  DataTableColumnHeader,
  type DataTableColumnMeta,
} from "./data-table-column-header";
import { ScrollArea } from "./scroll-area";

export type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  className?: string;
  emptyMessage?: string;
  scrollAreaClassName?: string;
  direction?: "ltr" | "rtl";
};

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder,
  className,
  emptyMessage = "לא נמצאו נתונים.",
  scrollAreaClassName,
  direction = "rtl",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const searchColumn = searchKey ? table.getColumn(searchKey) : null;
  const canResetFilters = columnFilters.length > 0;
  const canResetSorting = sorting.length > 0;
  const hasFilterableColumns = table.getAllLeafColumns().some((column) => {
    if (!column.getCanFilter()) return false;
    const meta = column.columnDef.meta as DataTableColumnMeta | undefined;
    return Boolean(meta?.filterVariant);
  });
  const hasSortableColumns = table
    .getAllLeafColumns()
    .some((column) => column.getCanSort());

  return (
    <div className={cn("space-y-4", className)} dir={direction}>
      {(searchColumn || hasFilterableColumns || hasSortableColumns) && (
        <div className="flex flex-wrap items-center gap-2">
          {searchColumn ? (
            <Input
              value={(searchColumn.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                searchColumn.setFilterValue(event.target.value)
              }
              placeholder={searchPlaceholder ?? "חיפוש"}
              className={cn(
                "min-w-[220px] flex-1",
                direction === "rtl" && "text-right placeholder:text-right"
              )}
              dir={direction}
            />
          ) : null}
          <div className="flex items-center gap-2 [margin-inline-start:auto]">
            {hasFilterableColumns ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.resetColumnFilters()}
                disabled={!canResetFilters}
              >
                איפוס מסננים
              </Button>
            ) : null}
            {hasSortableColumns ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.resetSorting()}
                disabled={!canResetSorting}
              >
                איפוס מיונים
              </Button>
            ) : null}
          </div>
        </div>
      )}

      <div className="rounded-md border bg-background">
        <ScrollArea
          className={cn("w-full", scrollAreaClassName)}
          dir={direction}
        >
          <div className="min-w-full">
            <Table
              className={cn(
                "min-w-full",
                direction === "rtl" && "[&_td]:text-right [&_th]:text-right"
              )}
            >
              <TableHeader className="sticky top-0 z-20 bg-background">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-background">
                    {headerGroup.headers.map((header) => {
                      const rawHeader = header.column.columnDef.header;
                      const meta =
                        header.column.columnDef.meta as
                          | DataTableColumnMeta
                          | undefined;
                      const title =
                        typeof rawHeader === "string"
                          ? rawHeader
                          : meta?.title ?? header.column.id;
                      const rendered = header.isPlaceholder
                        ? null
                        : flexRender(rawHeader, header.getContext());
                      return (
                        <TableHead
                          key={header.id}
                          className={cn(
                            "sticky top-0 bg-background/95 px-0 text-sm font-medium text-center"
                          )}
                        >
                          {rendered ? (
                            <DataTableColumnHeader
                              column={header.column}
                              title={title}
                              direction={direction}
                            >
                              {rendered}
                            </DataTableColumnHeader>
                          ) : null}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            direction === "rtl" ? "text-right" : "text-left"
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
