"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { useRef } from "react";
import { AboutHeroLoopVideo } from "@/components/about/AboutHeroLoopVideo";
import {
  ABOUT_VISION_BODY,
  ABOUT_VISION_TITLE,
} from "@/content/about-page";
import {
  ABOUT_VISION_BODY as ABOUT_VISION_BODY_EN,
  ABOUT_VISION_TITLE as ABOUT_VISION_TITLE_EN,
} from "@/content/about-page.en";
import { pageContainerClass } from "@/lib/page-layout";
import { cn } from "@/lib/cn";
import { usePathname } from "next/navigation";
import { localeFromPathname } from "@/lib/locale";

const ease = [0.22, 1, 0.36, 1] as const;

export function AboutVisionModule() {
  const reduceMotion = useReducedMotion() === true;
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const title = locale === "en" ? ABOUT_VISION_TITLE_EN : ABOUT_VISION_TITLE;
  const body = locale === "en" ? ABOUT_VISION_BODY_EN : ABOUT_VISION_BODY;
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const mediaParallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [-22, 22],
  );

  const cardContainer: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.11,
        delayChildren: 0.04,
      },
    },
  };

  const titleReveal: Variants = {
    hidden: { y: 40, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.78, ease },
    },
  };

  const bodyFade: Variants = reduceMotion
    ? {
        hidden: { opacity: 0, y: 14 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, ease, delay: 0.08 },
        },
      }
    : {
        hidden: { opacity: 0, y: 22, filter: "blur(12px)" },
        show: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.95, ease, delay: 0.12 },
        },
      };

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden pb-16 pt-6 md:pb-28 md:pt-8 lg:pb-36"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgb(var(--color-accent-rgb)/0.06),transparent_55%)]"
      />

      <div className={cn("relative", pageContainerClass)}>
        <div className="relative flex flex-col items-center">
          {/* Üst: tam genişlik video — ortalanmış blok */}
          <motion.div
            className="relative aspect-[16/10] w-full max-h-[min(58vh,560px)] min-h-[220px] overflow-hidden rounded-lg bg-border/40 shadow-[var(--shadow-card)] sm:aspect-[16/9] md:max-h-[min(52vh,600px)]"
            initial={reduceMotion ? false : { opacity: 0, scale: 1.02 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.9, ease }}
          >
            <motion.div
              className="absolute inset-0 will-change-transform"
              style={{ y: mediaParallaxY }}
            >
              <AboutHeroLoopVideo />
            </motion.div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/[0.18] via-transparent to-transparent"
            />
            <div
              aria-hidden
              className="absolute inset-0 ring-1 ring-inset ring-primary/[0.07]"
            />
          </motion.div>

          {/* Metin kutusu: yatayda tam orta, max genişlik editorial */}
          <motion.div
            className={cn(
              "relative z-10 -mt-10 w-full max-w-[min(100%,40rem)] sm:-mt-14 md:-mt-16",
              "rounded-lg border border-border/80 bg-surface/[0.97] p-8 shadow-[0_12px_48px_-8px_rgb(15_23_42/0.1),0_4px_16px_-4px_rgb(15_23_42/0.06)] backdrop-blur-xl sm:p-10 md:p-11",
            )}
            variants={cardContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.35, margin: "0px 0px -8% 0px" }}
          >
            <motion.div className="overflow-hidden" variants={titleReveal}>
              <h1 className="text-center font-display text-[1.65rem] font-semibold leading-[1.2] tracking-tight text-primary sm:text-3xl md:text-[2.125rem] md:leading-[1.15]">
                {title}
              </h1>
            </motion.div>

            <motion.div
              aria-hidden
              className="mx-auto mt-6 h-px w-12 max-w-full bg-gradient-to-r from-transparent via-accent/45 to-transparent sm:mt-7"
              initial={reduceMotion ? false : { scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.75, ease, delay: 0.15 }}
            />

            <motion.p
              variants={bodyFade}
              className="mt-6 text-pretty text-left text-[0.9375rem] leading-[1.7] text-primary/68 sm:text-base sm:leading-relaxed md:text-lg md:leading-relaxed"
            >
              {body}
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
