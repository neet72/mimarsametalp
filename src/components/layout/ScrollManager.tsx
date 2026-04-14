"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollManager() {
  const pathname = usePathname();

  useEffect(() => {
    // Prevent browser from restoring previous scroll position on reload/back-forward.
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
    // Always start at top after navigation.
    if (typeof window === "undefined") return;
    // rAF avoids fighting with layout/transition frames.
    const id = window.requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
    return () => window.cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}

