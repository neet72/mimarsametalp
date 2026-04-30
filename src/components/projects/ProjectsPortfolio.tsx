"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { useEffect } from "react";
import { ProjectCard } from "./ProjectCard";
import { fadeUpSoft } from "@/lib/motion";
import { usePathname } from "next/navigation";
import { localeFromPathname } from "@/lib/locale";

const ease = [0.22, 1, 0.36, 1] as const;

const cardReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 34,
    rotate: -0.35,
    scale: 0.985,
    filter: "blur(10px)",
    clipPath: "inset(10% 12% 18% 12% round 16px)",
  },
  show: {
    opacity: 1,
    y: 0,
    rotate: 0,
    scale: 1,
    filter: "blur(0px)",
    clipPath: "inset(0% 0% 0% 0% round 16px)",
    transition: { duration: 0.82, ease },
  },
};

const headerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

const headerItem: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease },
  },
};

const titleLetter: Variants = {
  hidden: { opacity: 0, y: "0.35em", rotateX: -55 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.72,
      ease,
      delay: 0.12 + i * 0.035,
    },
  }),
};

export type ProjectsPortfolioProject = {
  slug: string;
  title: string;
  imageUrl: string;
};

export function ProjectsPortfolio({ projects }: { projects: ProjectsPortfolioProject[] }) {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);

  useEffect(() => {
    if (reduceMotion) return;
    // Mobil / touch cihazlarda native scroll daha stabil (Lenis kapalı)
    if (typeof window !== "undefined") {
      const isCoarse = window.matchMedia?.("(pointer: coarse)")?.matches === true;
      if (isCoarse) return;
    }

    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 0.92,
      touchMultiplier: 1.85,
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

  const title = locale === "en" ? "Projects" : "Projeler";
  const kicker = locale === "en" ? "PORTFOLIO" : "PORTFOLYO";
  const description =
    locale === "en"
      ? "A curated selection of architectural and interior projects. Residential, commercial, and transformation works—from concept to execution."
      : "Seçili mimari ve iç mekân çalışmalarımızdan oluşan portfolyo seçkisi. Konut, ticari ve dönüşüm projelerinde tasarım ve uygulama süreçlerimizden örnekler.";

  return (
    <div className="relative w-full overflow-hidden bg-surface">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgb(var(--color-accent-rgb)/0.07),transparent_55%),radial-gradient(ellipse_70%_50%_at_100%_50%,rgb(var(--color-primary-rgb)/0.04),transparent_50%)]"
      />

      <div className="relative mx-auto w-full max-w-[1680px] px-4 sm:px-6 md:px-10 lg:px-16">
        <motion.header
          className="flex flex-col items-center py-16 text-center md:py-24"
          variants={headerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.p
            variants={headerItem}
            className="font-display text-[11px] font-semibold uppercase tracking-[0.32em] text-primary/55 sm:text-xs sm:tracking-[0.34em]"
          >
            {kicker}
          </motion.p>

          <motion.h1
            className="mt-5 flex flex-wrap justify-center gap-x-[0.04em] font-display text-4xl font-semibold tracking-tight text-primary perspective-[800px] sm:text-6xl md:text-7xl"
            aria-label={title}
          >
            {title.split("").map((char, i) => (
              <motion.span
                key={`${char}-${i}`}
                custom={i}
                variants={titleLetter}
                className="inline-block origin-bottom"
                style={{ transformStyle: "preserve-3d" }}
              >
                {char === " " ? "\u00a0" : char}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            variants={reduceMotion ? headerItem : fadeUpSoft}
            className="mt-6 max-w-3xl text-pretty text-lg leading-relaxed text-primary/65 sm:text-xl sm:leading-relaxed md:text-2xl md:leading-relaxed"
          >
            {description}
          </motion.p>
        </motion.header>

        <div className="grid grid-cols-1 gap-12 pb-16 pt-4 sm:gap-14 sm:pb-20 md:grid-cols-2 md:gap-x-10 md:gap-y-14 md:pb-28 lg:grid-cols-3 lg:gap-x-14 lg:gap-y-20">
          {projects.map((project, index) => (
            <motion.div
              key={project.slug}
              variants={reduceMotion ? undefined : cardReveal}
              initial={reduceMotion ? false : "hidden"}
              whileInView={reduceMotion ? undefined : "show"}
              viewport={{ once: false, margin: "0px 0px -12% 0px", amount: 0.14 }}
              transition={{
                // Awwwards-like domino timing
                delay: reduceMotion ? 0 : Math.min(index * 0.08, 0.64),
              }}
            >
              <ProjectCard project={project} index={index} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
