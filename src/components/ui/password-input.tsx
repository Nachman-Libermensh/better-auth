"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";

export type PasswordInputProps = Omit<
  React.ComponentProps<typeof InputGroupInput>,
  "type"
> & {
  icon?: React.ReactNode;
  iconPosition?: "inline-start" | "inline-end";
  togglePosition?: "inline-start" | "inline-end";
  groupClassName?: string;
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
};

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      icon,
      iconPosition,
      togglePosition = "inline-end",
      className,
      groupClassName,
      disabled,
      showPasswordLabel = "הצג סיסמה",
      hidePasswordLabel = "הסתר סיסמה",
      autoComplete,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = React.useState(false);

    const resolvedIconPosition =
      iconPosition ?? (togglePosition === "inline-start" ? "inline-end" : "inline-start");

    const handleToggleVisibility = React.useCallback(() => {
      setIsVisible((previous) => !previous);
    }, []);

    const renderIcon = (position: "inline-start" | "inline-end") => {
      if (!icon || resolvedIconPosition !== position) {
        return null;
      }

      return (
        <InputGroupAddon
          align={position}
          className={cn("px-1", position === "inline-start" ? "pl-0" : "pr-0")}
        >
          <InputGroupText>{icon}</InputGroupText>
        </InputGroupAddon>
      );
    };

    const renderToggle = (position: "inline-start" | "inline-end") => {
      if (togglePosition !== position) {
        return null;
      }

      return (
        <InputGroupAddon
          align={position}
          className={cn("px-1", position === "inline-start" ? "pl-0" : "pr-0")}
        >
          <InputGroupButton
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={handleToggleVisibility}
            aria-label={isVisible ? hidePasswordLabel : showPasswordLabel}
            disabled={disabled}
          >
            {isVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </InputGroupButton>
        </InputGroupAddon>
      );
    };

    return (
      <InputGroup
        className={cn(groupClassName)}
        data-disabled={disabled ? true : undefined}
      >
        {renderToggle("inline-start")}
        {renderIcon("inline-start")}
        <InputGroupInput
          {...props}
          ref={ref}
          disabled={disabled}
          type={isVisible ? "text" : "password"}
          className={className}
          autoComplete={autoComplete ?? "current-password"}
        />
        {renderIcon("inline-end")}
        {renderToggle("inline-end")}
      </InputGroup>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
