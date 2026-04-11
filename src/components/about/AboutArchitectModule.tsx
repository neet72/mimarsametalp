"use client";

import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef } from "react";
import {
  ABOUT_ARCHITECT_BIO,
  ABOUT_ARCHITECT_NAME,
  ABOUT_ARCHITECT_ROLE,
} from "@/content/about-page";
import { cn } from "@/lib/cn";

const ease = [0.22, 1, 0.36, 1] as const;

const PORTRAIT_SRC = "/images/samet-alp-portrait.jpg";

export function AboutArchitectModule() {
  const reduceMotion = useReducedMotion();
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
              >
                <Image
                  src={PORTRAIT_SRC}
                  alt={`${ABOUT_ARCHITECT_NAME} portre`}
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
              viewport={{ once: true, amount: 0.32 }}
              transition={{ duration: 0.82, ease }}
            >
              <h2 className="font-display text-[2rem] font-semibold tracking-tight text-primary sm:text-4xl md:text-[2.35rem] md:leading-[1.12]">
                {ABOUT_ARCHITECT_NAME}
              </h2>
              <p className="mt-2.5 font-display text-[0.6875rem] font-semibold uppercase tracking-[0.32em] text-accent sm:text-xs">
                {ABOUT_ARCHITECT_ROLE}
              </p>
            </motion.div>

            <motion.p
              className="mt-7 max-w-2xl text-pretty text-[0.9375rem] leading-[1.65] text-primary/70 sm:text-base sm:leading-relaxed md:text-lg md:leading-relaxed"
              initial={reduceMotion ? false : { opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -14% 0px" }}
              transition={{ duration: 0.92, ease, delay: reduceMotion ? 0 : 0.06 }}
            >
              {ABOUT_ARCHITECT_BIO}
            </motion.p>

            <motion.div
              className="mt-10 h-px max-w-[12rem] origin-left bg-gradient-to-r from-accent/50 to-transparent"
              initial={reduceMotion ? false : { scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.85, ease, delay: reduceMotion ? 0 : 0.12 }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
