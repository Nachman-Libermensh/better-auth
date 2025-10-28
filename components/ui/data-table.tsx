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

  return (
    <div className={cn("space-y-4", className)} dir={direction}>
      {searchColumn ? (
        <Input
          value={(searchColumn.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            searchColumn.setFilterValue(event.target.value)
          }
          placeholder={searchPlaceholder ?? "חיפוש"}
          className={cn(
            "max-w-sm",
            direction === "rtl" && "text-right placeholder:text-right"
          )}
          dir={direction}
        />
      ) : null}

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
                      return (
                        <TableHead
                          key={header.id}
                          className={cn(
                            "sticky top-0 bg-background/95 text-sm font-medium",
                            direction === "rtl"
                              ? "text-right"
                              : "text-left"
                          )}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
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
