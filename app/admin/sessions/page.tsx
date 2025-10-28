import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminSessionRows } from "@/lib/admin-data";

import { SessionTable } from "../_components/session-table";

export default async function AdminSessionsPage() {
  const sessions = await getAdminSessionRows();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">ניהול סשנים</CardTitle>
        <p className="text-muted-foreground text-sm">
          ניטור סשנים פעילים ותיעוד היסטוריית התחברויות במערכת.
        </p>
      </CardHeader>
      <CardContent>
        <SessionTable data={sessions} />
      </CardContent>
    </Card>
  );
}
