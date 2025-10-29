import { SectionCard } from "@/components/ui/section-card";
import { getAdminUserRows } from "@/lib/admin-data";

import { CreateUserDialog } from "../_components/create-user-dialog";
import { UserTable } from "../_components/user-table";

export default async function AdminUsersPage() {
  const users = await getAdminUserRows();

  return (
    <SectionCard
      title="ניהול משתמשים"
      description="עיון בכל המשתמשים, מעקב אחר סטטוס החיבור וניתוח סשנים פעילים."
      contentClassName="px-0"
      actions={<CreateUserDialog />}
      fullscreenContent={<UserTable data={users} scrollAreaClassName="h-[70vh]" />}
    >
      <UserTable data={users} className="px-4" scrollAreaClassName="max-h-[70vh]" />
    </SectionCard>
  );
}
