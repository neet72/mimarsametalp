"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ProjectCard } from "./ProjectCard";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Reveal } from "@/components/motion/FadeIn";
import { localeFromPathname, withLocalePath } from "@/lib/locale";
import { cn } from "@/lib/cn";
import {
  cardReveal,
  headerItem,
  headerReveal,
  staggerDelay,
  viewportOnce,
} from "@/lib/motion";

export type ProjectsPortfolioProject = {
  slug: string;
  title: string;
  imageUrl: string;
};

export function ProjectsPortfolio({ projects }: { projects: ProjectsPortfolioProject[] }) {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const hasProjects = projects.length > 0;

  const title = locale === "en" ? "Projects" : "Projeler";
  const kicker = locale === "en" ? "Portfolio" : "Portfolyo";
  const description =
    locale === "en"
      ? "Residential, commercial, and interior works — from first sketch to built space."
      : "Konut, ticari ve iç mekân işleri — ilk eskizden uygulamaya.";

  return (
    <div className="relative w-full overflow-hidden bg-surface">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-8%,rgb(var(--color-accent-rgb)/0.08),transparent_52%),linear-gradient(to_bottom,rgb(var(--color-primary-rgb)/0.03),transparent_28%)]"
      />

      <div className="relative mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <motion.header
          className="border-b border-border/70 pb-10 pt-12 sm:pb-12 sm:pt-16 md:pt-20"
          variants={reduceMotion ? undefined : headerReveal}
          initial={reduceMotion ? false : "hidden"}
          animate={reduceMotion ? undefined : "show"}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
            <div className="max-w-2xl">
              <motion.p
                variants={reduceMotion ? undefined : headerItem}
                className="font-display text-[10px] font-semibold uppercase tracking-[0.34em] text-accent sm:text-[11px]"
              >
                {kicker}
              </motion.p>
              <motion.h1
                variants={reduceMotion ? undefined : headerItem}
                className="mt-3 font-display text-4xl font-semibold tracking-tight text-primary sm:text-5xl md:text-6xl"
              >
                {title}
              </motion.h1>
              <motion.p
                variants={reduceMotion ? undefined : headerItem}
                className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg"
              >
                {description}
              </motion.p>
            </div>
            {hasProjects ? (
              <motion.p
                variants={reduceMotion ? undefined : headerItem}
                className="shrink-0 font-display text-[11px] font-medium uppercase tracking-[0.28em] text-muted tabular-nums"
              >
                {locale === "en"
                  ? `${projects.length} works`
                  : `${projects.length} çalışma`}
              </motion.p>
            ) : null}
          </div>
        </motion.header>

        {hasProjects ? (
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 py-12 sm:grid-cols-2 sm:gap-y-14 sm:py-14 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-16 lg:py-16">
            {projects.map((project, index) => (
              <motion.div
                key={project.slug}
                variants={reduceMotion ? undefined : cardReveal}
                initial={reduceMotion ? false : "hidden"}
                whileInView={reduceMotion ? undefined : "show"}
                viewport={viewportOnce}
                transition={{
                  delay: reduceMotion ? 0 : staggerDelay(index),
                }}
              >
                <ProjectCard project={project} index={index} />
              </motion.div>
            ))}
          </div>
        ) : (
          <Reveal className="flex flex-col items-start gap-6 border-b border-border/70 py-14 sm:py-16">
            <div aria-hidden className="h-px w-16 bg-accent/70" />
            <p className="max-w-md text-pretty text-base leading-relaxed text-muted sm:text-lg">
              {locale === "en"
                ? "Selected works are being prepared for this page. In the meantime, explore our services or get in touch."
                : "Seçili çalışmalar bu sayfa için hazırlanıyor. Bu sırada hizmetlerimizi inceleyebilir veya bizimle iletişime geçebilirsiniz."}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={withLocalePath("/hizmetlerimiz", locale)}
                className={cn(
                  "inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-panel px-6 py-2.5",
                  "font-display text-[11px] font-medium uppercase tracking-[0.22em] text-primary",
                  "transition hover:border-primary/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                )}
              >
                {locale === "en" ? "Services" : "Hizmetler"}
              </Link>
              <Link
                href={withLocalePath("/iletisim", locale)}
                className={cn(
                  "inline-flex min-h-11 items-center justify-center rounded-full bg-solid px-6 py-2.5",
                  "font-display text-[11px] font-medium uppercase tracking-[0.22em] text-on-solid",
                  "transition hover:bg-solid/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                )}
              >
                {locale === "en" ? "Contact" : "İletişim"}
              </Link>
            </div>
          </Reveal>
        )}

        <Reveal className="flex flex-col gap-5 border-t border-border/60 py-12 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:py-14 md:py-16">
          <p className="max-w-lg text-pretty text-sm leading-relaxed text-muted sm:text-base">
            {locale === "en"
              ? "Share the plot, budget, and timeline — we will propose a clear path forward."
              : "Arsa, bütçe ve zaman planını paylaşın — net bir yol haritası çıkaralım."}
          </p>
          <Link
            href={withLocalePath("/iletisim", locale)}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-solid px-7 py-2.5",
              "font-display text-[11px] font-medium uppercase tracking-[0.22em] text-on-solid",
              "transition hover:bg-solid/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
            )}
          >
            {locale === "en" ? "Start a conversation" : "Görüşme başlat"}
          </Link>
        </Reveal>
      </div>
    </div>
  );
}
