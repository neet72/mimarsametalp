"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";

const nav = [
  { href: "/panel", label: "Özet", match: (p: string) => p === "/panel" },
  {
    href: "/panel/guncellemeler",
    label: "Güncellemeler",
    match: (p: string) => p.startsWith("/panel/guncellemeler"),
    badgeKey: "updates" as const,
  },
  {
    href: "/panel/bakiye",
    label: "Bakiye / Ekstre",
    match: (p: string) => p.startsWith("/panel/bakiye"),
  },
  {
    href: "/panel/sure-takibi",
    label: "Süre Takibi",
    match: (p: string) => p.startsWith("/panel/sure-takibi"),
  },
  {
    href: "/panel/ekler",
    label: "Ekler",
    match: (p: string) => p.startsWith("/panel/ekler"),
  },
  {
    href: "/panel/tercihler",
    label: "Tercihler",
    match: (p: string) => p.startsWith("/panel/tercihler") || p.startsWith("/panel/sifre"),
  },
  {
    href: "/panel/istekler",
    label: "İstekler",
    match: (p: string) => p.startsWith("/panel/istekler") || p.startsWith("/panel/teslim"),
  },
] as const;

export function PanelShell({
  children,
  userName,
  updateCount = 0,
}: {
  children: ReactNode;
  userName: string;
  updateCount?: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function badgeFor(item: (typeof nav)[number]) {
    if ("badgeKey" in item && item.badgeKey === "updates" && updateCount > 0) return updateCount;
    return null;
  }

  return (
    <SessionProvider>
      <div className="relative min-h-dvh bg-surface">
        <a
          href="#panel-main"
          className="absolute left-4 top-4 z-50 -translate-y-[120%] rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white opacity-0 transition focus:translate-y-0 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-accent/40"
        >
          İçeriğe atla
        </a>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_at_top,_rgb(166_124_82_/_0.1),_transparent_70%)]"
        />

        <header className="relative z-20 border-b border-border/80 bg-surface/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
            <div className="min-w-0">
              <p className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
                Samet Alp · Panel
              </p>
              <p className="mt-0.5 truncate text-sm text-muted">Merhaba, {userName}</p>
            </div>

            <nav className="hidden items-center gap-1 md:flex" aria-label="Panel menü">
              {nav.map((item) => {
                const active = item.match(pathname);
                const badge = badgeFor(item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                      active
                        ? "bg-primary/5 font-medium text-primary"
                        : "text-muted hover:text-primary",
                    )}
                  >
                    {item.label}
                    {badge != null ? (
                      <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                        {badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/panel/giris" })}
                className="ml-2 rounded-full border border-border px-3.5 py-2.5 text-sm text-muted transition-colors hover:border-primary/20 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                Çıkış
              </button>
            </nav>

            <button
              type="button"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-primary md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
              aria-expanded={open}
              aria-controls="panel-mobile-nav"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {open ? (
            <nav
              id="panel-mobile-nav"
              className="border-t border-border px-4 py-3 md:hidden"
              aria-label="Mobil menü"
            >
              <ul className="space-y-1">
                {nav.map((item) => {
                  const active = item.match(pathname);
                  const badge = badgeFor(item);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center justify-between rounded-xl px-3 py-3.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                          active ? "bg-primary/5 font-medium text-primary" : "text-muted",
                        )}
                      >
                        <span>{item.label}</span>
                        {badge != null ? (
                          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
                            {badge}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/panel/giris" })}
                    className="w-full rounded-xl px-3 py-3.5 text-left text-sm text-muted"
                  >
                    Çıkış
                  </button>
                </li>
              </ul>
            </nav>
          ) : null}
        </header>

        <main id="panel-main" className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
