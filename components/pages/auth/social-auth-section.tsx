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
    <div className="space-y-4 text-center">
      <div className="relative flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold tracking-[0.3em] text-slate-500">
          או
        </span>
        <Separator className="flex-1" />
      </div>
      <Button
        type="button"
        variant="ghost"
        className="group relative w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-white/90 to-slate-50/90 px-6 py-3 text-sm font-semibold text-slate-600 shadow-md transition-all duration-200 hover:border-blue-200 hover:from-white hover:to-blue-50 hover:text-blue-600 hover:shadow-lg disabled:cursor-not-allowed disabled:border-slate-200 disabled:shadow-none"
        onClick={onGoogleClick}
        disabled={isLoading}
      >
        <span className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-500/10 via-sky-400/10 to-indigo-500/10 opacity-0 transition group-hover:opacity-100" />
        <Chrome className="size-4 text-blue-500 transition group-hover:scale-105" />
        <span className="ml-2">המשיכו עם Google</span>
      </Button>
    </div>
  );
}
