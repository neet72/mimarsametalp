"use client";

import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { useRef } from "react";
import {
  ABOUT_ARCHITECT_BIO,
  ABOUT_ARCHITECT_NAME,
  ABOUT_ARCHITECT_ROLE,
} from "@/content/about-page";
import {
  ABOUT_ARCHITECT_BIO as ABOUT_ARCHITECT_BIO_EN,
  ABOUT_ARCHITECT_NAME as ABOUT_ARCHITECT_NAME_EN,
  ABOUT_ARCHITECT_ROLE as ABOUT_ARCHITECT_ROLE_EN,
} from "@/content/about-page.en";
import type { AboutCmsDraft } from "@/lib/site-content/about-cms";
import { cn } from "@/lib/cn";
import { usePathname } from "next/navigation";
import { localeFromPathname } from "@/lib/locale";

const ease = [0.22, 1, 0.36, 1] as const;

const PORTRAIT_FALLBACK = "/images/samet-alp-portrait.webp";

const portraitReveal = {
  hidden: {
    opacity: 0,
    y: 18,
    rotate: -0.35,
    scale: 0.985,
    filter: "blur(10px)",
    clipPath: "inset(10% 12% 18% 12% round 10px)",
  },
  show: {
    opacity: 1,
    y: 0,
    rotate: 0,
    scale: 1,
    filter: "blur(0px)",
    clipPath: "inset(0% 0% 0% 0% round 10px)",
    transition: { duration: 0.86, ease },
  },
} satisfies Record<"hidden" | "show", Record<string, unknown>>;

export function AboutArchitectModule({ aboutCms }: { aboutCms?: AboutCmsDraft | null }) {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const staticName = locale === "en" ? ABOUT_ARCHITECT_NAME_EN : ABOUT_ARCHITECT_NAME;
  const staticRole = locale === "en" ? ABOUT_ARCHITECT_ROLE_EN : ABOUT_ARCHITECT_ROLE;
  const staticBio = locale === "en" ? ABOUT_ARCHITECT_BIO_EN : ABOUT_ARCHITECT_BIO;
  const portraitSrc =
    typeof aboutCms?.portraitImageUrl === "string" && aboutCms.portraitImageUrl.trim().length > 0
      ? aboutCms.portraitImageUrl.trim()
      : PORTRAIT_FALLBACK;
  const name =
    typeof aboutCms?.architectName === "string" && aboutCms.architectName.trim().length > 0
      ? aboutCms.architectName.trim()
      : staticName;
  const role =
    typeof aboutCms?.architectRole === "string" && aboutCms.architectRole.trim().length > 0
      ? aboutCms.architectRole.trim()
      : staticRole;
  const bio =
    typeof aboutCms?.architectBio === "string" && aboutCms.architectBio.trim().length > 0
      ? aboutCms.architectBio.trim()
      : staticBio;
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const frameParallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [40, -40],
  );

  const innerImageY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [14, -14],
  );

  return (
    <section
      ref={sectionRef}
      className="relative border-t border-border/50 bg-surface py-14 md:py-20 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />

      <div className="relative mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-16">
        <div className="grid gap-11 lg:grid-cols-12 lg:items-start lg:gap-14">
          <div className="lg:col-span-5">
            <motion.div
              className="relative mx-auto aspect-[3/4] max-w-md overflow-hidden rounded-md bg-border/35 shadow-[var(--shadow-card)] lg:mx-0 lg:max-w-none"
              style={{ y: frameParallaxY }}
              variants={reduceMotion ? undefined : (portraitReveal as Variants)}
              initial={reduceMotion ? false : "hidden"}
              whileInView={reduceMotion ? undefined : "show"}
              viewport={{ once: false, amount: 0.35, margin: "-6% 0px" }}
              whileHover={
                reduceMotion
                  ? undefined
                  : {
                      boxShadow:
                        "0 4px 12px rgb(15 23 42 / 0.07), 0 18px 44px rgb(15 23 42 / 0.1)",
                      transition: { duration: 0.45, ease },
                    }
              }
            >
              <motion.div
                className="absolute inset-0 will-change-transform"
                style={{ y: innerImageY }}
                initial={reduceMotion ? false : { scale: 1.035 }}
                whileInView={reduceMotion ? undefined : { scale: 1 }}
                viewport={{ once: false, amount: 0.35, margin: "-6% 0px" }}
                transition={reduceMotion ? undefined : { duration: 1.05, ease }}
              >
                <Image
                  src={portraitSrc}
                  alt={locale === "en" ? `${name} portrait` : `${name} portre`}
                  fill
                  className={cn(
                    "object-cover object-[center_22%] transition-transform duration-[880ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                    "hover:scale-[1.02] motion-reduce:hover:scale-100",
                  )}
                  sizes="(max-width: 1024px) 90vw, 38vw"
                />
              </motion.div>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-primary/[0.08]"
              />
            </motion.div>
          </div>

          <div className="flex flex-col lg:col-span-7">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 36, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: false, amount: 0.32 }}
              transition={{ duration: 0.82, ease }}
            >
              <h2 className="font-display text-[2rem] font-semibold tracking-tight text-primary sm:text-4xl md:text-[2.35rem] md:leading-[1.12]">
                {name}
              </h2>
              <p className="mt-2.5 font-display text-[0.6875rem] font-semibold uppercase tracking-[0.32em] text-accent sm:text-xs">
                {role}
              </p>
            </motion.div>

            <motion.p
              className="mt-7 max-w-2xl text-pretty text-[0.9375rem] leading-[1.65] text-primary/70 sm:text-base sm:leading-relaxed md:text-lg md:leading-relaxed"
              initial={reduceMotion ? false : { opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "0px 0px -14% 0px" }}
              transition={{ duration: 0.92, ease, delay: reduceMotion ? 0 : 0.06 }}
            >
              {bio}
            </motion.p>

            <motion.div
              className="mt-10 h-px max-w-[12rem] origin-left bg-gradient-to-r from-accent/50 to-transparent"
              initial={reduceMotion ? false : { scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 0.85, ease, delay: reduceMotion ? 0 : 0.12 }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
