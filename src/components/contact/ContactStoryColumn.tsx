"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  CONTACT_PAGE_CLOSING,
  CONTACT_PAGE_INTRO,
  CONTACT_PAGE_TITLE,
  CONTACT_STEPS,
  CONTACT_STEPS_HEADING,
} from "@/content/contact-page";

const ease = [0.22, 1, 0.36, 1] as const;

const timelineContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.13, delayChildren: 0.12 },
  },
};

const timelineItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.68, ease },
  },
};

export function ContactStoryColumn() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="flex flex-col"
      initial={reduceMotion ? false : { opacity: 0, x: -44 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.88, ease }}
    >
      <h1 className="font-display text-[2rem] font-semibold leading-tight tracking-tight text-primary sm:text-4xl md:text-[2.35rem]">
        {CONTACT_PAGE_TITLE}
      </h1>

      <motion.p
        className="mt-8 max-w-xl text-pretty text-[0.9375rem] leading-[1.75] text-primary/68 sm:text-base md:text-lg md:leading-relaxed"
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.76, ease, delay: reduceMotion ? 0 : 0.08 }}
      >
        {CONTACT_PAGE_INTRO}
      </motion.p>

      <motion.h2
        className="mt-12 font-display text-sm font-semibold uppercase tracking-[0.2em] text-primary/50 sm:text-[0.8125rem]"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease, delay: reduceMotion ? 0 : 0.12 }}
      >
        {CONTACT_STEPS_HEADING}
      </motion.h2>

      <motion.ol
        className="relative mt-8 space-y-0 pl-0"
        variants={timelineContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.12 }}
      >
        <span
          aria-hidden
          className="absolute left-[15px] top-3 bottom-3 w-px bg-gradient-to-b from-border via-accent/35 to-border sm:left-[17px]"
        />
        {CONTACT_STEPS.map((step, index) => (
          <motion.li
            key={step.title}
            variants={timelineItem}
            className="relative grid grid-cols-[auto_1fr] gap-5 pb-10 last:pb-0 sm:gap-6"
          >
            <div className="relative z-[1] flex w-8 shrink-0 justify-center sm:w-9">
              <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface font-display text-[11px] font-semibold text-accent shadow-sm sm:h-9 sm:w-9 sm:text-xs">
                {index + 1}
              </span>
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="font-display text-base font-semibold tracking-tight text-primary sm:text-lg">
                {step.title}
              </p>
              <p className="mt-2 text-pretty text-[0.9375rem] leading-relaxed text-primary/65 sm:text-base">
                {step.body}
              </p>
            </div>
          </motion.li>
        ))}
      </motion.ol>

      <motion.p
        className="mt-12 max-w-xl border-t border-border/80 pt-10 text-pretty text-[0.9375rem] leading-[1.75] text-primary/72 sm:text-base"
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.72, ease, delay: reduceMotion ? 0 : 0.06 }}
      >
        {CONTACT_PAGE_CLOSING}
      </motion.p>
    </motion.div>
  );
}
