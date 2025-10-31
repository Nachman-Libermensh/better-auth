"use client";

import * as React from "react";
import type { Column } from "@tanstack/react-table";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  FilterIcon,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type DataTableFilterOption = {
  label: string;
  value: string;
};

export type DataTableColumnMeta = {
  filterVariant?: "text" | "options";
  filterOptions?: DataTableFilterOption[];
  filterMulti?: boolean;
  filterPlaceholder?: string;
  filterEmptyText?: string;
  filterAllLabel?: string;
  title?: string;
};

export type DataTableColumnHeaderProps<TData, TValue> = {
  column: Column<TData, TValue>;
  children: React.ReactNode;
  title: string;
  direction?: "ltr" | "rtl";
};

function useColumnMeta<TData, TValue>(column: Column<TData, TValue>) {
  return React.useMemo(() => {
    return (
      column.columnDef.meta as DataTableColumnMeta | undefined
    ) ?? {};
  }, [column]);
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  children,
  title,
  direction = "rtl",
}: DataTableColumnHeaderProps<TData, TValue>) {
  const meta = useColumnMeta(column);
  const [open, setOpen] = React.useState(false);

  const filterVariant = meta?.filterVariant;
  const canFilter = column.getCanFilter() && Boolean(filterVariant);
  const canSort = column.getCanSort();
  const isFiltered = column.getIsFiltered();
  const isSorted = Boolean(column.getIsSorted());
  const rawFilterValue = column.getFilterValue();
  const optionSelectedValues = React.useMemo(() => {
    if (!rawFilterValue) return [] as string[];
    if (Array.isArray(rawFilterValue)) {
      return rawFilterValue.map(String);
    }
    return [String(rawFilterValue)];
  }, [rawFilterValue]);

  const displayTitle = meta?.title ?? title ?? column.id;

  if (!canFilter && !canSort) {
    return (
      <div className="flex w-full items-center justify-center px-3 py-2 text-center text-sm font-medium">
        {children}
      </div>
    );
  }

  const renderFilterContent = () => {
    if (!canFilter) return null;

    if (filterVariant === "options") {
      const options = meta?.filterOptions ?? [];
      const multi = meta?.filterMulti ?? true;
      const selectedValues = optionSelectedValues;

      const toggleOption = (value: string) => {
        const current = new Set(selectedValues);
        const hasValue = current.has(value);

        if (multi) {
          if (hasValue) {
            current.delete(value);
          } else {
            current.add(value);
          }
          const next = Array.from(current);
          column.setFilterValue(next.length ? next : undefined);
        } else {
          if (hasValue && selectedValues.length === 1) {
            column.setFilterValue(undefined);
          } else {
            column.setFilterValue([value]);
          }
        }
      };

      const resetFilter = () => {
        column.setFilterValue(undefined);
      };

      const allLabel = meta?.filterAllLabel ?? "כל האפשרויות";
      const placeholder = meta?.filterPlaceholder ?? "חיפוש אפשרות";
      const emptyText = meta?.filterEmptyText ?? "לא נמצאו אפשרויות";

      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">מסנן</p>
            <Command
              className="border"
              filter={(value, search) => {
                if (!search) return 1;
                const normalizedSearch = search.toLowerCase();
                if (value.toLowerCase().includes(normalizedSearch)) {
                  return 1;
                }
                const option = options.find((item) => item.value === value);
                if (!option) return 0;
                return option.label.toLowerCase().includes(normalizedSearch) ? 1 : 0;
              }}
            >
              <CommandInput placeholder={placeholder} />
              <CommandList>
                <CommandEmpty>{emptyText}</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="__all__"
                    onSelect={() => {
                      resetFilter();
                      setOpen(true);
                    }}
                  >
                    <Checkbox checked={!selectedValues.length} className="rtl:ml-2 ltr:mr-2" />
                    <span>{allLabel}</span>
                  </CommandItem>
                  {options.map((option) => {
                    const checked = selectedValues.includes(option.value);
                    return (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => {
                          toggleOption(option.value);
                          setOpen(true);
                        }}
                      >
                        <Checkbox checked={checked} className="rtl:ml-2 ltr:mr-2" />
                        <span>{option.label}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </div>
      );
    }

    const filterValue = (column.getFilterValue() as string) ?? "";
    const placeholder = meta?.filterPlaceholder ?? "חיפוש";

    return (
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">מסנן</p>
        <Input
          value={filterValue}
          onChange={(event) => column.setFilterValue(event.target.value)}
          placeholder={placeholder}
          className="h-9"
          dir={direction}
        />
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "mx-auto inline-flex h-auto min-h-9 w-full max-w-[200px] items-center justify-center gap-2 rounded-md px-3 py-2 text-center text-sm font-medium",
            (isFiltered || isSorted) && "border border-border bg-muted/60"
          )}
        >
          <span className="line-clamp-2 leading-snug">{children}</span>
          <FilterIcon className="size-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        className="w-72 space-y-4 p-4"
        side="bottom"
        sideOffset={8}
      >
        <div className="text-center">
          <h3 className="text-sm font-semibold">{displayTitle}</h3>
          {(isFiltered || isSorted) && (
            <p className="text-xs text-muted-foreground">
              {isFiltered && "מסנן פעיל"}
              {isFiltered && isSorted && " • "}
              {isSorted && "מיון פעיל"}
            </p>
          )}
        </div>
        {renderFilterContent()}
        {canSort ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">מיון</p>
            <div className="grid gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => column.toggleSorting(false)}
                className="justify-center gap-2"
              >
                <ArrowUpIcon className="size-4" />
                סדר עולה
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => column.toggleSorting(true)}
                className="justify-center gap-2"
              >
                <ArrowDownIcon className="size-4" />
                סדר יורד
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => column.clearSorting()}
                className="justify-center gap-2 text-destructive"
                disabled={!isSorted}
              >
                <ArrowUpDownIcon className="size-4" />
                איפוס מיון
              </Button>
            </div>
          </div>
        ) : null}
        {canFilter ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.setFilterValue(undefined)}
            className="w-full justify-center gap-2 text-destructive"
            disabled={!isFiltered}
          >
            <XIcon className="size-4" />
            איפוס מסנן
          </Button>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
