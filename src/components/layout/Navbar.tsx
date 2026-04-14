"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { PAGE_MAX_CLASS, PAGE_PAD_X } from "@/lib/page-layout";
import { localeFromPathname, withLocalePath } from "@/lib/locale";

const nav = [
  { href: "/projeler", label: "Projeler" },
  { href: "/hizmetlerimiz", label: "Hizmetlerimiz" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
] as const;

const navEn = [
  { href: "/projeler", label: "Projects" },
  { href: "/hizmetlerimiz", label: "Services" },
  { href: "/hakkimizda", label: "About" },
  { href: "/iletisim", label: "Contact" },
] as const;

const shellClass = cn(
  "mx-auto flex w-full items-center justify-between gap-x-3 gap-y-2 py-4 md:grid md:grid-cols-[auto_1fr_auto] md:items-center md:justify-normal md:gap-y-1.5 md:py-5",
  PAGE_MAX_CLASS,
  PAGE_PAD_X,
  "md:gap-x-6 lg:gap-x-10 xl:gap-x-12",
);

/** Masaüstü nav linkleri */
const desktopNavLinkClass =
  "group relative py-2 font-display text-[0.6875rem] font-medium uppercase tracking-[0.26em] text-muted transition-colors duration-300 hover:text-primary sm:text-[0.75rem] md:py-2.5 md:text-[0.8125rem] md:tracking-[0.28em]";

/** Mobil menü — tam ekran, dikey liste */
const mobileMenuLinkClass =
  "touch-manipulation relative block w-full rounded-xl px-4 py-4 text-center font-display text-2xl font-semibold tracking-tight text-primary transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:text-[1.75rem]";

const mobileList: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.06 } },
};

const mobileItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const } },
};

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
        desktopNavLinkClass,
        active && "text-primary",
      )}
    >
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-1 left-0 right-0 flex justify-center"
      >
        {active ? (
          <motion.span
            layoutId="nav-underline"
            className="h-px w-[min(100%,11rem)] bg-accent"
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          />
        ) : (
          <span className="h-px w-[min(100%,11rem)] scale-x-0 bg-accent transition-transform duration-500 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none" />
        )}
      </span>
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = localeFromPathname(pathname);
  const navItems = locale === "en" ? navEn : nav;
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const [hiddenOnScroll, setHiddenOnScroll] = useState(false);
  const lastYRef = useRef(0);
  const lastDirRef = useRef<"up" | "down">("up");
  const panelId = useId();
  const motionDuration = reduceMotion ? 0.01 : 0.28;
  const motionEase = [0.22, 1, 0.36, 1] as const;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
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

  useEffect(() => {
    if (open) {
      setHiddenOnScroll(false);
      return;
    }
    const MIN_Y = 120; // don't hide near top
    const DELTA = 2; // sensitivity (smaller = comes back easier)

    lastYRef.current = typeof window !== "undefined" ? window.scrollY : 0;
    lastDirRef.current = "up";

    const onScroll = () => {
      const y = window.scrollY || 0;
      const prev = lastYRef.current;
      const diff = y - prev;

      // Always show close to top.
      if (y < 40) {
        setHiddenOnScroll(false);
        lastDirRef.current = "up";
        lastYRef.current = y;
        return;
      }

      if (diff > DELTA && y > MIN_Y) {
        if (lastDirRef.current !== "down") lastDirRef.current = "down";
        setHiddenOnScroll(true);
      } else if (diff < -DELTA) {
        if (lastDirRef.current !== "up") lastDirRef.current = "up";
        setHiddenOnScroll(false);
      }

      lastYRef.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 border-b border-border/70 pt-[env(safe-area-inset-top,0px)]",
        "z-[250] isolate",
        "bg-surface/80 backdrop-blur-xl",
        "will-change-transform transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        // Tailwind arbitrary calc() can be dropped by tooling; keep it robust.
        hiddenOnScroll && "-translate-y-full",
      )}
    >
      {/* Üst bar: backdrop ve panelin üzerinde kalmalı */}
      <div className={cn(shellClass, "relative z-[120]")}>
        <Link
          href={withLocalePath("/", locale)}
          className="touch-manipulation min-w-0 max-md:max-w-[calc(100%-7rem)] max-md:truncate py-2 font-display text-[0.6875rem] font-semibold uppercase leading-tight tracking-[0.22em] text-primary transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:py-0 sm:text-[0.75rem] sm:tracking-[0.24em] md:max-w-none md:justify-self-start md:overflow-visible md:whitespace-normal md:text-[0.8125rem] md:tracking-[0.26em]"
        >
          Samet Alp Mimarlık
        </Link>

        <nav
          aria-label="Ana menü"
          className="hidden min-w-0 md:flex md:items-center md:justify-center md:justify-self-center md:px-6 lg:px-10 xl:px-14"
        >
          <div className="flex items-center gap-6 md:gap-8 lg:gap-10 xl:gap-12">
            {navItems.map((item) => {
              const href = withLocalePath(item.href, locale);
              const active = pathname === href;
              return (
                <NavUnderlineLink key={item.href} href={href} active={active}>
                  {item.label}
                </NavUnderlineLink>
              );
            })}
          </div>
        </nav>

        <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3 md:justify-self-end">
          <button
            type="button"
            className="touch-manipulation flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-full border border-border/90 px-3 font-display text-[0.6875rem] font-medium tracking-wide text-muted transition-colors hover:border-primary/20 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:min-h-0 sm:min-w-0 sm:px-4 sm:py-2 sm:text-xs md:text-[0.8125rem]"
            aria-haspopup="listbox"
            aria-expanded="false"
            onClick={() => {
              const next = locale === "en" ? "tr" : "en";
              router.push(withLocalePath(pathname, next));
            }}
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
            {locale === "en" ? "English" : "Türkçe"}
          </button>

          <button
            type="button"
            className="touch-manipulation inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border/90 text-primary transition-colors hover:border-primary/25 hover:bg-primary/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:hidden"
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
          <motion.div
            key="mobile-menu-root"
            className="fixed inset-0 z-[200] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: motionDuration }}
          >
            {/* Arka plan (tam opak panel üstünde hafif karartma) */}
            <motion.button
              type="button"
              aria-label="Menüyü kapat"
              className="touch-manipulation absolute inset-0 bg-primary/45"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={reduceMotion ? undefined : { opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: motionDuration, ease: motionEase }}
              onClick={() => setOpen(false)}
            />

            {/* Panel: tam ekran, kesin opak zemin, scroll güvenli */}
            <motion.div
              id={panelId}
              role="dialog"
              aria-modal="true"
              aria-label="Mobil menü"
              className="relative mx-auto flex min-h-[100dvh] w-full flex-col bg-surface pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] will-change-transform"
              initial={reduceMotion ? false : { y: 18, scale: 0.995 }}
              animate={reduceMotion ? undefined : { y: 0, scale: 1 }}
              exit={reduceMotion ? undefined : { y: 18, scale: 0.995 }}
              transition={{ duration: motionDuration, ease: motionEase }}
            >
              <div className={cn(shellClass, "py-4")}>
                <Link
                  href={withLocalePath("/", locale)}
                  className="touch-manipulation min-w-0 max-w-[calc(100%-3.25rem)] truncate py-2 font-display text-[0.6875rem] font-semibold uppercase leading-tight tracking-[0.22em] text-primary transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:text-[0.75rem] sm:tracking-[0.24em]"
                  onClick={() => setOpen(false)}
                >
                  Samet Alp Mimarlık
                </Link>

                <button
                  type="button"
                  className="touch-manipulation inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border/90 text-primary transition-colors hover:border-primary/25 hover:bg-primary/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  onClick={() => setOpen(false)}
                >
                  <span className="sr-only">Menüyü kapat</span>
                  <X className="h-6 w-6" strokeWidth={1.65} />
                </button>
              </div>

              <nav
                aria-label="Mobil sayfa bağlantıları"
                className="flex min-h-0 flex-1 flex-col items-center justify-start gap-2 overflow-y-auto px-6 py-10 [-webkit-overflow-scrolling:touch] sm:px-8"
              >
                <motion.div
                  className="w-full max-w-md space-y-2"
                  variants={reduceMotion ? undefined : mobileList}
                  initial={reduceMotion ? undefined : "hidden"}
                  animate={reduceMotion ? undefined : "show"}
                >
                  {navItems.map((item) => {
                    const href = withLocalePath(item.href, locale);
                    const active = pathname === href;
                    return (
                      <motion.div key={item.href} variants={reduceMotion ? undefined : mobileItem}>
                        <Link
                          href={href}
                          className={cn(
                            mobileMenuLinkClass,
                            "bg-white/0",
                            active && "text-accent",
                          )}
                          onClick={() => setOpen(false)}
                        >
                          {item.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </nav>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
