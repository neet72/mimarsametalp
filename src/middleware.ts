import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/security/admin";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const email = req.auth?.user?.email;
  const isAdmin = isLoggedIn && isAdminEmail(email ?? null);

  // Avoid noisy 404s: redirect legacy favicon request to app icon.
  if (pathname === "/favicon.ico") {
    const url = req.nextUrl.clone();
    url.pathname = "/icon.svg";
    return NextResponse.redirect(url);
  }

  // Pass locale to Server Components (root layout) without breaking routing.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-locale", pathname === "/en" || pathname.startsWith("/en/") ? "en" : "tr");

  if (pathname === "/admin/login") {
    if (isLoggedIn && isAdmin) {
      return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn || !isAdmin) {
      return NextResponse.redirect(new URL("/admin/login", req.nextUrl.origin));
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|api/).*)"],
};
