"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { scrollToTopImmediate } from "@/lib/scroll-top";

export function ScrollManager() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash) return;

    scrollToTopImmediate();
    const raf = window.requestAnimationFrame(() => {
      scrollToTopImmediate();
    });
    // Lenis soft-nav için tek gecikmeli yedek (önceki 3× raf + 2 timeout sadeleştirildi).
    const t = window.setTimeout(scrollToTopImmediate, 80);

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, [pathname]);

  return null;
}
