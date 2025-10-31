export type RoleValue = string | string[] | null | undefined;

export function normalizeRoles(value: RoleValue): string[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((role) => role.trim().toLowerCase())
      .filter((role) => role.length > 0);
  }

  return value
    .split(",")
    .map((role) => role.trim().toLowerCase())
    .filter((role) => role.length > 0);
}

export function hasAdminRole(value: RoleValue): boolean {
  return normalizeRoles(value).includes("admin");
}

export function getPrimaryRole(value: RoleValue, fallback: string = "user"): string {
  const roles = normalizeRoles(value);
  return roles[0] ?? fallback;
}
