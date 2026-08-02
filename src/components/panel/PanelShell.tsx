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
  { href: "/panel", label: "Özet" },
  { href: "/panel/guncellemeler", label: "Güncellemeler" },
  { href: "/panel/tercihler", label: "Tercihler" },
  { href: "/panel/istekler", label: "İstekler" },
] as const;

export function PanelShell({ children, userName }: { children: ReactNode; userName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <SessionProvider>
      <div className="relative min-h-dvh bg-surface">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_at_top,_rgb(166_124_82_/_0.1),_transparent_70%)]"
        />

        <header className="relative z-20 border-b border-border/80 bg-surface/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div className="min-w-0">
              <p className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
                Samet Alp · Panel
              </p>
              <p className="mt-0.5 truncate text-sm text-muted">Merhaba, {userName}</p>
            </div>

            <nav className="hidden items-center gap-1 md:flex">
              {nav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-full px-3.5 py-2 text-sm transition-colors",
                      active
                        ? "bg-primary/5 font-medium text-primary"
                        : "text-muted hover:text-primary",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/panel/giris" })}
                className="ml-2 rounded-full border border-border px-3.5 py-2 text-sm text-muted transition-colors hover:border-primary/20 hover:text-primary"
              >
                Çıkış
              </button>
            </nav>

            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-primary md:hidden"
              aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {open ? (
            <nav className="border-t border-border px-4 py-3 md:hidden">
              <ul className="space-y-1">
                {nav.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "block rounded-xl px-3 py-3 text-sm",
                          active ? "bg-primary/5 font-medium text-primary" : "text-muted",
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/panel/giris" })}
                    className="w-full rounded-xl px-3 py-3 text-left text-sm text-muted"
                  >
                    Çıkış
                  </button>
                </li>
              </ul>
            </nav>
          ) : null}
        </header>

        <main className="relative z-10 mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">{children}</main>
      </div>
    </SessionProvider>
  );
}
