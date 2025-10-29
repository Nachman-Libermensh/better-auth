import { SectionCard } from "@/components/ui/section-card";
import { getAdminSessionRows } from "@/lib/admin-data";

import { SessionTable } from "../_components/session-table";

export default async function AdminSessionsPage() {
  const sessions = await getAdminSessionRows();

  return (
    <SectionCard
      title="ניהול סשנים"
      description="צפייה בכל הסשנים, סטטוס תוקף וזיהוי מכשירים מחוברים."
      contentClassName="px-0"
      fullscreenContent={<SessionTable data={sessions} scrollAreaClassName="h-[70vh]" />}
    >
      <SessionTable
        data={sessions}
        className="px-4"
        scrollAreaClassName="max-h-[70vh]"
      />
    </SectionCard>
  );
}
