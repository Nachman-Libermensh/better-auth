"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { AlertTriangle, LogOut, ShieldX } from "lucide-react";
import { toast } from "sonner";

import { ActionButton } from "@/components/public/action-button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DataGrid, type DataGridRowAction } from "@/components/ui/data-grid";
import type { AdminUserRow } from "@/lib/admin-data";

import {
  banUserAction,
  removeUserAction,
  revokeUserSessionsAction,
  unbanUserAction,
} from "../users/actions";
import { userColumns } from "./user-columns";

export function UserTable({
  data,
  enableSearch = true,
  className,
  scrollAreaClassName,
}: {
  data: AdminUserRow[];
  enableSearch?: boolean;
  className?: string;
  scrollAreaClassName?: string;
}) {
  const [removeTarget, setRemoveTarget] = useState<AdminUserRow | null>(null);
  const [isMutating, startMutateTransition] = useTransition();
  const [isRemovePending, startRemoveTransition] = useTransition();

  const handleDisconnect = useCallback(
    (user: AdminUserRow) => {
      startMutateTransition(async () => {
        const result = await revokeUserSessionsAction({ userId: user.id });
        if (!result.success) {
          toast.error(result.error ?? "אירעה שגיאה בעת ניתוק המשתמש");
          return;
        }
        toast.success(result.message ?? "המשתמש נותק מכל הסשנים");
      });
    },
    [startMutateTransition]
  );

  const handleBanToggle = useCallback(
    (user: AdminUserRow) => {
      startMutateTransition(async () => {
        const result = user.banned
          ? await unbanUserAction({ userId: user.id })
          : await banUserAction({ userId: user.id });
        if (!result.success) {
          toast.error(result.error ?? "אירעה שגיאה בעת עדכון החסימה");
          return;
        }
        toast.success(
          result.message ??
            (user.banned ? "המשתמש שוחרר מהחסימה" : "המשתמש נחסם בהצלחה")
        );
      });
    },
    [startMutateTransition]
  );

  const handleRemove = useCallback(
    (user: AdminUserRow) => {
      startRemoveTransition(async () => {
        const result = await removeUserAction({ userId: user.id });
        if (!result.success) {
          toast.error(result.error ?? "אירעה שגיאה בעת הסרת המשתמש");
          return;
        }
        toast.success(result.message ?? "המשתמש הוסר מהמערכת");
        setRemoveTarget(null);
      });
    },
    [startRemoveTransition]
  );

  const rowActions = useMemo<DataGridRowAction<AdminUserRow>[]>(
    () => [
      {
        actionType: "custom",
        label: "ניתוק מסשנים פעילים",
        icon: <LogOut className="ml-2 size-4" />,
        disabled: (row) => isMutating || row.original.activeSessions === 0,
        onClick: (row) => handleDisconnect(row.original),
      },
      {
        actionType: "edit",
        label: (row) => (row.original.banned ? "שחרור חסימה" : "חסימת משתמש"),
        icon: <ShieldX className="ml-2 size-4" />,
        disabled: () => isMutating,
        onClick: (row) => handleBanToggle(row.original),
      },
      {
        actionType: "delete",
        label: "מחיקת משתמש",
        icon: <AlertTriangle className="ml-2 size-4" />,
        variant: "destructive",
        disabled: () => isMutating || isRemovePending,
        onClick: (row) => setRemoveTarget(row.original),
      },
    ],
    [handleBanToggle, handleDisconnect, isMutating, isRemovePending]
  );

  return (
    <>
      <DataGrid
        columns={userColumns}
        data={data}
        className={className}
        scrollAreaClassName={scrollAreaClassName}
        showHeaderActions={enableSearch}
        showSearch={enableSearch}
        rowId="id"
        noDataMessage="לא נמצאו משתמשים"
        initialSorting={[{ id: "createdAt", desc: true }]}
        rowActions={rowActions}
        rowActionsVariant="popover"
      />
      <AlertDialog
        open={Boolean(removeTarget)}
        onOpenChange={(open) => {
          if (!open && !isRemovePending) {
            setRemoveTarget(null);
          }
        }}
      >
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader className="text-right">
            <AlertDialogTitle>מחיקת משתמש</AlertDialogTitle>
            <AlertDialogDescription>
              המשתמש יימחק לצמיתות וכל הסשנים הפעילים שלו יבוטלו. הפעולה אינה
              ניתנת לשחזור.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <ActionButton
              onClick={() => removeTarget && handleRemove(removeTarget)}
              loading={isRemovePending}
              disabled={isRemovePending}
              variant="destructive"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              מחיקת משתמש
            </ActionButton>
            <AlertDialogCancel disabled={isRemovePending}>ביטול</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
