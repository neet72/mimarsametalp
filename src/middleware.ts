import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/security/admin";

const { auth } = NextAuth(authConfig);

function buildCspHeaderValue(): string {
  const isProd = process.env.NODE_ENV === "production";

  // Note: Keep this CSP strict but compatible with Next.js, Cloudinary, Vercel Analytics and Google Maps embed.
  const devConnectExtras = isProd
    ? ""
    : " ws://localhost:* ws://127.0.0.1:* http://localhost:* http://127.0.0.1:*";
  const analyticsScriptSrc = " https://va.vercel-scripts.com";
  const directives: string[] = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    // Next.js injects styles; nonce plumbing is non-trivial in App Router, so allow inline styles only.
    "style-src 'self' 'unsafe-inline'",
    // Next.js (App Router) uses inline scripts for hydration/runtime in production builds.
    // Nonce/hashes would be ideal but require plumbing; keep eval disabled in prod.
    `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}${analyticsScriptSrc}`,
    // Some browsers prefer explicit script-src-elem. Keep it aligned.
    `script-src-elem 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}${analyticsScriptSrc}`,
    "img-src 'self' data: blob: https://res.cloudinary.com",
    "media-src 'self' blob: https://res.cloudinary.com",
    "font-src 'self' data:",
    // Vercel Analytics / Web Vitals
    `connect-src 'self' https://vitals.vercel-insights.com${devConnectExtras}`,
    // Google Maps embed (iframe)
    "frame-src 'self' https://www.google.com https://maps.google.com",
    // Extra hardening
    "upgrade-insecure-requests",
  ];

  // Avoid double spaces; join with semicolons.
  return directives.join("; ");
}

function applySecurityHeaders(res: NextResponse) {
  // Baseline security headers (safe defaults, non-breaking).
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-DNS-Prefetch-Control", "off");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  // Strict-Transport-Security is only meaningful on HTTPS; setting it is safe behind TLS.
  res.headers.set("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
  res.headers.set("Content-Security-Policy", buildCspHeaderValue());
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
  requestHeaders.set("x-pathname", pathname);

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
