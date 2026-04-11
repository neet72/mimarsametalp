"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ABOUT_SECTION_BODY } from "@/content/home-copy";
import { cn } from "@/lib/cn";
import { pageContainerClass } from "@/lib/page-layout";

const ease = [0.22, 1, 0.36, 1] as const;

const ABOUT_IMAGE = "/images/hero-4.webp";

export function AboutSection() {
  const reduceMotion = useReducedMotion();
  const xImage = reduceMotion ? 0 : -56;
  const xText = reduceMotion ? 0 : 56;

  return (
    <section
      className="border-t border-border/60 bg-surface py-24 sm:py-28 lg:py-32"
      aria-labelledby="firma-hakkinda-baslik"
    >
      <div className={pageContainerClass}>
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16 xl:gap-20 2xl:gap-24">
          <motion.div
            className="relative lg:col-span-5"
            initial={reduceMotion ? false : { opacity: 0, x: xImage }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.78, ease }}
          >
            <div
              className={cn(
                "relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-2xl border border-border/60 bg-border/20 shadow-card lg:mx-0 lg:max-w-none",
                "lg:min-h-[min(72vh,640px)] lg:aspect-auto",
              )}
            >
              <Image
                src={ABOUT_IMAGE}
                alt="Samet Alp Mimarlık mimari proje görseli"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col justify-center lg:col-span-7"
            initial={reduceMotion ? false : { opacity: 0, x: xText }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.78, delay: reduceMotion ? 0 : 0.06, ease }}
          >
            <h2
              id="firma-hakkinda-baslik"
              className="font-display text-3xl font-semibold tracking-tight text-primary sm:text-4xl"
            >
              Firmamız Hakkında
            </h2>
            <p className="mt-6 max-w-3xl text-pretty text-base leading-[1.85] text-muted sm:text-lg">
              {ABOUT_SECTION_BODY}
            </p>
            <div className="mt-10">
              <Link
                href="/hakkimizda"
                aria-label="Hakkımızda sayfasına git"
                className="inline-flex items-center justify-center rounded-full bg-primary px-10 py-3 font-display text-[11px] font-medium uppercase tracking-[0.28em] text-surface shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                HAKKIMIZDA
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
