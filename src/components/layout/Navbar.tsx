"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/cn";
import { PAGE_MAX_CLASS, PAGE_PAD_X } from "@/lib/page-layout";

const nav = [
  { href: "/projeler", label: "Projeler" },
  { href: "/hizmetlerimiz", label: "Hizmetlerimiz" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
] as const;

const shellClass = cn(
  "mx-auto grid w-full items-center gap-x-3 gap-y-2 py-4 md:gap-y-1.5 md:py-5",
  PAGE_MAX_CLASS,
  PAGE_PAD_X,
  "grid-cols-[1fr_auto] md:grid-cols-[auto_1fr_auto] md:gap-x-6 lg:gap-x-10 xl:gap-x-12",
);

const mobileLinkClass =
  "font-display text-4xl font-medium tracking-tight text-primary transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:text-[2.125rem]";

function NavUnderlineLink({
  href,
  children,
  active,
}: {
  href: string;
  children: ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative py-2 font-display text-[0.6875rem] font-medium uppercase tracking-[0.26em] text-muted transition-colors duration-300 hover:text-primary sm:text-[0.75rem] md:py-2.5 md:text-[0.8125rem] md:tracking-[0.28em]",
        active && "text-primary",
      )}
    >
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute bottom-1 left-1/2 h-px w-[min(108%,11rem)] -translate-x-1/2 origin-center bg-accent transition-transform duration-500 ease-out motion-reduce:transition-none",
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100",
        )}
        style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
      />
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const panelId = useId();
  const motionDuration = reduceMotion ? 0.01 : 0.36;
  const motionEase = [0.22, 1, 0.36, 1] as const;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-surface/80 backdrop-blur-xl">
      <div className={shellClass}>
        <Link
          href="/"
          className="min-w-0 justify-self-start font-display text-[0.6875rem] font-semibold uppercase leading-tight tracking-[0.22em] text-primary transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:text-[0.75rem] sm:tracking-[0.24em] md:text-[0.8125rem] md:tracking-[0.26em]"
        >
          Samet Alp Mimarlık
        </Link>

        <nav
          aria-label="Ana menü"
          className="hidden min-w-0 justify-self-center md:col-start-2 md:flex md:px-6 lg:px-10 xl:px-14"
        >
          <div className="flex items-center gap-6 md:gap-8 lg:gap-10 xl:gap-12">
            {nav.map((item) => (
              <NavUnderlineLink key={item.href} href={item.href} active={pathname === item.href}>
                {item.label}
              </NavUnderlineLink>
            ))}
          </div>
        </nav>

        <div className="col-start-2 flex shrink-0 items-center justify-self-end gap-2 sm:gap-3 md:col-start-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-border/90 px-3.5 py-1.5 font-display text-[0.6875rem] font-medium tracking-wide text-muted transition-colors hover:border-primary/20 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:px-4 sm:py-2 sm:text-xs md:text-[0.8125rem]"
            aria-haspopup="listbox"
            aria-expanded="false"
          >
            <span className="sr-only">Dil seçimi</span>
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5 shrink-0 text-muted sm:h-4 sm:w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            Türkçe
          </button>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/90 text-primary transition-colors hover:border-primary/25 hover:bg-primary/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:hidden"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Menüyü kapat" : "Menüyü aç"}</span>
            {open ? <X className="h-6 w-6" strokeWidth={1.65} /> : <Menu className="h-6 w-6" strokeWidth={1.65} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              key="mobile-backdrop"
              type="button"
              aria-label="Menüyü kapat"
              className="fixed inset-0 z-[90] bg-primary/45 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0.01 : 0.28 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              key="mobile-panel"
              id={panelId}
              role="dialog"
              aria-modal="true"
              aria-label="Mobil menü"
              className="fixed inset-y-0 right-0 z-[100] flex w-[min(22rem,90vw)] flex-col border-l border-border bg-surface shadow-card-hover md:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "tween",
                duration: motionDuration,
                ease: motionEase,
              }}
            >
              <div className="flex flex-1 flex-col gap-2 px-8 pb-12 pt-6">
                {nav.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: reduceMotion ? 0.01 : 0.38,
                      delay: reduceMotion ? 0 : 0.06 + index * 0.06,
                      ease: motionEase,
                    }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        mobileLinkClass,
                        pathname === item.href && "text-accent",
                      )}
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
