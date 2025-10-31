import { ComponentProps } from "react";
import {
  ColumnFiltersState,
  GroupingState,
  Row,
  SortingState,
  Table,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { LookupTableName } from "@/shared";

import { LoaderVariant } from "./data-grid-loader";

export type DataGridBadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline";

export interface DataGridBooleanOptions {
  trueLabel?: string;
  falseLabel?: string;
  trueVariant?: DataGridBadgeVariant;
  falseVariant?: DataGridBadgeVariant;
  emptyLabel?: string;
}

export interface DataGridColumnOptions {
  /**
   * Custom text labels per value. Works for badge, lookup, lookup-multi and other text based columns.
   */
  labels?: Record<string, string>;
  /**
   * Configuration for boolean columns including label and badge variant overrides.
   */
  boolean?: DataGridBooleanOptions;
  /**
   * Default badge variant for badge columns.
   */
  variant?: DataGridBadgeVariant;
  /**
   * Badge variants per value for badge columns.
   */
  variants?: Record<string, DataGridBadgeVariant>;
  /**
   * Extra className applied to badge based cells.
   */
  className?: string;
  /**
   * Number formatting configuration for numeric columns.
   */
  format?: "currency" | "number" | "duration" | "percentage";
  thresholds?: {
    slow?: number;
    fast?: number;
    high?: number;
    low?: number;
  };
  /**
   * Date formatting configuration for date and datetime columns.
   */
  dateFormat?: "short" | "long" | "relative";
  /**
   * Allow additional future options without breaking the type.
   */
  [key: string]: unknown;
}

export type DataGridColumnType =
  | "text"
  | "image"
  | "text-long"
  | "text-copy"
  | "lookup"
  | "lookup-multi"
  | "number"
  | "currency"
  | "date"
  | "datetime"
  | "boolean"
  | "badge"
  | "custom";

export type ConditionalClassNameFn<T> = (
  obj: T,
  condition: ((obj: T) => boolean) | boolean,
  className: string
) => string;

export interface DataGridColumnDef<
  TData extends Record<string, unknown> = Record<string, unknown>,
> {
  id?: string;
  accessorKey: keyof TData extends string ? keyof TData : string;
  header: string;
  type: DataGridColumnType;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableResizing?: boolean;
  enableHiding?: boolean;
  enablePinning?: boolean;
  enableGrouping?: boolean;
  sticky?: "left" | "right" | boolean;
  cell?: (row: TData) => React.ReactNode;
  size?: number;
  minSize?: number;
  maxSize?: number;
  cellClassName?:
    | string
    | ((row: Row<TData>) => string | ConditionalClassNameFn<TData>);
  headerClassName?: string | ConditionalClassNameFn<TData>;
  meta?: {
    align?: "left" | "right" | "center";
    lookupKey?: LookupTableName;
    emptyValue?: string | number | boolean | null;
    options?: DataGridColumnOptions;
  };
}

export interface DataGridColumnMeta<
  TData extends Record<string, unknown> = Record<string, unknown>,
> {
  originalColumnDef: DataGridColumnDef<TData>;
  align?: "left" | "right" | "center";
  lookupKey?: LookupTableName;
  emptyValue?: string | number | boolean | null;
  sticky?: "left" | "right";
  optionsForLookup?: Record<string, unknown>;
  type: DataGridColumnType;
  [key: string]: unknown;
  options?: DataGridColumnOptions;
}

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<_TData, _TValue> {
    align?: "left" | "right" | "center";
    lookupKey?: LookupTableName;
    emptyValue?: string | number | boolean | null;
    sticky?: "left" | "right";
    options?: Record<string, unknown>;
  }
}

export type DataGridStatus = "error" | "success" | "pending";

export type DataGridRowAction<TData extends Record<string, unknown> = Record<string, unknown>> = Omit<
  ComponentProps<typeof Button>,
  "disabled"
> & {
  actionType: "edit" | "delete" | "view" | "custom";
  label: string;
  onClick: (row: Row<TData>) => void;
  icon?: React.ReactNode;
  disabled?: boolean | ((row: Row<TData>) => boolean);
  variant?:
    | "default"
    | "outline"
    | "ghost"
    | "destructive"
    | "link"
    | "secondary";
  className?: string;
  isDeleteConfirm?: boolean;
};

export interface DataGridHeaderAction
  extends Omit<ComponentProps<typeof Button>, "disabled"> {
  actionType: "edit" | "delete" | "view" | "add" | "download" | "custom";
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean | ((table: Table<unknown>) => boolean);
  variant?:
    | "default"
    | "outline"
    | "ghost"
    | "destructive"
    | "link"
    | "secondary";
  className?: string;
}

type PaginationConfig = {
  pageSize?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
};

export interface DataGridProps<TData extends Record<string, unknown> = Record<string, unknown>> {
  columns: DataGridColumnDef<TData>[];
  data: TData[] | undefined;
  className?: string;
  scrollAreaClassName?: string;
  title?: string | React.ReactNode;
  status?: DataGridStatus;
  noDataMessage?: string;
  expandableRow?: (row: Row<TData>) => React.ReactNode;
  rowActions?: DataGridRowAction<TData>[];
  rowActionsVariant?: "icon" | "popover";
  rowActionsPosition?: "left" | "right";
  headerActionsPosition?: "left" | "right" | "center";
  headerActions?: (table: Table<TData>) => DataGridHeaderAction[];
  onRowClick?: (row: Row<TData>) => void;
  showHeaderActions?: boolean;
  showSearch?: boolean;
  showPagination?: boolean;
  showSelectCol?: boolean;
  disableSelect?: (row: Row<TData>) => boolean;
  onSelectionChange?: (selectedRows: TData[]) => void;
  customPagination?: PaginationConfig;
  storageKey?: string;
  rowId?: string;
  rowClassName?: (row: Row<TData>) => ConditionalClassNameFn<TData> | string;
  syncFiltersWithQueryParams?: boolean;
  variant?: "default" | "minimal";
  initialColumnFilters?: ColumnFiltersState;
  initialSorting?: SortingState;
  initialGrouping?: GroupingState;
  initialGlobalFilter?: string;
  loaderVariant?: LoaderVariant;
  loaderMessage?: string;
  loaderRows?: number;
  errorTitle?: string;
  errorMessage?: string;
  errorActions?: Array<{
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost" | "destructive";
    icon?: React.ReactNode;
  }>;
  noDataTitle?: string;
  noDataActions?: Array<{
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost" | "destructive";
    icon?: React.ReactNode;
  }>;
  onExportExcel?: () => void;
  onResetFilters?: () => void;
}

export type ExtractDataGridColumn<T> = T extends { meta?: infer M }
  ? M extends { dataGridColumn: infer C }
    ? C
    : never
  : never;

export type ExtractColumnType<T> = T extends { meta?: infer M }
  ? M extends { type: infer U }
    ? U
    : never
  : never;
