"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      return getInitials(undefined, email);
    }

    const parts = trimmed.split(/\s+/);

    if (parts.length === 1) {
      return parts[0]!.slice(0, 2).toUpperCase();
    }

    const first = parts[0]?.[0] ?? "";
    const last = parts[parts.length - 1]?.[0] ?? "";
    const initials = `${first}${last}`.trim();

    return initials ? initials.toUpperCase() : getInitials(undefined, email);
  }

  if (email) {
    const [localPart] = email.split("@");
    return (localPart?.slice(0, 2) ?? email.slice(0, 2) ?? "?").toUpperCase();
  }

  return "?";
}

export function UserIdentity({
  name,
  email,
  image,
  className,
  primaryClassName,
  secondaryClassName,
}: {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  className?: string;
  primaryClassName?: string;
  secondaryClassName?: string;
}) {
  const primary = name || email || "—";
  const secondary = email;
  const fallback = getInitials(name, email);
  const showSecondary = Boolean(email) && email !== primary;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Avatar className="h-9 w-9 border">
        {image ? <AvatarImage src={image} alt={name ?? email ?? ""} /> : null}
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 space-y-1">
        <div className={cn("font-medium truncate", primaryClassName)}>
          {primary}
        </div>
        {showSecondary ? (
          <div
            className={cn(
              "text-muted-foreground text-xs truncate",
              secondaryClassName
            )}
          >
            {secondary}
          </div>
        ) : null}
      </div>
    </div>
  );
}
