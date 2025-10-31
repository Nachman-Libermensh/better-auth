import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
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
      helper: `${overview.bannedUsers} חסומים`,
    },
    {
      label: "הרשמות 7 ימים",
      value: overview.recentSignups,
      helper: `ממוצע ${overview.averageSessionsPerUser} סשנים למשתמש`,
    },
  ];

  return (
    <div className="space-y-6">
      <SectionCard
        title="מדדים עיקריים"
        description="מעקב אחר מגמות פעילות משתמשים וסשנים אחרונים."
        fullscreenContent={
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-lg border bg-card p-4 shadow-sm"
              >
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="text-3xl font-semibold">{metric.value}</p>
                <p className="text-xs text-muted-foreground">{metric.helper}</p>
              </div>
            ))}
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-lg border bg-card p-4 shadow-sm"
            >
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="text-3xl font-semibold">{metric.value}</p>
              <p className="text-xs text-muted-foreground">{metric.helper}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="משתמשים אחרונים"
          description="פעילות עדכנית של משתמשים והתחברויות."
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/users">לכל המשתמשים</Link>
            </Button>
          }
          contentClassName="px-0"
          fullscreenContent={
            <UserTable
              data={recentUsers}
              enableSearch={false}
              scrollAreaClassName="h-[70vh]"
            />
          }
        >
          <UserTable
            data={recentUsers}
            enableSearch={false}
            className="px-4"
            scrollAreaClassName="max-h-[320px]"
          />
        </SectionCard>

        <SectionCard
          title="סשנים פעילים"
          description="מעקב אחר סשנים שעדיין תקפים."
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/sessions">לכל הסשנים</Link>
            </Button>
          }
          contentClassName="px-0"
          fullscreenContent={
            <SessionTable
              data={activeSessions}
              enableSearch={false}
              scrollAreaClassName="h-[70vh]"
            />
          }
        >
          <SessionTable
            data={activeSessions}
            enableSearch={false}
            className="px-4"
            scrollAreaClassName="max-h-[320px]"
          />
        </SectionCard>
      </div>

      <Separator />

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="כל המשתמשים"
          description="רשימת המשתמשים המלאה עם אפשרויות חיפוש וסינון."
          contentClassName="px-0"
          fullscreenContent={
            <UserTable data={users} scrollAreaClassName="h-[70vh]" />
          }
        >
          <UserTable data={users} className="px-4" scrollAreaClassName="max-h-[360px]" />
        </SectionCard>

        <SectionCard
          title="כל הסשנים"
          description="מעקב אחר סטטוס הסשנים ומידע על המכשירים."
          contentClassName="px-0"
          fullscreenContent={
            <SessionTable data={sessions} scrollAreaClassName="h-[70vh]" />
          }
        >
          <SessionTable
            data={sessions}
            className="px-4"
            scrollAreaClassName="max-h-[360px]"
          />
        </SectionCard>
      </div>
    </div>
  );
}
