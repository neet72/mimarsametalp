import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/security/admin";

const { auth } = NextAuth(authConfig);

function applySecurityHeaders(res: NextResponse) {
  // Baseline security headers (safe defaults, non-breaking).
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-DNS-Prefetch-Control", "off");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  // Strict-Transport-Security is only meaningful on HTTPS; setting it is safe behind TLS.
  res.headers.set("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
  return res;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const email = req.auth?.user?.email;
  const isAdmin = isLoggedIn && isAdminEmail(email ?? null);

  // Avoid noisy 404s: redirect legacy favicon request to app icon.
  if (pathname === "/favicon.ico") {
    const url = req.nextUrl.clone();
    url.pathname = "/icon.svg";
    return applySecurityHeaders(NextResponse.redirect(url));
  }

  // Pass locale to Server Components (root layout) without breaking routing.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-locale", pathname === "/en" || pathname.startsWith("/en/") ? "en" : "tr");

  if (pathname === "/admin/login") {
    if (isLoggedIn && isAdmin) {
      return applySecurityHeaders(NextResponse.redirect(new URL("/admin", req.nextUrl.origin)));
    }
    return applySecurityHeaders(NextResponse.next({ request: { headers: requestHeaders } }));
  }

  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn || !isAdmin) {
      return applySecurityHeaders(NextResponse.redirect(new URL("/admin/login", req.nextUrl.origin)));
    }
  }

  return applySecurityHeaders(NextResponse.next({ request: { headers: requestHeaders } }));
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|api/).*)"],
};
