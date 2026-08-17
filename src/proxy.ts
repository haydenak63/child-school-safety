import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_PREFIXES = [
  "/dashboard",
  "/students",
  "/parents",
  "/attendance",
  "/terminals",
  "/settings",
];

// /register, /forgot-password, /reset-password, /verify-email, /check-email,
// and /api/auth/* stay public. Logged-in visitors are only bounced off the
// entry screens below; reset and verify remain reachable so they can finish.
const REDIRECT_WHEN_LOGGED_IN = ["/login", "/register", "/forgot-password"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has("csp_admin");
  const isAdmin = ADMIN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isAdmin && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (hasSession && REDIRECT_WHEN_LOGGED_IN.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const response = NextResponse.next();
  response.headers.set("Permissions-Policy", "camera=*, microphone=(), geolocation=()");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
