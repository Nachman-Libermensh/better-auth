"use client";

import React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

export type LoaderVariant = "skeleton" | "spinner" | "minimal";

interface DataGridLoaderProps {
  columns: number;
  rows?: number;
  message?: string;
  variant?: LoaderVariant;
}

export const DataGridLoader: React.FC<DataGridLoaderProps> = ({
  columns,
  rows = 5,
  message,
  variant = "skeleton",
}) => {
  if (variant === "spinner") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Spinner className="h-8 w-8" />
        {message ? (
          <p className="text-sm text-muted-foreground" data-testid="data-grid-loader-message">
            {message}
          </p>
        ) : null}
      </div>
    );
  }

  if (variant === "minimal") {
    return message ? (
      <div className="py-10 text-center text-sm text-muted-foreground">
        {message}
      </div>
    ) : null;
  }

  return (
    <div className="flex flex-col gap-2 py-4" data-testid="data-grid-skeleton-loader">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: columns }).map((__, colIdx) => (
            <Skeleton key={`${rowIdx}-${colIdx}`} className="h-8 w-full" />
          ))}
        </div>
      ))}
      {message ? (
        <p className="text-sm text-muted-foreground" data-testid="data-grid-loader-message">
          {message}
        </p>
      ) : null}
    </div>
  );
};
