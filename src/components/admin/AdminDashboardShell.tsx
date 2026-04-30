"use client";

import "@/components/admin/admin-dev-console-filter";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { LayoutDashboard, FolderKanban, Inbox, LogOut, Wrench, Info, Phone, Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { AdminToastProvider } from "@/components/admin/ui/toast";

const nav = [
  { href: "/admin", label: "Özet", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projeler", icon: FolderKanban },
  { href: "/admin/services", label: "Hizmetler", icon: Wrench },
  { href: "/admin/about", label: "Hakkımızda", icon: Info },
  { href: "/admin/contact", label: "İletişim", icon: Phone },
  { href: "/admin/messages", label: "Mesajlar", icon: Inbox },
] as const;

export function AdminDashboardShell({
  children,
  userEmail,
}: {
  children: ReactNode;
  userEmail: string;
}) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);

  // Close the drawer on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent background scroll while the drawer is open (mobile).
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <SessionProvider>
      <AdminToastProvider>
        <div className="flex min-h-dvh">
          {/* Desktop sidebar */}
          <aside className="hidden w-56 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 md:flex">
            <div className="border-b border-zinc-800 px-4 py-5">
              <p className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-[rgb(166,124,82)]">
                Samet Alp
              </p>
              <p className="mt-1 truncate text-xs text-zinc-500">{userEmail}</p>
            </div>
            <nav className="flex flex-1 flex-col gap-0.5 p-2">
              {nav.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-zinc-800/80 text-zinc-100"
                        : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                    {label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-zinc-800 p-2">
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-zinc-300"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Çıkış
              </button>
            </div>
          </aside>

          {/* Mobile top bar */}
          <div className="min-w-0 flex-1">
            <div className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-950/80 px-4 py-3 backdrop-blur-md md:hidden">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                aria-label="Menüyü aç"
              >
                <Menu className="h-5 w-5" aria-hidden />
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-100">Admin Panel</p>
                <p className="truncate text-xs text-zinc-500">{userEmail}</p>
              </div>
              <div className="h-10 w-10" aria-hidden />
            </div>

            <div className="min-w-0 overflow-auto p-6 md:p-10">{children}</div>
          </div>

          {/* Mobile drawer */}
          <AnimatePresence>
            {open ? (
              <motion.div
                className="fixed inset-0 z-[80] md:hidden"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={reduceMotion ? undefined : { opacity: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: reduceMotion ? 0.01 : 0.18, ease: [0.22, 1, 0.36, 1] }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
                  aria-label="Menüyü kapat"
                />
                <motion.aside
                  className="absolute left-0 top-0 h-full w-[min(86vw,320px)] border-r border-zinc-800 bg-zinc-950 shadow-[0_30px_120px_-40px_rgb(0_0_0/0.85)]"
                  initial={reduceMotion ? false : { x: -24, opacity: 0 }}
                  animate={reduceMotion ? undefined : { x: 0, opacity: 1 }}
                  exit={reduceMotion ? undefined : { x: -24, opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0.01 : 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-4">
                    <div className="min-w-0">
                      <p className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-[rgb(166,124,82)]">
                        Samet Alp
                      </p>
                      <p className="mt-1 truncate text-xs text-zinc-500">{userEmail}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                      aria-label="Kapat"
                    >
                      <X className="h-5 w-5" aria-hidden />
                    </button>
                  </div>

                  <nav className="flex flex-1 flex-col gap-0.5 p-2">
                    {nav.map(({ href, label, icon: Icon }) => {
                      const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
                      return (
                        <Link
                          key={href}
                          href={href}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                            active
                              ? "bg-zinc-800/80 text-zinc-100"
                              : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300",
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                          {label}
                        </Link>
                      );
                    })}
                  </nav>

                  <div className="border-t border-zinc-800 p-2">
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: "/admin/login" })}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-zinc-300"
                    >
                      <LogOut className="h-4 w-4" aria-hidden />
                      Çıkış
                    </button>
                  </div>
                </motion.aside>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </AdminToastProvider>
    </SessionProvider>
  );
}
