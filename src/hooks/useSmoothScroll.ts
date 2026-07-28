"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useReducedMotion } from "framer-motion";
import { useEffect } from "react";

type UseSmoothScrollOptions = {
  lerp?: number;
  wheelMultiplier?: number;
  touchMultiplier?: number;
};

/**
 * Desktop-only Lenis smooth scroll. Skips reduced-motion and coarse pointers.
 */
export function useSmoothScroll(options?: UseSmoothScrollOptions) {
  const reduceMotion = useReducedMotion();
  const lerp = options?.lerp ?? 0.09;
  const wheelMultiplier = options?.wheelMultiplier ?? 0.92;
  const touchMultiplier = options?.touchMultiplier ?? 1.85;

  useEffect(() => {
    if (reduceMotion) return;
    if (typeof window !== "undefined") {
      const isCoarse = window.matchMedia?.("(pointer: coarse)")?.matches === true;
      if (isCoarse) return;
    }

    const lenis = new Lenis({
      lerp,
      smoothWheel: true,
      wheelMultiplier,
      touchMultiplier,
    });

    let rafId = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [reduceMotion, lerp, wheelMultiplier, touchMultiplier]);
}
