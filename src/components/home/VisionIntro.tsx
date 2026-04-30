"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ABOUT_SECTION_BODY as ABOUT_SECTION_BODY_TR } from "@/content/home-copy";
import { ABOUT_SECTION_BODY as ABOUT_SECTION_BODY_EN } from "@/content/home-copy.en";
import { localeFromPathname, withLocalePath } from "@/lib/locale";
import { easePremium, fadeUpSoft, stagger } from "@/lib/motion";

export function VisionIntro() {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const ABOUT_SECTION_BODY = locale === "en" ? ABOUT_SECTION_BODY_EN : ABOUT_SECTION_BODY_TR;

  return (
    <section
      className="border-t border-border/50 bg-surface py-24 sm:py-28 lg:py-32"
      aria-labelledby="vizyon-baslik"
    >
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-6">
        <motion.div
          variants={reduceMotion ? undefined : stagger({ stagger: 0.09, delay: 0.02 })}
          initial={reduceMotion ? false : "hidden"}
          whileInView={reduceMotion ? undefined : "visible"}
          viewport={{ once: false, margin: "-10% 0px" }}
          transition={reduceMotion ? undefined : { duration: 0.6, ease: easePremium }}
        >
          <motion.p variants={reduceMotion ? undefined : fadeUpSoft} className="font-display text-[10px] font-semibold uppercase tracking-[0.34em] text-muted sm:text-[11px]">
            Samet Alp Mimarlık
          </motion.p>
          <motion.h1
            id="vizyon-baslik"
            className="mt-5 font-display text-3xl font-semibold leading-tight tracking-tight text-primary sm:text-4xl lg:text-[2.35rem]"
            variants={reduceMotion ? undefined : fadeUpSoft}
          >
            {locale === "en" ? "We connect spaces with life." : "Mekânları yaşamla buluşturuyoruz."}
          </motion.h1>
          <motion.p variants={reduceMotion ? undefined : fadeUpSoft} className="mt-7 text-pretty text-base leading-relaxed text-muted sm:text-lg">
            {ABOUT_SECTION_BODY}
          </motion.p>
          <motion.div variants={reduceMotion ? undefined : fadeUpSoft} className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:mt-14">
            <Link
              href={withLocalePath("/hakkimizda", locale)}
              aria-label={
                locale === "en" ? "Go to the About page" : "Hakkımızda sayfasına git"
              }
              className="inline-flex min-h-11 min-w-[10.5rem] items-center justify-center rounded-full bg-primary px-8 py-2.5 font-display text-[11px] font-medium uppercase tracking-[0.26em] text-surface transition duration-300 hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {locale === "en" ? "ABOUT" : "HAKKIMIZDA"}
            </Link>
            <Link
              href={withLocalePath("/projeler", locale)}
              title={locale === "en" ? "Go to projects page" : "Projeler sayfasına git"}
              className="inline-flex min-h-11 min-w-[10.5rem] items-center justify-center rounded-full border border-border bg-transparent px-8 py-2.5 font-display text-[11px] font-medium uppercase tracking-[0.26em] text-primary transition duration-300 hover:border-primary/35 hover:bg-primary/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {locale === "en" ? "PROJECTS" : "PROJELER"}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
