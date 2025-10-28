"use client";

import * as React from "react";
import { Maximize2 } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "./button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { ScrollArea } from "./scroll-area";

export type SectionCardProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  actions?: () => React.ReactNode;
  className?: string;
  contentClassName?: string;
  fullscreenContent?: React.ReactNode;
  fullscreenContentClassName?: string;
};

export function SectionCard({
  title,
  description,
  children,
  actions,
  className,
  contentClassName,
  fullscreenContent,
  fullscreenContentClassName,
}: SectionCardProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Card className={cn("flex h-full flex-col", className)}>
        <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
            {description ? (
              <CardDescription className="text-muted-foreground text-sm">
                {description}
              </CardDescription>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {actions ? actions() : null}
            <DialogTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="size-9 shrink-0"
              >
                <Maximize2 className="size-4" />
                <span className="sr-only">הרחב למסך מלא</span>
              </Button>
            </DialogTrigger>
          </div>
        </CardHeader>
        <CardContent className={cn("flex-1 space-y-4", contentClassName)}>
          {children}
        </CardContent>
      </Card>
      <DialogContent className="max-w-[95vw] border-0 bg-background p-0 sm:max-w-[90vw]">
        <DialogHeader className="border-b px-6 py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-lg sm:text-xl">{title}</DialogTitle>
              {description ? (
                <DialogDescription className="text-muted-foreground text-sm">
                  {description}
                </DialogDescription>
              ) : null}
            </div>
            {actions ? (
              <div className="flex items-center gap-2">{actions()}</div>
            ) : null}
          </div>
        </DialogHeader>
        <ScrollArea className="h-[80vh]">
          <div className={cn("px-6 py-6", fullscreenContentClassName)}>
            {fullscreenContent ?? children}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
