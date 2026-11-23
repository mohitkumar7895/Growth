import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME || "gr_admin_session";

function getSecret(): Uint8Array {
  const secret =
    process.env.JWT_SECRET ||
    "growth-realtech-dev-fallback-secret-change-in-production-64chars";
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (pathname === "/admin/login") {
      if (token) {
        try {
          await jwtVerify(token, getSecret());
          return NextResponse.redirect(new URL("/admin", request.url));
        } catch {
          // Invalid token -> show login
        }
      }
      return NextResponse.next();
    }

    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      await jwtVerify(token, getSecret());
      return NextResponse.next();
    } catch {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete(SESSION_COOKIE_NAME);
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
