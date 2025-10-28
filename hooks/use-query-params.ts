"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

/**
 * A convenient hook for working with URL query parameters.
 *
 * Provides utilities to read, add, update and remove parameters
 * while keeping the current pathname.
 */
export function useQueryParams() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace, push } = useRouter();

  const getParam = useCallback(
    (key: string): string | null => {
      return searchParams.get(key);
    },
    [searchParams]
  );

  const getParams = useCallback((): Record<string, string> => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);

  const getAllParams = useCallback(
    (key: string): string[] => {
      return searchParams.getAll(key);
    },
    [searchParams]
  );

  const setParam = useCallback(
    (
      key: string,
      value: string | string[],
      options?: { method?: "push" | "replace" }
    ) => {
      const params = new URLSearchParams(searchParams.toString());
      if (Array.isArray(value)) {
        params.delete(key);
        value.forEach((v) => params.append(key, v));
      } else {
        params.set(key, value);
      }
      const method = options?.method === "push" ? push : replace;
      method(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, push, replace]
  );

  const setParams = useCallback(
    (
      entries: Record<string, string | string[]>,
      options?: { method?: "push" | "replace" }
    ) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(entries).forEach(([k, v]) => {
        if (Array.isArray(v)) {
          params.delete(k);
          v.forEach((val) => params.append(k, val));
        } else {
          params.set(k, v);
        }
      });
      const method = options?.method === "push" ? push : replace;
      method(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, push, replace]
  );

  const updateParams = useCallback(
    (
      updater: (params: URLSearchParams) => void,
      options?: { method?: "push" | "replace" }
    ) => {
      const params = new URLSearchParams(searchParams.toString());
      updater(params);

      const method = options?.method === "push" ? push : replace;
      const query = params.toString();
      method(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, push, replace, searchParams]
  );

  const removeParam = useCallback(
    (key: string, options?: { method?: "push" | "replace" }) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(key);
      const method = options?.method === "push" ? push : replace;
      const query = params.toString();
      method(query ? `${pathname}?${query}` : pathname);
    },
    [searchParams, pathname, push, replace]
  );

  const clearParams = useCallback(
    (options?: { method?: "push" | "replace" }) => {
      const method = options?.method === "push" ? push : replace;
      method(pathname);
    },
    [pathname, push, replace]
  );

  return {
    getParam,
    getAllParams,
    getParams,
    setParam,
    setParams,
    updateParams,
    removeParam,
    clearParams,
  };
}

export default useQueryParams;
