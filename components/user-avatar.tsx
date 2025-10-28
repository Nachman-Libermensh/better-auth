"use client";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

import { cn } from "@/lib/utils";

type UserAvatarProps = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
};

function getInitials(name?: string | null, email?: string | null) {
  const trimmedName = name?.trim();
  if (trimmedName) {
    const parts = trimmedName.split(/\s+/u).filter(Boolean);
    if (parts.length === 1) {
      return parts[0]!.slice(0, 2).toUpperCase();
    }

    const initials = parts
      .slice(0, 2)
      .map((part) => part[0] ?? "")
      .join("");
    if (initials) {
      return initials.toUpperCase();
    }
  }

  const emailHandle = email?.split("@")[0]?.trim();
  if (emailHandle) {
    return emailHandle.slice(0, 2).toUpperCase();
  }

  return "?";
}

export function UserAvatar({
  name,
  email,
  image,
  className,
  imageClassName,
  fallbackClassName,
}: UserAvatarProps) {
  const initials = getInitials(name, email);
  const imageSrc = image?.trim() ? image : undefined;

  return (
    <Avatar className={cn("size-9", className)}>
      {imageSrc ? (
        <AvatarImage
          src={imageSrc}
          alt={name ?? email ?? ""}
          className={imageClassName}
        />
      ) : null}
      <AvatarFallback
        className={cn("text-xs font-medium uppercase", fallbackClassName)}
        aria-label={name ?? email ?? undefined}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

