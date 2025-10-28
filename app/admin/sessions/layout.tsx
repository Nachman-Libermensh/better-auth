import type { ReactNode } from "react";

import { requireAdminUser } from "@/lib/auth-guards";

export default async function AdminSessionsLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdminUser();

  return <>{children}</>;
}
