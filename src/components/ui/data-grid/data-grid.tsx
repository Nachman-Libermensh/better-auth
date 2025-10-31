"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  ExpandedState,
  Row,
  RowSelectionState,
  SortingState,
  Table,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format, formatDistanceToNow } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table as UiTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { DataGridLoader } from "./data-grid-loader";
import {
  DataGridBooleanOptions,
  DataGridColumnDef,
  DataGridColumnMeta,
  DataGridOptionItem,
  DataGridProps,
  DataGridRowAction,
} from "./types";

import { ArrowDown, ArrowUp, Filter, MoreHorizontal } from "lucide-react";
import Image from "next/image";

const DEFAULT_EMPTY_VALUE = "-";

const BOOLEAN_DEFAULTS: Required<DataGridBooleanOptions> = {
  trueLabel: "כן",
  falseLabel: "לא",
  trueVariant: "default",
  falseVariant: "secondary",
  emptyLabel: DEFAULT_EMPTY_VALUE,
};

const isOptionValueEqual = (
  optionValue: string | number | boolean,
  candidate: unknown
) => {
  if (typeof candidate === "string" || typeof candidate === "number") {
    return String(optionValue) === String(candidate);
  }
  if (typeof candidate === "boolean") {
    return optionValue === candidate;
  }
  return optionValue === candidate;
};

const isSelectableOptionValue = (
  value: unknown
): value is string | number | boolean =>
  typeof value === "string" || typeof value === "number" || typeof value === "boolean";

const isSameFilterValue = (a: unknown, b: unknown) => {
  if (isSelectableOptionValue(a) && isSelectableOptionValue(b)) {
    return isOptionValueEqual(a, b);
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }

    return a.every((item, index) => isSameFilterValue(item, b[index]));
  }

  return Object.is(a, b);
};

const findOptionItem = (
  value: unknown,
  items: DataGridOptionItem[] | undefined
) => {
  if (!items?.length) return undefined;
  return items.find((item) => isOptionValueEqual(item.value, value));
};

const toBooleanValue = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1";
  }
  return Boolean(value);
};

const getBooleanOptions = (
  meta?: Pick<DataGridColumnMeta, "options" | "emptyValue">
) => {
  const options = meta?.options?.boolean as DataGridBooleanOptions | undefined;
  return {
    trueLabel: options?.trueLabel ?? BOOLEAN_DEFAULTS.trueLabel,
    falseLabel: options?.falseLabel ?? BOOLEAN_DEFAULTS.falseLabel,
    trueVariant: options?.trueVariant ?? BOOLEAN_DEFAULTS.trueVariant,
    falseVariant: options?.falseVariant ?? BOOLEAN_DEFAULTS.falseVariant,
    emptyLabel:
      options?.emptyLabel ?? meta?.emptyValue ?? BOOLEAN_DEFAULTS.emptyLabel,
  } satisfies Required<DataGridBooleanOptions>;
};

interface DataGridColumnHeaderProps<TData> {
  column: Column<TData, unknown>;
  columnDef: DataGridColumnDef<TData>;
  filterOptions: Array<{ label: string; value: unknown }> | undefined;
  meta: DataGridColumnMeta<TData>;
}

const formatNumber = (value: number, options?: DataGridColumnMeta["options"]) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return DEFAULT_EMPTY_VALUE;
  }

  const formatType = options?.format ?? "number";
  if (formatType === "currency") {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: options?.currency ?? "ILS",
      maximumFractionDigits: 2,
    }).format(value);
  }

  if (formatType === "percentage") {
    return `${value}%`;
  }

  if (formatType === "duration") {
    return `${value} ms`;
  }

  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);
};

const formatDate = (
  value: string | Date,
  type: "date" | "datetime",
  options?: DataGridColumnMeta["options"]
) => {
  if (!value) {
    return DEFAULT_EMPTY_VALUE;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return DEFAULT_EMPTY_VALUE;
  }

  const formatType = options?.dateFormat ?? (type === "date" ? "short" : "long");

  if (formatType === "relative") {
    return formatDistanceToNow(date, { addSuffix: true });
  }

  if (type === "datetime") {
    return format(date, formatType === "long" ? "dd/MM/yyyy HH:mm" : "dd/MM/yy HH:mm");
  }

  return format(date, formatType === "long" ? "dd/MM/yyyy" : "dd/MM/yy");
};

const getBooleanLabel = (
  value: boolean | null | undefined,
  meta?: Pick<DataGridColumnMeta, "options" | "emptyValue">
) => {
  if (value === null || value === undefined) {
    return getBooleanOptions(meta).emptyLabel;
  }

  const booleanOptions = getBooleanOptions(meta);
  return value ? booleanOptions.trueLabel : booleanOptions.falseLabel;
};

const getFilterLabelForValue = <TData,>(
  value: unknown,
  column: DataGridColumnDef<TData>,
  meta: DataGridColumnMeta<TData>
) => {
  if (value === undefined || value === null) {
    return meta.emptyValue ?? DEFAULT_EMPTY_VALUE;
  }

  const labels = meta.options?.labels as Record<string, string> | undefined;
  const stringValue = String(value);

  switch (column.type) {
    case "boolean": {
      return getBooleanLabel(toBooleanValue(value), meta);
    }
    case "lookup":
    case "lookup-multi":
    case "options":
    case "badge": {
      if (column.type === "options") {
        const optionItem = findOptionItem(
          value,
          meta.options?.optionItems as DataGridOptionItem[] | undefined
        );
        if (optionItem) {
          return optionItem.label;
        }
      }
      return labels?.[stringValue] ?? stringValue;
    }
    default:
      return stringValue;
  }
};

const deriveFilterOptions = <TData extends Record<string, unknown>>(
  data: TData[],
  column: DataGridColumnDef<TData>,
  meta: DataGridColumnMeta<TData>
): Array<{ label: string; value: unknown }> => {
  const uniqueValues = new Map<unknown, string>();

  if (column.type === "options") {
    const optionItems = meta.options?.optionItems as
      | DataGridOptionItem[]
      | undefined;
    if (optionItems?.length) {
      return optionItems.map((option) => ({
        label: option.label,
        value: option.value,
      }));
    }
  }

  data.forEach((item) => {
    const rawValue = (item as Record<string, unknown>)[column.accessorKey as string];
    if (rawValue === undefined || rawValue === null) {
      return;
    }

    if (Array.isArray(rawValue)) {
      rawValue.forEach((entry) => {
        if (!uniqueValues.has(entry)) {
          uniqueValues.set(entry, getFilterLabelForValue(entry, column, meta));
        }
      });
      return;
    }

    if (!uniqueValues.has(rawValue)) {
      uniqueValues.set(rawValue, getFilterLabelForValue(rawValue, column, meta));
    }
  });

  if (column.type === "boolean") {
    const booleanOptions = getBooleanOptions(meta);
    if (!uniqueValues.has(true)) {
      uniqueValues.set(true, booleanOptions.trueLabel);
    }
    if (!uniqueValues.has(false)) {
      uniqueValues.set(false, booleanOptions.falseLabel);
    }
  }

  return Array.from(uniqueValues.entries()).map(([value, label]) => ({ label, value }));
};

const filterFns = {
  text: <TData,>(row: Row<TData>, columnId: string, filterValue: string) => {
    const value = row.getValue<unknown>(columnId);
    if (!filterValue) return true;
    return String(value ?? "").toLowerCase().includes(filterValue.toLowerCase());
  },
  exact: <TData,>(row: Row<TData>, columnId: string, filterValue: unknown) => {
    if (filterValue === undefined || filterValue === null || filterValue === "") {
      return true;
    }
    const value = row.getValue<unknown>(columnId);
    return value === filterValue;
  },
  oneOf: <TData,>(row: Row<TData>, columnId: string, filterValue: unknown[]) => {
    const candidates = Array.isArray(filterValue)
      ? filterValue
      : filterValue === undefined || filterValue === null || filterValue === ""
        ? []
        : [filterValue];

    if (!candidates.length) {
      return true;
    }
    const value = row.getValue<unknown>(columnId);

    if (Array.isArray(value)) {
      return value.some((item) =>
        candidates.some((candidate) => isSameFilterValue(candidate, item))
      );
    }

    return candidates.some((candidate) => isSameFilterValue(candidate, value));
  },
  range: <TData,>(row: Row<TData>, columnId: string, filterValue: { min?: number; max?: number }) => {
    if (!filterValue) return true;
    const value = row.getValue<unknown>(columnId);
    if (value === undefined || value === null) return false;
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return false;
    if (filterValue.min !== undefined && numericValue < filterValue.min) return false;
    if (filterValue.max !== undefined && numericValue > filterValue.max) return false;
    return true;
  },
  date: <TData,>(row: Row<TData>, columnId: string, filterValue: { from?: string; to?: string }) => {
    if (!filterValue) return true;
    const value = row.getValue<unknown>(columnId);
    if (!value) return false;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return false;
    if (filterValue.from && date < new Date(filterValue.from)) return false;
    if (filterValue.to && date > new Date(filterValue.to)) return false;
    return true;
  },
};

function getDefaultCellValue<TData>(
  row: Row<TData>,
  columnDef: DataGridColumnDef<TData>,
  meta: DataGridColumnMeta<TData>
): React.ReactNode {
  const value = row.getValue<unknown>(columnDef.accessorKey as string);
  const options = meta.options;
  const labels = options?.labels as Record<string, string> | undefined;
  const badgeVariants = options?.variants as
    | Record<
        string,
        "default" | "secondary" | "destructive" | "outline"
      >
    | undefined;
  const badgeDefaultVariant = options?.variant as
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | undefined;
  const booleanOptions = getBooleanOptions(meta);

  switch (columnDef.type) {
    case "image": {
      if (!value) return meta.emptyValue ?? DEFAULT_EMPTY_VALUE;
      return (
        <Image
          src={String(value)}
          alt={meta.originalColumnDef.header}
          width={40}
          height={40}
          className="h-10 w-10 rounded-md object-cover"
        />
      );
    }
    case "text-long": {
      return (
        <p className="line-clamp-3 whitespace-pre-line text-sm text-muted-foreground">
          {value ?? meta.emptyValue ?? DEFAULT_EMPTY_VALUE}
        </p>
      );
    }
    case "text-copy": {
      return value ? (
        <div className="flex items-center gap-2">
          <span className="truncate text-sm" title={String(value)}>
            {value}
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => navigator.clipboard.writeText(String(value))}
          >
            <span className="sr-only">העתקה</span>
            ⧉
          </Button>
        </div>
      ) : (
        meta.emptyValue ?? DEFAULT_EMPTY_VALUE
      );
    }
    case "lookup": {
      if (!value) return meta.emptyValue ?? DEFAULT_EMPTY_VALUE;
      if (typeof value === "string" || typeof value === "number") {
        const lookupLabel = labels?.[String(value)] ?? String(value);
        return <span>{lookupLabel}</span>;
      }
      return value;
    }
    case "lookup-multi": {
      if (!value || !Array.isArray(value) || value.length === 0) {
        return meta.emptyValue ?? DEFAULT_EMPTY_VALUE;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((item) => (
            <Badge key={String(item)} variant="secondary">
              {labels?.[String(item)] ?? item}
            </Badge>
          ))}
        </div>
      );
    }
    case "number":
    case "currency": {
      if (value === null || value === undefined) {
        return meta.emptyValue ?? DEFAULT_EMPTY_VALUE;
      }
      return formatNumber(Number(value), options);
    }
    case "date":
    case "datetime": {
      if (!value) return meta.emptyValue ?? DEFAULT_EMPTY_VALUE;
      return formatDate(value, columnDef.type, options);
    }
    case "boolean": {
      if (value === null || value === undefined) {
        return booleanOptions.emptyLabel;
      }
      const boolValue = toBooleanValue(value);
      return (
        <Badge variant={boolValue ? booleanOptions.trueVariant : booleanOptions.falseVariant}>
          {boolValue ? booleanOptions.trueLabel : booleanOptions.falseLabel}
        </Badge>
      );
    }
    case "options": {
      if (value === null || value === undefined || value === "") {
        return meta.emptyValue ?? DEFAULT_EMPTY_VALUE;
      }
      const optionItems = meta.options?.optionItems as
        | DataGridOptionItem[]
        | undefined;
      const optionItem = findOptionItem(value, optionItems);
      const resolvedLabel =
        optionItem?.label ?? labels?.[String(value)] ?? String(value);
      const optionDisplay = (meta.options?.optionDisplay as
        | "badge"
        | "text"
        | undefined) ?? (optionItem?.variant ? "badge" : "text");

      if (optionDisplay === "badge") {
        const variant =
          optionItem?.variant ??
          badgeVariants?.[String(value)] ??
          badgeDefaultVariant ??
          "secondary";
        return (
          <Badge
            variant={variant}
            className={cn("inline-flex items-center gap-1", options?.className)}
          >
            {optionItem?.icon ? <span className="shrink-0">{optionItem.icon}</span> : null}
            <span>{resolvedLabel}</span>
          </Badge>
        );
      }

      return (
        <span className="inline-flex items-center gap-1">
          {optionItem?.icon ? (
            <span className="shrink-0 text-muted-foreground">{optionItem.icon}</span>
          ) : null}
          <span>{resolvedLabel}</span>
        </span>
      );
    }
    case "badge": {
      if (!value) return meta.emptyValue ?? DEFAULT_EMPTY_VALUE;
      const variant =
        badgeVariants?.[String(value)] ?? badgeDefaultVariant ?? "secondary";
      return (
        <Badge variant={variant} className={options?.className}>
          {labels?.[String(value)] ?? String(value)}
        </Badge>
      );
    }
    default:
      return value ?? meta.emptyValue ?? DEFAULT_EMPTY_VALUE;
  }
}

function ColumnFilterInput<TData>({
  column,
  columnDef,
  filterOptions,
}: DataGridColumnHeaderProps<TData>) {
  if (columnDef.enableFiltering === false) {
    return null;
  }

  const filterValue = column.getFilterValue();

  const renderOptionsCommand = () => {
    const optionsList = filterOptions ?? [];

    const normalizedValue = Array.isArray(filterValue)
      ? filterValue
      : filterValue === undefined || filterValue === null || filterValue === ""
        ? []
        : [filterValue];

    const handleToggle = (value: unknown) => {
      const exists = normalizedValue.some((item) => isSameFilterValue(item, value));
      const next = exists
        ? normalizedValue.filter((item) => !isSameFilterValue(item, value))
        : [...normalizedValue, value];

      if (!next.length) {
        column.setFilterValue(undefined);
        return;
      }

      const includesAll =
        optionsList.length > 0 &&
        optionsList.every((option) => next.some((item) => isSameFilterValue(item, option.value)));

      column.setFilterValue(includesAll ? undefined : next);
    };

    const hasSelections = normalizedValue.length > 0;
    const isAllSelected =
      !hasSelections ||
      (optionsList.length > 0 &&
        optionsList.every((option) =>
          normalizedValue.some((item) => isSameFilterValue(item, option.value))
        ));

    return (
      <div className="space-y-2" dir="rtl">
        <Command className="rounded-lg border">
          <CommandInput placeholder="חיפוש אפשרויות" />
          <CommandList>
            <CommandEmpty>לא נמצאו אפשרויות</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="all"
                onSelect={() => column.setFilterValue(undefined)}
                className="flex items-center justify-between gap-2"
              >
                <span className="flex-1 text-right">כל האפשרויות</span>
                <Checkbox checked={isAllSelected} className="pointer-events-none" readOnly />
              </CommandItem>
              {optionsList.map((option) => {
                const isSelected = normalizedValue.some((item) =>
                  isSameFilterValue(item, option.value)
                );
                return (
                  <CommandItem
                    key={String(option.value)}
                    value={String(option.label)}
                    onSelect={() => handleToggle(option.value)}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="flex-1 text-right">{option.label}</span>
                    <Checkbox checked={isSelected} className="pointer-events-none" readOnly />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    );
  };

  switch (columnDef.type) {
    case "text":
    case "text-long":
    case "text-copy":
    case "badge":
    case "lookup":
    case "options": {
      return renderOptionsCommand();
    }
    case "lookup-multi": {
      return renderOptionsCommand();
    }
    case "boolean": {
      return renderOptionsCommand();
    }
    case "number":
    case "currency": {
      const rangeValue =
        (filterValue as { min?: number; max?: number }) ?? ({} as { min?: number; max?: number });
      return (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="מ-"
            value={rangeValue.min ?? ""}
            onChange={(event) =>
              column.setFilterValue({ ...rangeValue, min: event.target.value ? Number(event.target.value) : undefined })
            }
            className="h-8 w-20"
          />
          <Input
            type="number"
            placeholder="עד"
            value={rangeValue.max ?? ""}
            onChange={(event) =>
              column.setFilterValue({ ...rangeValue, max: event.target.value ? Number(event.target.value) : undefined })
            }
            className="h-8 w-20"
          />
        </div>
      );
    }
    case "date":
    case "datetime": {
      const rangeValue =
        (filterValue as { from?: string; to?: string }) ?? ({} as { from?: string; to?: string });
      return (
        <div className="flex items-center gap-2">
          <Input
            type={columnDef.type === "date" ? "date" : "datetime-local"}
            value={rangeValue.from ?? ""}
            onChange={(event) =>
              column.setFilterValue({ ...rangeValue, from: event.target.value || undefined })
            }
            className="h-8"
          />
          <Input
            type={columnDef.type === "date" ? "date" : "datetime-local"}
            value={rangeValue.to ?? ""}
            onChange={(event) =>
              column.setFilterValue({ ...rangeValue, to: event.target.value || undefined })
            }
            className="h-8"
          />
        </div>
      );
    }
    default:
      return null;
  }
}

function DataGridColumnHeader<TData>({
  column,
  columnDef,
  filterOptions,
  meta,
}: DataGridColumnHeaderProps<TData>) {
  const sorted = column.getIsSorted();
  const filterValue = column.getFilterValue();
  const hasFilterValue = Array.isArray(filterValue)
    ? filterValue.length > 0
    : filterValue !== undefined && filterValue !== null && filterValue !== "";
  const canFilter = columnDef.enableFiltering !== false && column.getCanFilter();
  const canSort = column.getCanSort();
  const canInteract = canFilter || canSort;

  const handleSortToggle = (event?: React.MouseEvent) => {
    if (!canSort) return;
    event?.preventDefault();
    event?.stopPropagation();

    if (!sorted) {
      column.toggleSorting(false);
      return;
    }

    if (sorted === "asc") {
      column.toggleSorting(true);
      return;
    }

    column.clearSorting();
  };

  const renderSortIndicator = () => {
    if (sorted === "asc") {
      return <ArrowUp className="h-3.5 w-3.5 text-primary" />;
    }

    if (sorted === "desc") {
      return <ArrowDown className="h-3.5 w-3.5 text-primary" />;
    }

    return null;
  };

  if (!canInteract) {
    return (
      <div className="flex items-center justify-center text-center">
        <span className="text-sm font-medium">{columnDef.header}</span>
      </div>
    );
  }

  const headerLabel = (
    <div className="flex items-center justify-center gap-1">
      {canSort ? (
        <button
          type="button"
          onClick={handleSortToggle}
          className={cn(
            "flex items-center gap-1 text-sm font-medium",
            canSort ? "cursor-pointer hover:text-primary" : "cursor-default"
          )}
        >
          <span>{columnDef.header}</span>
          {renderSortIndicator()}
        </button>
      ) : (
        <span className="text-sm font-medium">{columnDef.header}</span>
      )}
    </div>
  );

  const tooltipLabel =
    typeof columnDef.header === "string"
      ? `סינון ${columnDef.header}`
      : "סינון העמודה";

  return (
    <div className="flex items-center justify-center gap-1">
      {headerLabel}
      {canFilter ? (
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant={hasFilterValue ? "destructive" : "ghost"}
                  size="icon"
                  className="h-8 w-8 p-0 text-muted-foreground"
                  onClick={(event) => event.stopPropagation()}
                  aria-pressed={hasFilterValue}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent dir="rtl" sideOffset={8}>
              {tooltipLabel}
            </TooltipContent>
          </Tooltip>
          <PopoverContent align="center" className="w-80 space-y-4" dir="rtl" sideOffset={8}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{columnDef.header}</span>
              <div className="flex items-center gap-2">
                {sorted ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => column.clearSorting()}
                  >
                    איפוס מיון
                  </Button>
                ) : null}
                {hasFilterValue ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => column.setFilterValue(undefined)}
                  >
                    איפוס סינון
                  </Button>
                ) : null}
              </div>
            </div>
            {canSort ? (
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground">אפשרויות מיון</span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={sorted === "asc" ? "default" : "outline"}
                    size="sm"
                    className="h-8 flex-1"
                    onClick={() => {
                      if (sorted !== "asc") {
                        column.toggleSorting(false);
                      }
                    }}
                  >
                    מיון עולה
                  </Button>
                  <Button
                    type="button"
                    variant={sorted === "desc" ? "default" : "outline"}
                    size="sm"
                    className="h-8 flex-1"
                    onClick={() => {
                      if (sorted !== "desc") {
                        column.toggleSorting(true);
                      }
                    }}
                  >
                    מיון יורד
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 flex-1"
                    onClick={() => column.clearSorting()}
                    disabled={!sorted}
                  >
                    איפוס
                  </Button>
                </div>
              </div>
            ) : null}
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">אפשרויות סינון</span>
              <ColumnFilterInput
                column={column}
                columnDef={columnDef}
                filterOptions={filterOptions}
                meta={meta}
              />
            </div>
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
  );
}

function getRowClassName<TData>(
  row: Row<TData>,
  rowClassName?: DataGridProps<TData>["rowClassName"]
) {
  if (!rowClassName) return undefined;
  const classNameValue = typeof rowClassName === "function" ? rowClassName(row) : rowClassName;
  if (typeof classNameValue === "string") {
    return classNameValue;
  }
  if (typeof classNameValue === "function") {
    return classNameValue(row.original, true, "");
  }
  return undefined;
}

function getCellClassName<TData>(row: Row<TData>, column?: DataGridColumnDef<TData>) {
  if (!column || !column.cellClassName) return undefined;
  const classNameValue =
    typeof column.cellClassName === "function"
      ? column.cellClassName(row)
      : column.cellClassName;
  if (typeof classNameValue === "string") {
    return classNameValue;
  }
  if (typeof classNameValue === "function") {
    return classNameValue(row.original, true, "");
  }
  return undefined;
}

function getHeaderClassName<TData>(column?: DataGridColumnDef<TData>) {
  if (!column || !column.headerClassName) return undefined;
  if (typeof column.headerClassName === "string") {
    return column.headerClassName;
  }
  if (typeof column.headerClassName === "function") {
    const value = column.headerClassName(column);
    if (typeof value === "string") {
      return value;
    }
    if (typeof value === "function") {
      return value(column, true, "");
    }
  }
  return undefined;
}

const getMeta = <TData,>(column: DataGridColumnDef<TData>): DataGridColumnMeta<TData> => ({
  originalColumnDef: column,
  align: column.meta?.align,
  emptyValue: column.meta?.emptyValue ?? DEFAULT_EMPTY_VALUE,
  lookupKey: column.meta?.lookupKey,
  sticky: column.sticky === true ? "right" : (column.sticky as "left" | "right" | undefined),
  options: column.meta?.options,
  type: column.type,
});

function buildRowActionCell<TData>(
  row: Row<TData>,
  actions: DataGridRowAction<TData>[],
  variant: "icon" | "popover"
) {
  if (!actions.length) return null;

  if (variant === "popover") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={(event) => event.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {actions.map((action, index) => {
            const disabled = typeof action.disabled === "function" ? action.disabled(row) : action.disabled;
            const icon =
              typeof action.icon === "function" ? action.icon(row) : action.icon;
            const label =
              typeof action.label === "function" ? action.label(row) : action.label;
            const key =
              typeof action.label === "string"
                ? action.label
                : `${action.actionType}-${index}`;
            return (
              <DropdownMenuItem
                key={key}
                onSelect={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  if (!disabled) {
                    action.onClick(row);
                  }
                }}
                className={cn(disabled && "pointer-events-none opacity-50", action.className)}
              >
                {icon ? <span className="mr-2 inline-flex items-center">{icon}</span> : null}
                {label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {actions.map((action, index) => {
        const disabled = typeof action.disabled === "function" ? action.disabled(row) : action.disabled;
        const icon =
          typeof action.icon === "function" ? action.icon(row) : action.icon;
        const label =
          typeof action.label === "function" ? action.label(row) : action.label;
        const key =
          typeof action.label === "string"
            ? action.label
            : `${action.actionType}-${index}`;
        return (
          <Button
            key={key}
            variant={action.variant ?? "ghost"}
            size="sm"
            disabled={disabled}
            className={cn("h-8", action.className)}
            onClick={(event) => {
              event.stopPropagation();
              if (!disabled) {
                action.onClick(row);
              }
            }}
          >
            {icon ? <span className="mr-2 inline-flex items-center">{icon}</span> : null}
            {label}
          </Button>
        );
      })}
    </div>
  );
}

interface UseDataGridColumnsProps<
  TData extends Record<string, unknown> = Record<string, unknown>,
> {
  columns: DataGridColumnDef<TData>[];
  data: TData[];
  showSelectCol: boolean;
  disableSelect?: (row: Row<TData>) => boolean;
  rowActions: DataGridRowAction<TData>[];
  rowActionsVariant: "icon" | "popover";
  rowActionsPosition: "left" | "right";
  rowActionsLabel?: string;
}

export function useDataGridColumns<
  TData extends Record<string, unknown> = Record<string, unknown>,
>({
  columns,
  data,
  showSelectCol,
  disableSelect,
  rowActions,
  rowActionsVariant,
  rowActionsPosition,
  rowActionsLabel,
}: UseDataGridColumnsProps<TData>): ColumnDef<TData, unknown>[] {
  return useMemo(() => {
    const baseColumns = columns.map((column) => {
      const meta = getMeta(column);
      const filterOptions = deriveFilterOptions(data, column, meta);

      return {
        id: column.id ?? (column.accessorKey as string),
        accessorKey: column.accessorKey as string,
        header: ({ column: tableColumn }: { column: Column<TData, unknown> }) => (
          <DataGridColumnHeader
            column={tableColumn}
            columnDef={column}
            filterOptions={filterOptions}
            meta={meta}
          />
        ),
        cell: ({ row }: { row: Row<TData> }) => {
          if (column.cell) {
            return column.cell(row.original);
          }
          return getDefaultCellValue(row, column, meta);
        },
        enableSorting: column.enableSorting ?? true,
        enableHiding: column.enableHiding ?? true,
        enableColumnFilter: column.enableFiltering ?? true,
        meta: {
          ...meta,
          dataGridColumn: column,
        },
        size: column.size,
        minSize: column.minSize,
        maxSize: column.maxSize,
        filterFn: (() => {
          switch (column.type) {
            case "text":
            case "text-long":
            case "text-copy":
            case "lookup":
            case "badge":
              return filterFns.oneOf;
            case "options":
              return filterFns.oneOf;
            case "lookup-multi":
              return filterFns.oneOf;
            case "boolean":
              return filterFns.exact;
            case "number":
            case "currency":
              return filterFns.range;
            case "date":
            case "datetime":
              return filterFns.date;
            default:
              return filterFns.oneOf;
          }
        })(),
      } satisfies ColumnDef<TData, unknown>;
    });

    const actionColumn: ColumnDef<TData, unknown> | null = rowActions.length
      ? {
          id: "__actions__",
          accessorKey: "__actions__",
          enableSorting: false,
          enableColumnFilter: false,
          enableHiding: false,
          enableResizing: false,
          size: rowActionsVariant === "icon" ? 80 : 160,
          header: () => (
            <span className="text-sm font-medium">{rowActionsLabel ?? "פעולות"}</span>
          ),
          cell: ({ row }) =>
            buildRowActionCell(row as Row<TData>, rowActions, rowActionsVariant),
          meta: {
            align: "center",
            sticky: rowActionsPosition,
          },
        }
      : null;

    const columnsWithSelection = showSelectCol
      ? [
          {
            id: "select",
            enableSorting: false,
            enableColumnFilter: false,
            header: ({ table }: { table: Table<TData> }) => (
              <Checkbox
                checked={
                  table.getIsAllPageRowsSelected() ||
                  (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) =>
                  table.toggleAllPageRowsSelected(Boolean(value))
                }
                aria-label="בחר הכל"
                onClick={(event) => event.stopPropagation()}
              />
            ),
            cell: ({ row }: { row: Row<TData> }) => (
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) =>
                  row.toggleSelected(Boolean(value))
                }
                aria-label="בחר שורה"
                disabled={disableSelect ? disableSelect(row) : false}
                onClick={(event) => event.stopPropagation()}
              />
            ),
            size: 40,
          } satisfies ColumnDef<TData, unknown>,
          ...baseColumns,
        ]
      : baseColumns;

    if (actionColumn) {
      return rowActionsPosition === "left"
        ? [actionColumn, ...columnsWithSelection]
        : [...columnsWithSelection, actionColumn];
    }

    return columnsWithSelection;
  }, [
    columns,
    data,
    disableSelect,
    rowActions,
    rowActionsLabel,
    rowActionsPosition,
    rowActionsVariant,
    showSelectCol,
  ]);
}

function DataGrid<TData extends Record<string, unknown> = Record<string, unknown>>({
  columns,
  data = [] as TData[],
  className,
  scrollAreaClassName,
  title,
  status = "success",
  noDataMessage = "לא נמצאו נתונים",
  noDataTitle,
  noDataActions,
  expandableRow,
  rowActions = [] as DataGridRowAction<TData>[],
  rowActionsVariant = "icon",
  rowActionsPosition = "right",
  rowActionsLabel = "פעולות",
  headerActions,
  headerActionsPosition = "right",
  onRowClick,
  showHeaderActions = true,
  showSearch = true,
  showPagination = true,
  showSelectCol = false,
  disableSelect,
  onSelectionChange,
  customPagination,
  rowId,
  rowClassName,
  variant = "default",
  initialColumnFilters,
  initialSorting,
  initialGlobalFilter,
  loaderVariant = "skeleton",
  loaderMessage,
  loaderRows = 6,
  onExportExcel,
  onResetFilters,
  errorTitle = "שגיאה בטעינת הנתונים",
  errorMessage = "אנא נסה שוב מאוחר יותר.",
  errorActions,
}: DataGridProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting ?? []);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    initialColumnFilters ?? []
  );
  const [globalFilter, setGlobalFilter] = useState(initialGlobalFilter ?? "");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const dataMemo = useMemo(() => data ?? [], [data]);
  const columnDefs = useDataGridColumns({
    columns,
    data: dataMemo,
    showSelectCol,
    disableSelect,
    rowActions,
    rowActionsVariant,
    rowActionsPosition,
    rowActionsLabel,
  });

  const table = useReactTable<TData>({
    data: dataMemo,
    columns: columnDefs,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
      expanded,
      columnVisibility,
    },
    enableRowSelection: showSelectCol,
    getRowId: rowId ? (row) => String(row[rowId]) : undefined,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    filterFns,
  });

  useEffect(() => {
    if (!onSelectionChange) return;
    const selectedRows = table
      .getSelectedRowModel()
      .rows.map((row) => row.original);
    onSelectionChange(selectedRows);
  }, [onSelectionChange, table, rowSelection]);

  const headerActionsList = headerActions?.(table) ?? [];

  const renderHeaderActions = headerActionsList.length ? (
    <div className="flex flex-wrap items-center gap-2">
      {headerActionsList.map((action) => {
        const disabled = typeof action.disabled === "function" ? action.disabled(table) : action.disabled;
        return (
          <Button
            key={action.label}
            variant={action.variant ?? "default"}
            onClick={action.onClick}
            disabled={disabled}
            className={action.className}
          >
            {action.icon ? <span className="mr-2 inline-flex items-center">{action.icon}</span> : null}
            {action.label}
          </Button>
        );
      })}
    </div>
  ) : null;

  const headerAlignmentClass =
    headerActionsPosition === "right"
      ? "items-end"
      : headerActionsPosition === "center"
        ? "items-center"
        : "items-start";

  const headerActionsSection = showHeaderActions ? (
    <div className={cn("flex flex-col gap-3", headerAlignmentClass)}>
      {title ? <h2 className="text-lg font-semibold">{title}</h2> : null}
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        {showSearch ? (
          <Input
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            placeholder="חיפוש בכל הטבלה"
            className="max-w-xs"
          />
        ) : (
          <span />
        )}
        <div className="flex flex-wrap items-center justify-end gap-2">
          {onExportExcel ? (
            <Button variant="outline" onClick={onExportExcel}>
              ייצוא לאקסל
            </Button>
          ) : null}
          {onResetFilters ? (
            <Button variant="ghost" onClick={onResetFilters}>
              איפוס פילטרים
            </Button>
          ) : null}
          {renderHeaderActions}
        </div>
      </div>
    </div>
  ) : null;

  if (status === "pending") {
    return (
      <div className="rounded-md border bg-background p-4">
        {headerActionsSection}
        <DataGridLoader
          columns={columns.length}
          rows={loaderRows}
          variant={loaderVariant}
          message={loaderMessage}
        />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="space-y-4">
        {headerActionsSection}
        <div className="rounded-md border bg-background p-8 text-center">
          <h2 className="text-lg font-semibold">{errorTitle}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
          {errorActions?.length ? (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {errorActions.map((action) => (
                <Button
                  key={action.label}
                  variant={action.variant ?? "default"}
                  onClick={action.onClick}
                  className="min-w-[120px]"
                >
                  {action.icon ? <span className="mr-2 inline-flex items-center">{action.icon}</span> : null}
                  {action.label}
                </Button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  const rows = table.getRowModel().rows;
  const totalPages = customPagination?.totalPages ?? table.getPageCount();
  const effectiveTotalPages = Math.max(totalPages, 1);
  const currentPage = customPagination?.currentPage ?? table.getState().pagination.pageIndex + 1;
  const onPageChangeHandler =
    customPagination?.onPageChange ?? ((page: number) => table.setPageIndex(page - 1));
  const canPrevious = currentPage > 1;
  const canNext = currentPage < effectiveTotalPages;

  return (
    <div
      className={cn(
        "space-y-4",
        variant === "minimal" && "border-none bg-transparent",
        className
      )}
    >
      {headerActionsSection}
      <div className="overflow-hidden rounded-md border bg-background">
        <ScrollArea className={cn("w-full", scrollAreaClassName)}>
          <UiTable className="min-w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const columnMeta = header.column.columnDef.meta as DataGridColumnMeta | undefined;
                    const column = columnMeta?.dataGridColumn as DataGridColumnDef | undefined;
                    const align = columnMeta?.align ?? column?.meta?.align ?? "right";
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          "bg-background text-sm font-medium",
                          align === "center"
                            ? "text-center"
                            : align === "left"
                              ? "text-left"
                              : "text-right",
                          getHeaderClassName(column)
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {rows.length ? (
                rows.map((row) => {
                  const expandedContent = expandableRow ? expandableRow(row) : null;
                  return (
                    <React.Fragment key={row.id}>
                      <TableRow
                        data-state={row.getIsSelected() && "selected"}
                        onClick={() => onRowClick?.(row)}
                        className={cn(onRowClick && "cursor-pointer", getRowClassName(row, rowClassName))}
                      >
                        {row.getVisibleCells().map((cell) => {
                          const columnMeta = cell.column.columnDef.meta as DataGridColumnMeta | undefined;
                          const column = columnMeta?.dataGridColumn as DataGridColumnDef | undefined;
                          const align = columnMeta?.align ?? column?.meta?.align ?? "right";
                          return (
                            <TableCell
                              key={cell.id}
                              className={cn(
                                align === "center"
                                  ? "text-center"
                                  : align === "left"
                                    ? "text-left"
                                    : "text-right",
                                getCellClassName(row, column)
                              )}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                      {expandedContent ? (
                        <TableRow className="bg-muted/40">
                          <TableCell colSpan={row.getVisibleCells().length}>{expandedContent}</TableCell>
                        </TableRow>
                      ) : null}
                    </React.Fragment>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={
                      columns.length +
                      (showSelectCol ? 1 : 0) +
                      (rowActions.length ? 1 : 0)
                    }
                    className="h-36 text-center"
                  >
                    <Empty className="border-none">
                      <EmptyHeader>
                        <EmptyTitle>{noDataTitle ?? noDataMessage}</EmptyTitle>
                        {noDataMessage ? (
                          <EmptyDescription>{noDataMessage}</EmptyDescription>
                        ) : null}
                      </EmptyHeader>
                      {noDataActions?.length ? (
                        <EmptyContent>
                          {noDataActions.map((action) => (
                            <Button
                              key={action.label}
                              variant={action.variant ?? "outline"}
                              onClick={action.onClick}
                              className="min-w-[120px]"
                            >
                              {action.icon ? (
                                <span className="mr-2 inline-flex items-center">{action.icon}</span>
                              ) : null}
                              {action.label}
                            </Button>
                          ))}
                        </EmptyContent>
                      ) : null}
                    </Empty>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </UiTable>
        </ScrollArea>
      </div>
      {showPagination ? (
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="text-sm text-muted-foreground">
            מציג {rows.length} מתוך {dataMemo.length} רשומות
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => canPrevious && onPageChangeHandler(currentPage - 1)}
              disabled={!canPrevious}
            >
              הקודם
            </Button>
            <span className="text-sm text-muted-foreground">
              עמוד {Math.min(currentPage, effectiveTotalPages)} מתוך {effectiveTotalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => canNext && onPageChangeHandler(currentPage + 1)}
              disabled={!canNext}
            >
              הבא
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { DataGrid };
