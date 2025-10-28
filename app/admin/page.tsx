import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  getAdminOverview,
  getAdminSessionRows,
  getAdminUserRows,
} from "@/lib/admin-data";

import { SessionTable } from "./_components/session-table";
import { UserTable } from "./_components/user-table";

export default async function AdminDashboardPage() {
  const [overview, users, sessions] = await Promise.all([
    getAdminOverview(),
    getAdminUserRows(),
    getAdminSessionRows(),
  ]);

  const recentUsers = users.slice(0, 5);
  const activeSessions = sessions
    .filter((session) => session.status === "ACTIVE")
    .slice(0, 5);

  const metrics = [
    {
      label: "סה\"כ משתמשים",
      value: overview.totalUsers,
      helper: `${overview.adminUsers} מנהלים · ${overview.regularUsers} משתמשים`,
    },
    {
      label: "סשנים פעילים",
      value: overview.activeSessions,
      helper: `${overview.expiredSessions} סשנים שפגו`,
    },
    {
      label: "משתמשים מחוברים",
      value: overview.activeUsers,
      helper: `${overview.inactiveUsers} מנותקים`,
    },
    {
      label: "הרשמות 7 ימים",
      value: overview.recentSignups,
      helper: `ממוצע ${overview.averageSessionsPerUser} סשנים למשתמש`,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-semibold">{metric.value}</div>
              <p className="text-muted-foreground text-xs">{metric.helper}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-base">משתמשים אחרונים</CardTitle>
              <p className="text-muted-foreground text-sm">
                פעילות עדכנית של משתמשים והתחברויות.
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/users">לכל המשתמשים</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <UserTable data={recentUsers} enableSearch={false} />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-base">סשנים פעילים</CardTitle>
              <p className="text-muted-foreground text-sm">
                מעקב אחר סשנים שעדיין תקפים.
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/sessions">לכל הסשנים</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <SessionTable data={activeSessions} enableSearch={false} />
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">כל המשתמשים</CardTitle>
          </CardHeader>
          <CardContent>
            <UserTable data={users} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">כל הסשנים</CardTitle>
          </CardHeader>
          <CardContent>
            <SessionTable data={sessions} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
