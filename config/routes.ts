export type RouteConfig = {
  publicRoutes: string[];
  authenticatedRoutes: string[];
  adminRoutes: string[];
  loginRoute: string;
  authenticatedRedirect: string;
  unauthorizedRedirect: string;
};

function withTrailingSlash(value: string) {
  return value.endsWith("/") ? value : `${value}/`;
}

export function matchRoute(pathname: string, route: string) {
  if (route === "/") {
    return pathname === "/";
  }

  if (pathname === route) {
    return true;
  }

  return pathname.startsWith(withTrailingSlash(route));
}

export const routeConfig: RouteConfig = {
  publicRoutes: ["/login"],
  authenticatedRoutes: ["/"],
  adminRoutes: ["/admin"],
  loginRoute: "/login",
  authenticatedRedirect: "/",
  unauthorizedRedirect: "/",
};
