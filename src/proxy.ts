import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Next.js 16 renamed `middleware.ts` to `proxy.ts` (same behavior — see
 * AGENTS.md). This only does an optimistic cookie-presence check to
 * bounce obviously-signed-out visitors before a page even renders;
 * per Next's own guidance, Proxy is not a full auth solution, so the
 * real session check still happens server-side in
 * admin/(protected)/layout.tsx on every request.
 */
const PUBLIC_ADMIN_PATHS = [
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
  "/admin/verify-2fa",
];

export function proxy(request: NextRequest) {
  if (PUBLIC_ADMIN_PATHS.some((path) => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
