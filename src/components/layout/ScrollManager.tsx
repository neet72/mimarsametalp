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

    // Hash hedeflerine izin ver (örn. #section)
    if (window.location.hash) return;

    const goTop = () => {
      scrollToTopImmediate();
    };

    // Senkron + layout sonrası: Lenis/next soft-nav bazen bir frame gecikmeli ölçer.
    goTop();
    const raf1 = window.requestAnimationFrame(() => {
      goTop();
      window.requestAnimationFrame(() => {
        goTop();
        window.dispatchEvent(new Event("scroll"));
        window.dispatchEvent(new Event("resize"));
      });
    });
    const t1 = window.setTimeout(goTop, 40);
    const t2 = window.setTimeout(goTop, 120);

    return () => {
      window.cancelAnimationFrame(raf1);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [pathname]);

  return null;
}
