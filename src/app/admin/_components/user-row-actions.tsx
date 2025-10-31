"use client";

import { useTransition } from "react";
import { AlertTriangle, LogOut, MoreVertical, ShieldX } from "lucide-react";
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
  banUserAction,
  removeUserAction,
  revokeUserSessionsAction,
  unbanUserAction,
} from "../users/actions";

export function UserRowActions({ user }: { user: AdminUserRow }) {
  const [isPending, startTransition] = useTransition();
  const isBanned = user.banned;

  const handleDisconnect = () => {
    startTransition(async () => {
      const result = await revokeUserSessionsAction({ userId: user.id });
      if (!result.success) {
        toast.error(result.error ?? "אירעה שגיאה בעת ניתוק המשתמש");
        return;
      }
      toast.success(result.message ?? "המשתמש נותק מכל הסשנים");
    });
  };

  const handleBanToggle = () => {
    startTransition(async () => {
      const result = isBanned
        ? await unbanUserAction({ userId: user.id })
        : await banUserAction({ userId: user.id });
      if (!result.success) {
        toast.error(result.error ?? "אירעה שגיאה בעת עדכון החסימה");
        return;
      }
      toast.success(
        result.message ??
          (isBanned ? "המשתמש שוחרר מהחסימה" : "המשתמש נחסם בהצלחה")
      );
    });
  };

  const handleRemove = () => {
    startTransition(async () => {
      const result = await removeUserAction({ userId: user.id });
      if (!result.success) {
        toast.error(result.error ?? "אירעה שגיאה בעת הסרת המשתמש");
        return;
      }
      toast.success(result.message ?? "המשתמש הוסר מהמערכת");
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
            handleBanToggle();
          }}
          disabled={isPending}
        >
          <ShieldX className="ml-2 size-4" />
          {isBanned ? "שחרור חסימה" : "חסימת משתמש"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              onSelect={(event) => event.preventDefault()}
              disabled={isPending}
            >
              <AlertTriangle className="ml-2 size-4" />
              מחיקת משתמש
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader className="text-right">
              <AlertDialogTitle>מחיקת משתמש</AlertDialogTitle>
              <AlertDialogDescription>
                המשתמש יימחק לצמיתות וכל הסשנים הפעילים שלו יבוטלו. הפעולה
                אינה ניתנת לשחזור.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row-reverse gap-2">
              <AlertDialogAction
                onClick={(event) => {
                  event.preventDefault();
                  handleRemove();
                }}
                disabled={isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                מחיקת משתמש
              </AlertDialogAction>
              <AlertDialogCancel disabled={isPending}>
                ביטול
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
