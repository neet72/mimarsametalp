"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { WhatsAppGlyph } from "@/components/icons/WhatsAppGlyph";
import { CONTACT_SOCIAL_WHATSAPP } from "@/content/contact-page";
import { localeFromPathname } from "@/lib/locale";

export function FloatingWhatsAppCTA() {
  const pathname = usePathname();
  const isEn = localeFromPathname(pathname) === "en";
  const reduceMotion = useReducedMotion();
  const [showOnHome, setShowOnHome] = useState(false);

  const isHome = useMemo(() => pathname === "/" || pathname === "/en", [pathname]);
  const isAdmin = useMemo(() => pathname.startsWith("/admin"), [pathname]);

  useEffect(() => {
    // Hooks must always run; bail out inside the effect.
    if (isAdmin) return;

    // Reset behavior on route changes:
    // - Home: default hidden until we confirm hero is out of view.
    // - Non-home: always visible.
    if (!isHome) {
      setShowOnHome(true);
      return;
    }

    // Always start hidden on Home. We will enable only after a stable measurement.
    setShowOnHome(false);

    let raf = 0;
    let tries = 0;
    const recompute = () => {
      raf = 0;
      const sentinel = document.getElementById("home-content-start");
      if (!sentinel) {
        // Home is mounting; retry briefly.
        tries += 1;
        if (tries < 30) raf = window.requestAnimationFrame(recompute);
        else setShowOnHome(false);
        return;
      }

      const rect = sentinel.getBoundingClientRect();
      // If layout is not ready (can happen on bfcache/back navigation),
      // keep hidden and retry a few frames.
      if (rect.height < 1 && tries < 30) {
        tries += 1;
        raf = window.requestAnimationFrame(recompute);
        return;
      }

      // Use document-space position + current scrollY so back/forward restored scroll
      // is handled immediately (without requiring a new scroll event).
      const sentinelTop = rect.top + window.scrollY;
      // A small tolerance avoids 1px flicker.
      const passed = window.scrollY >= sentinelTop - 8;
      setShowOnHome(passed);
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(recompute);
    };

    // Initial after a couple frames to avoid early "0px" measurements.
    raf = window.requestAnimationFrame(() => {
      raf = window.requestAnimationFrame(recompute);
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("pageshow", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pageshow", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [isHome, isAdmin]);

  // Never show on admin routes
  if (isAdmin) return null;

  // On the homepage, hide the CTA until the user passes the hero section.
  if (isHome && !showOnHome) return null;

  return (
    <motion.div
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom,0px)+1rem)] right-[max(1rem,env(safe-area-inset-right,0px)+1rem)] z-[300]"
      initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={reduceMotion ? undefined : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={CONTACT_SOCIAL_WHATSAPP}
        target="_blank"
        rel="noopener noreferrer"
        title="WhatsApp"
        className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-primary px-3 py-2 text-[12px] font-semibold text-surface shadow-[0_14px_50px_-18px_rgb(15_23_42/0.6)] backdrop-blur-sm transition-[transform,box-shadow,background-color] hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_18px_70px_-22px_rgb(15_23_42/0.65)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:gap-3 sm:px-4 sm:py-3 sm:text-sm"
        aria-label={isEn ? "Contact via WhatsApp" : "WhatsApp ile iletişime geç"}
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 sm:h-10 sm:w-10">
          <WhatsAppGlyph className="h-[1.05rem] w-[1.05rem] text-surface/90 sm:h-[1.3rem] sm:w-[1.3rem]" strokeWidth={2} />
        </span>
        <span>WhatsApp</span>
      </Link>
    </motion.div>
  );
}

