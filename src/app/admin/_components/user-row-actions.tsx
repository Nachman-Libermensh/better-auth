"use client";

import { useTransition } from "react";
import { Archive, LogOut, MoreVertical, Power, Undo2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { AdminUserRow } from "@/lib/admin-data";

import {
  disconnectUserSessionsAction,
  restoreUserAction,
  softDeleteUserAction,
  updateUserStatusAction,
} from "../users/actions";

export function UserRowActions({ user }: { user: AdminUserRow }) {
  const [isPending, startTransition] = useTransition();
  const isInactive = user.status === "INACTIVE";
  const disableStatusToggle = user.isDeleted;

  const handleDisconnect = () => {
    startTransition(async () => {
      const result = await disconnectUserSessionsAction({ userId: user.id });
      if (!result.success) {
        toast.error(result.error ?? "אירעה שגיאה בעת ניתוק המשתמש");
        return;
      }
      toast.success(result.message ?? "המשתמש נותק מכל הסשנים");
    });
  };

  const handleToggleStatus = () => {
    if (disableStatusToggle) {
      return;
    }

    startTransition(async () => {
      const nextStatus = isInactive ? "ACTIVE" : "INACTIVE";
      const result = await updateUserStatusAction({
        userId: user.id,
        status: nextStatus,
      });

      if (!result.success) {
        toast.error(result.error ?? "אירעה שגיאה בעת עדכון הסטטוס");
        return;
      }

      toast.success(result.message ?? "סטטוס המשתמש עודכן");
    });
  };

  const handleRestore = () => {
    startTransition(async () => {
      const result = await restoreUserAction({ userId: user.id });
      if (!result.success) {
        toast.error(result.error ?? "אירעה שגיאה בעת שחזור המשתמש");
        return;
      }
      toast.success(result.message ?? "המשתמש שוחזר בהצלחה");
    });
  };

  const handleSoftDelete = () => {
    startTransition(async () => {
      const result = await softDeleteUserAction({ userId: user.id });
      if (!result.success) {
        toast.error(result.error ?? "אירעה שגיאה בעת מחיקת המשתמש");
        return;
      }
      toast.success(result.message ?? "המשתמש הוסר בהצלחה");
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          disabled={isPending}
        >
          <MoreVertical className="size-4" />
          <span className="sr-only">פעולות</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="text-right">
          פעולות עבור {user.name || user.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            handleDisconnect();
          }}
          disabled={isPending || user.activeSessions === 0}
        >
          <LogOut className="ml-2 size-4" />
          ניתוק מסשנים פעילים
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            handleToggleStatus();
          }}
          disabled={isPending || disableStatusToggle}
        >
          <Power className="ml-2 size-4" />
          {isInactive ? "סימון כפעיל" : "סימון כלא פעיל"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {user.isDeleted ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                onSelect={(event) => event.preventDefault()}
                disabled={isPending}
              >
                <Undo2 className="ml-2 size-4" />
                שחזור משתמש
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
              <AlertDialogHeader className="text-right">
                <AlertDialogTitle>שחזור משתמש</AlertDialogTitle>
                <AlertDialogDescription>
                  המשתמש יוחזר לפעילות מלאה. האם להמשיך?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-row-reverse gap-2">
                <AlertDialogAction
                  onClick={(event) => {
                    event.preventDefault();
                    handleRestore();
                  }}
                  disabled={isPending}
                >
                  שחזור
                </AlertDialogAction>
                <AlertDialogCancel disabled={isPending}>
                  ביטול
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                onSelect={(event) => event.preventDefault()}
                disabled={isPending}
              >
                <Archive className="ml-2 size-4" />
                מחיקה רכה
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
              <AlertDialogHeader className="text-right">
                <AlertDialogTitle>מחיקת משתמש</AlertDialogTitle>
                <AlertDialogDescription>
                  המשתמש יסומן כמחוק וכל הסשנים הפעילים שלו ינותקו. ניתן לשחזר
                  בכל עת.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-row-reverse gap-2">
                <AlertDialogAction
                  onClick={(event) => {
                    event.preventDefault();
                    handleSoftDelete();
                  }}
                  disabled={isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  מחיקה רכה
                </AlertDialogAction>
                <AlertDialogCancel disabled={isPending}>
                  ביטול
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
