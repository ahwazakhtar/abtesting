import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, parseUserCookie } from "@/lib/auth-shared";

const PUBLIC_PATHS = new Set([
  "/sign-in",
  "/api/auth/sign-in",
  "/api/auth/sign-out",
]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  const user = parseUserCookie(req.cookies.get(COOKIE_NAME)?.value);
  if (user) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const signin = new URL("/sign-in", req.url);
  if (pathname !== "/") signin.searchParams.set("next", pathname + req.nextUrl.search);
  return NextResponse.redirect(signin);
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico|.*\\..*).*)"],
};
