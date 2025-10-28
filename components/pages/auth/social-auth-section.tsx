import * as React from "react";
import { Chrome } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type SocialAuthSectionProps = {
  isLoading: boolean;
  onGoogleClick: () => void;
};

export function SocialAuthSection({
  isLoading,
  onGoogleClick,
}: SocialAuthSectionProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Separator />
        <span className="bg-card text-muted-foreground absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-xs uppercase">
          או
        </span>
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2"
        onClick={onGoogleClick}
        disabled={isLoading}
      >
        <Chrome className="size-4" />
        המשך עם Google
      </Button>
    </div>
  );
}
