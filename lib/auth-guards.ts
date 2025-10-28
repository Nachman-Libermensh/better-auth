import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { routeConfig } from "@/config/routes";
import { auth } from "@/lib/auth";
import { sanitizeCallbackUrl } from "@/lib/utils/callback-url";

function headersToObject(headersList: Headers) {
  return Object.fromEntries(headersList.entries());
}

export async function requireAdminUser() {
  const resolvedHeaders = await headers();
  const session = await auth.api.getSession({
    headers: headersToObject(resolvedHeaders),
  });

  if (!session) {
    const callbackUrl = sanitizeCallbackUrl(routeConfig.adminRoutes[0], {
      defaultValue: routeConfig.loginRoute,
      disallow: [routeConfig.loginRoute],
    });
    redirect(`${routeConfig.loginRoute}?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  if (session.user?.role !== "ADMIN") {
    redirect(routeConfig.unauthorizedRedirect);
  }

  return session;
}
