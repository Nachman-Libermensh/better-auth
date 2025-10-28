import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCookieCache } from "better-auth/cookies";

import { matchRoute, routeConfig } from "@/config/routes";

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;
  const cookieSession = await getCookieCache(request);

  const isPublicRoute = routeConfig.publicRoutes.some((route) =>
    matchRoute(pathname, route)
  );
  const isAdminRoute = routeConfig.adminRoutes.some((route) =>
    matchRoute(pathname, route)
  );
  const isAuthenticatedRoute = routeConfig.authenticatedRoutes.some((route) =>
    matchRoute(pathname, route)
  );

  const hasSession = Boolean(cookieSession?.session && cookieSession?.user);
  const userRole = cookieSession?.user?.role;

  if (!hasSession) {
    if (isPublicRoute) {
      return NextResponse.next();
    }

    if (isAdminRoute || isAuthenticatedRoute || !isPublicRoute) {
      return NextResponse.redirect(new URL(routeConfig.loginRoute, origin));
    }
  }

  if (hasSession && isPublicRoute) {
    return NextResponse.redirect(
      new URL(routeConfig.authenticatedRedirect, origin)
    );
  }

  if (isAdminRoute && userRole !== "ADMIN") {
    return NextResponse.redirect(
      new URL(routeConfig.unauthorizedRedirect, origin)
    );
  }

  return NextResponse.next();
}
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.svg).*)"],
};
