import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminUserRows } from "@/lib/admin-data";

import { UserTable } from "../_components/user-table";

export default async function AdminUsersPage() {
  const users = await getAdminUserRows();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">ניהול משתמשים</CardTitle>
        <p className="text-muted-foreground text-sm">
          עיון בכל המשתמשים, מעקב אחר סטטוס החיבור וניתוח סשנים פעילים.
        </p>
      </CardHeader>
      <CardContent>
        <UserTable data={users} />
      </CardContent>
    </Card>
  );
}
