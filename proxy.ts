import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { matchRoute, routeConfig } from "@/config/routes";
import { sanitizeCallbackUrl } from "@/lib/utils/callback-url";

async function getSessionFromRequest(request: NextRequest) {
  const sessionUrl = new URL("/api/auth/get-session", request.url);
  try {
    const response = await fetch(sessionUrl, {
      method: "GET",
      headers: {
        accept: "application/json",
        cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
      credentials: "same-origin",
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to resolve session in proxy", error);
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, origin, search } = request.nextUrl;
  const session = await getSessionFromRequest(request);

  const isPublicRoute = routeConfig.publicRoutes.some((route) =>
    matchRoute(pathname, route)
  );
  const isAdminRoute = routeConfig.adminRoutes.some((route) =>
    matchRoute(pathname, route)
  );
  const isAuthenticatedRoute = routeConfig.authenticatedRoutes.some((route) =>
    matchRoute(pathname, route)
  );

  const hasSession = Boolean(session);
  const userRole = session?.user?.role;

  if (!hasSession) {
    if (isPublicRoute) {
      return NextResponse.next();
    }

    if (isAdminRoute || isAuthenticatedRoute || !isPublicRoute) {
      const redirectUrl = new URL(routeConfig.loginRoute, origin);
      const callbackUrl = sanitizeCallbackUrl(`${pathname}${search}`, {
        defaultValue: routeConfig.authenticatedRedirect,
        disallow: [routeConfig.loginRoute],
      });
      redirectUrl.searchParams.set("callbackUrl", callbackUrl);

      return NextResponse.redirect(redirectUrl);
    }
  }

  if (hasSession && isPublicRoute) {
    const callbackUrl = sanitizeCallbackUrl(
      request.nextUrl.searchParams.get("callbackUrl"),
      {
        defaultValue: routeConfig.authenticatedRedirect,
        disallow: [routeConfig.loginRoute],
      }
    );

    return NextResponse.redirect(new URL(callbackUrl, origin));
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
