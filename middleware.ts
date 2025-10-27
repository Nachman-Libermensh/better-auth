import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCookieCache } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;
  const session = await getCookieCache(request);

  return null;
}
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.svg).*)"],
};
