import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/security/admin";
import { getSiteUrl } from "@/lib/seo";

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
    // Google Maps iframe + yaygın alt çerçeve kaynakları
    "frame-src 'self' https://www.google.com https://maps.google.com https://www.gstatic.com",
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

  // --- Canonical redirects (SEO) ---
  // Fix common "duplicate without canonical" + "crawled - currently not indexed"
  // cases caused by http/non-www or legacy paths like `/home`.
  const isDev = process.env.NODE_ENV !== "production";
  const isLocal =
    req.nextUrl.hostname === "localhost" ||
    req.nextUrl.hostname === "127.0.0.1" ||
    req.nextUrl.hostname === "::1";

  const canonical = new URL(getSiteUrl());
  const canonicalHost = canonical.host;
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const shouldBeHttps = canonical.protocol === "https:";
  const isHttp = forwardedProto === "http" || req.nextUrl.protocol === "http:";
  const hostMismatch = req.nextUrl.host !== canonicalHost;

  // Redirect legacy aliases.
  if (pathname === "/home") {
    return applySecurityHeaders(NextResponse.redirect(new URL("/", isLocal ? req.nextUrl.origin : canonical), 308));
  }
  if (pathname === "/en/home") {
    return applySecurityHeaders(NextResponse.redirect(new URL("/en", isLocal ? req.nextUrl.origin : canonical), 308));
  }

  // Enforce canonical host + https when needed.
  // IMPORTANT: never redirect localhost in development, otherwise `http://localhost:3000`
  // breaks by redirecting to the production domain.
  if (!isDev && !isLocal && (hostMismatch || (shouldBeHttps && isHttp))) {
    const url = req.nextUrl.clone();
    url.protocol = canonical.protocol;
    url.host = canonicalHost;
    return applySecurityHeaders(NextResponse.redirect(url, 308));
  }

  // Normalize trailing slashes (avoid duplicate URLs like `/projeler/`).
  // Keep `/` intact.
  if (pathname.length > 1 && pathname.endsWith("/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace(/\/+$/, "");
    return applySecurityHeaders(NextResponse.redirect(url, 308));
  }

  const isLoggedIn = !!req.auth;
  const email = req.auth?.user?.email;
  const role = (req.auth?.user as { role?: string } | undefined)?.role;
  const mustChangePassword = Boolean(
    (req.auth?.user as { mustChangePassword?: boolean } | undefined)?.mustChangePassword,
  );
  const isAdmin = isLoggedIn && (role === "admin" || isAdminEmail(email ?? null));
  const isClient = isLoggedIn && role === "client";

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

  // --- Client portal ---
  if (pathname === "/panel/giris") {
    if (isClient) {
      const dest = mustChangePassword ? "/panel/sifre" : "/panel";
      return applySecurityHeaders(NextResponse.redirect(new URL(dest, req.nextUrl.origin)));
    }
    return applySecurityHeaders(NextResponse.next({ request: { headers: requestHeaders } }));
  }

  if (pathname.startsWith("/panel")) {
    if (!isClient) {
      return applySecurityHeaders(NextResponse.redirect(new URL("/panel/giris", req.nextUrl.origin)));
    }
    if (mustChangePassword && pathname !== "/panel/sifre") {
      return applySecurityHeaders(NextResponse.redirect(new URL("/panel/sifre", req.nextUrl.origin)));
    }
  }

  return applySecurityHeaders(NextResponse.next({ request: { headers: requestHeaders } }));
});

export const config = {
  // Statik dosyalar + Next asset’leri auth/CSP middleware’inden geçmesin (özellikle /videos hero).
  matcher: [
    "/((?!_next/static|_next/image|api/|videos/|images/|favicon\\.ico|favicon\\.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|pdf|txt|xml|webmanifest)$).*)",
  ],
};
