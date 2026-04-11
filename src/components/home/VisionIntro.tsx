"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ABOUT_SECTION_BODY } from "@/content/home-copy";

const ease = [0.22, 1, 0.36, 1] as const;

export function VisionIntro() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="border-t border-border/50 bg-surface py-24 sm:py-28 lg:py-32"
      aria-labelledby="vizyon-baslik"
    >
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-6">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.6, ease }}
        >
          <p className="font-display text-[10px] font-semibold uppercase tracking-[0.34em] text-muted sm:text-[11px]">
            Samet Alp Mimarlık
          </p>
          <h1
            id="vizyon-baslik"
            className="mt-5 font-display text-3xl font-semibold leading-tight tracking-tight text-primary sm:text-4xl lg:text-[2.35rem]"
          >
            Mekânları yaşamla buluşturuyoruz.
          </h1>
          <p className="mt-7 text-pretty text-base leading-relaxed text-muted sm:text-lg">
            {ABOUT_SECTION_BODY}
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:mt-14">
            <Link
              href="/hakkimizda"
              aria-label="Hakkımızda sayfasına git"
              className="inline-flex min-h-11 min-w-[10.5rem] items-center justify-center rounded-full bg-primary px-8 py-2.5 font-display text-[11px] font-medium uppercase tracking-[0.26em] text-surface transition duration-300 hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              HAKKIMIZDA
            </Link>
            <Link
              href="/projeler"
              className="inline-flex min-h-11 min-w-[10.5rem] items-center justify-center rounded-full border border-border bg-transparent px-8 py-2.5 font-display text-[11px] font-medium uppercase tracking-[0.26em] text-primary transition duration-300 hover:border-primary/35 hover:bg-primary/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              PROJELER
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
