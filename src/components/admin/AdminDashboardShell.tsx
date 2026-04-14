"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { LayoutDashboard, FolderKanban, Inbox, LogOut, Wrench, Info, Phone } from "lucide-react";
import { cn } from "@/lib/cn";

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

  return (
    <SessionProvider>
      <div className="flex min-h-dvh">
        <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">
          <div className="border-b border-zinc-800 px-4 py-5">
            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-[rgb(166,124,82)]">
              Samet Alp
            </p>
            <p className="mt-1 truncate text-xs text-zinc-500">{userEmail}</p>
          </div>
          <nav className="flex flex-1 flex-col gap-0.5 p-2">
            {nav.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href || (href !== "/admin" && pathname.startsWith(href));
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
        <div className="min-w-0 flex-1 overflow-auto p-6 md:p-10">{children}</div>
      </div>
    </SessionProvider>
  );
}
