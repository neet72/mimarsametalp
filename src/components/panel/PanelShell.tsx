"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const nav = [
  { href: "/panel", label: "Özet" },
  { href: "/panel/guncellemeler", label: "Güncellemeler" },
  { href: "/panel/tercihler", label: "Tercihler" },
  { href: "/panel/teslim", label: "Teslim" },
] as const;

export function PanelShell({ children, userName }: { children: ReactNode; userName: string }) {
  const pathname = usePathname();

  return (
    <SessionProvider>
      <div className="min-h-dvh">
        <header className="border-b border-border bg-surface/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div>
              <p className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
                Samet Alp Mimarlık
              </p>
              <p className="mt-0.5 text-sm text-muted">Merhaba, {userName}</p>
            </div>
            <nav className="flex flex-wrap items-center gap-1">
              {nav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm transition-colors",
                      active ? "bg-primary/5 text-primary" : "text-muted hover:text-primary",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/panel/giris" })}
                className="ml-2 rounded-lg px-3 py-2 text-sm text-muted hover:text-primary"
              >
                Çıkış
              </button>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">{children}</main>
      </div>
    </SessionProvider>
  );
}
