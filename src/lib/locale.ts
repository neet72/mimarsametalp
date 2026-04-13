export type Locale = "tr" | "en";

export const locales: Locale[] = ["tr", "en"];
export const defaultLocale: Locale = "tr";

export function localeFromPathname(pathname: string): Locale {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "tr";
}

export function stripLocalePrefix(pathname: string): string {
  if (pathname === "/en") return "/";
  if (pathname.startsWith("/en/")) return pathname.slice(3);
  return pathname;
}

export function withLocalePath(pathname: string, locale: Locale): string {
  const clean = stripLocalePrefix(pathname);
  if (locale === "tr") return clean;
  if (clean === "/") return "/en";
  return `/en${clean}`;
}

