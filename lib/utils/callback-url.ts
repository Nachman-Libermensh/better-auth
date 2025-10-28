const DEFAULT_CALLBACK_URL = "/";

type SanitizeOptions = {
  defaultValue?: string;
  disallow?: string[];
};

function getDefaultCallbackUrl(options?: SanitizeOptions) {
  return options?.defaultValue ?? DEFAULT_CALLBACK_URL;
}

function isSafeRelativePath(path: string) {
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  return true;
}

function isDisallowedPath(path: string, options?: SanitizeOptions) {
  if (!options?.disallow?.length) return false;

  return options.disallow.some((disallowed) => {
    const normalizedDisallowed = disallowed.endsWith("/")
      ? disallowed.slice(0, -1)
      : disallowed;

    if (path === normalizedDisallowed) {
      return true;
    }

    return path.startsWith(`${normalizedDisallowed}/`);
  });
}

export function sanitizeCallbackUrl(
  rawValue: string | string[] | null | undefined,
  options?: SanitizeOptions
) {
  if (!rawValue) {
    return getDefaultCallbackUrl(options);
  }

  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;

  if (!value || !isSafeRelativePath(value)) {
    return getDefaultCallbackUrl(options);
  }

  const [path] = value.split(/[?#]/);

  if (isDisallowedPath(path, options)) {
    return getDefaultCallbackUrl(options);
  }

  return value;
}

export { DEFAULT_CALLBACK_URL };
