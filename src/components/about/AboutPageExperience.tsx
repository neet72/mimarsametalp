"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import { AboutArchitectModule } from "./AboutArchitectModule";
import { AboutVisionModule } from "./AboutVisionModule";

/**
 * Hakkımızda — Lenis ile yumuşak kaydırma; modüller scroll + motion ile güçlendirildi.
 */
export function AboutPageExperience() {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    // Mobil / touch cihazlarda Lenis scroll müdahalesi istemiyoruz
    if (typeof window !== "undefined") {
      const isCoarse = window.matchMedia?.("(pointer: coarse)")?.matches === true;
      if (isCoarse) return;
    }

    const lenis = new Lenis({
      lerp: 0.088,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.8,
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
  }, [reduceMotion]);

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-surface text-primary">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_-10%,rgb(var(--color-accent-rgb)/0.05),transparent_45%),radial-gradient(ellipse_55%_45%_at_0%_60%,rgb(var(--color-primary-rgb)/0.03),transparent_50%)]"
      />
      <div className="relative overflow-x-hidden">
        <AboutVisionModule />
        <AboutArchitectModule />
      </div>
    </div>
  );
}
