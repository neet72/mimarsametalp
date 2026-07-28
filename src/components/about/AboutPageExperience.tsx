"use client";

import type { AboutCmsDraft } from "@/lib/site-content/about-cms";
import { AboutArchitectModule } from "./AboutArchitectModule";
import { AboutVisionModule } from "./AboutVisionModule";

/**
 * Hakkımızda — modüller scroll + motion ile güçlendirildi.
 * Lenis public MainLayout / SmoothScrollHost üzerinden gelir.
 */
export function AboutPageExperience({ aboutCms }: { aboutCms?: AboutCmsDraft | null }) {
  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-surface text-primary">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_-10%,rgb(var(--color-accent-rgb)/0.05),transparent_45%),radial-gradient(ellipse_55%_45%_at_0%_60%,rgb(var(--color-primary-rgb)/0.03),transparent_50%)]"
      />
      <div className="relative overflow-x-hidden">
        <AboutVisionModule aboutCms={aboutCms} />
        <AboutArchitectModule aboutCms={aboutCms} />
      </div>
    </div>
  );
}
