"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import Image from "next/image";
import { SERVICES_GALLERY } from "@/content/services-gallery";
import { HIZMETLERIMIZ_INTRO } from "@/content/hizmetlerimiz-page";
import { cn } from "@/lib/cn";

const ease = [0.22, 1, 0.36, 1] as const;

const gridContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.18, delayChildren: 0.08 },
  },
};

const cardItem: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease },
  },
};

function HizmetCard({ index }: { index: number }) {
  const service = SERVICES_GALLERY[index]!;

  return (
    <article className="group relative overflow-hidden rounded-xl bg-border/25 shadow-[var(--shadow-card)] ring-1 ring-inset ring-primary/[0.06]">
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={service.imageUrl}
          alt={service.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={index < 3}
          className={cn(
            "object-cover object-center transition-transform duration-700 ease-out will-change-transform",
            "group-hover:scale-110 motion-reduce:group-hover:scale-100",
          )}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <h3
            className={cn(
              "text-center font-display text-[10px] font-semibold uppercase leading-snug tracking-[0.2em] text-white drop-shadow-sm sm:text-[11px] sm:tracking-[0.22em] md:text-xs",
              "transition-transform duration-500 ease-out motion-reduce:transition-none",
              "group-hover:-translate-y-2 motion-reduce:group-hover:translate-y-0",
            )}
          >
            {service.title}
          </h3>
        </div>
      </div>
    </article>
  );
}

export function HizmetlerimizPageContent() {
  const reduceMotion = useReducedMotion();

  const containerVariants: Variants = reduceMotion
    ? {
        hidden: {},
        visible: { transition: { staggerChildren: 0, delayChildren: 0 } },
      }
    : gridContainer;

  const itemVariants: Variants = reduceMotion
    ? {
        hidden: { opacity: 1, y: 0 },
        visible: { opacity: 1, y: 0, transition: { duration: 0 } },
      }
    : cardItem;

  return (
    <div className="min-h-dvh w-full bg-surface text-primary">
      <div className="mx-auto w-full max-w-[1440px] px-8 py-24">
        <motion.header
          className="mx-auto max-w-3xl text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.72, ease }}
        >
          <h1 className="font-display text-xl font-semibold uppercase tracking-[0.35em] text-primary sm:text-2xl md:text-[1.65rem] md:tracking-[0.38em]">
            HİZMETLERİMİZ
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-primary/65 sm:text-lg">
            {HIZMETLERIMIZ_INTRO}
          </p>
        </motion.header>

        <motion.div
          className="mt-14 grid grid-cols-1 gap-8 md:mt-16 md:grid-cols-2 md:gap-10 lg:mt-20 lg:grid-cols-3 lg:gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.06, margin: "-4% 0px" }}
        >
          {SERVICES_GALLERY.map((service, index) => (
            <motion.div key={service.title} variants={itemVariants}>
              <HizmetCard index={index} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
