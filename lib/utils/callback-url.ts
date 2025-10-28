const DEFAULT_CALLBACK_URL = "/";

function isSafeRelativePath(path: string) {
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  return true;
}

export function sanitizeCallbackUrl(
  rawValue: string | string[] | null | undefined
) {
  if (!rawValue) {
    return DEFAULT_CALLBACK_URL;
  }

  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;

  if (!value || !isSafeRelativePath(value)) {
    return DEFAULT_CALLBACK_URL;
  }

  return value;
}

export { DEFAULT_CALLBACK_URL };
