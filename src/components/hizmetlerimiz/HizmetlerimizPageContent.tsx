"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { HIZMETLERIMIZ_INTRO as HIZMETLERIMIZ_INTRO_TR } from "@/content/hizmetlerimiz-page";
import { HIZMETLERIMIZ_INTRO as HIZMETLERIMIZ_INTRO_EN } from "@/content/hizmetlerimiz-page.en";
import { cn } from "@/lib/cn";
import type { ServiceListingItem } from "@/lib/service-listing-item";
import { withLocalePath } from "@/lib/locale";
import { fadeUpSoft } from "@/lib/motion";

const ease = [0.22, 1, 0.36, 1] as const;

const gridContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const cardItem: Variants = {
  hidden: {
    opacity: 0,
    y: 34,
    rotate: -0.35,
    scale: 0.985,
    filter: "blur(10px)",
    clipPath: "inset(10% 12% 18% 12% round 18px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    rotate: 0,
    scale: 1,
    filter: "blur(0px)",
    clipPath: "inset(0% 0% 0% 0% round 18px)",
    transition: { duration: 0.78, ease },
  },
};

function HizmetCard({
  service,
  index,
  locale,
}: {
  service: ServiceListingItem;
  index: number;
  locale: "tr" | "en";
}) {
  return (
    <Link
      href={withLocalePath(`/hizmetlerimiz/${service.slug}`, locale)}
      className="group block w-full min-w-0 max-w-full rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      aria-label={
        locale === "en"
          ? `Go to ${service.title} details`
          : `${service.title} detayına git`
      }
    >
      <article
        className={cn(
          "relative w-full min-w-0 max-w-full overflow-hidden rounded-xl bg-border/25",
          "shadow-[var(--shadow-card)] ring-1 ring-inset ring-primary/[0.06]",
          "transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-card-hover)]",
          "motion-reduce:transition-none motion-reduce:group-hover:translate-y-0",
        )}
      >
        <div className="relative aspect-video w-full min-w-0 overflow-hidden">
          <Image
            src={service.imageUrl}
            alt={
              locale === "en"
                ? `${service.title} — service overview image, Samet Alp Architecture`
                : `${service.title} — hizmet görünümü, Samet Alp Mimarlık`
            }
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={index === 0}
            className={cn(
              "object-cover object-center transition-transform duration-700 ease-out will-change-transform",
              "group-hover:scale-110 motion-reduce:group-hover:scale-100",
            )}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-6">
            <h2
              className={cn(
                "text-center font-display text-[11px] font-semibold uppercase leading-relaxed text-white drop-shadow-sm",
                "break-normal text-pretty tracking-[0.1em] sm:text-[11px] sm:tracking-[0.18em] md:text-xs md:tracking-[0.22em] lg:tracking-[0.24em]",
                "transition-transform duration-500 ease-out motion-reduce:transition-none",
                "group-hover:-translate-y-2 motion-reduce:group-hover:translate-y-0",
              )}
            >
              {service.title}
            </h2>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function HizmetlerimizPageContent({
  items,
  locale,
}: {
  items: ServiceListingItem[];
  locale: "tr" | "en";
}) {
  const reduceMotion = useReducedMotion();
  const HIZMETLERIMIZ_INTRO = locale === "en" ? HIZMETLERIMIZ_INTRO_EN : HIZMETLERIMIZ_INTRO_TR;

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
      <div className="mx-auto w-full min-w-0 max-w-[1440px] px-4 min-[400px]:px-6 py-16 sm:py-20 md:px-8 md:py-24">
        <motion.header
          className="mx-auto max-w-3xl text-center"
          variants={reduceMotion ? undefined : fadeUpSoft}
          initial={reduceMotion ? false : "hidden"}
          animate={reduceMotion ? undefined : "visible"}
          transition={{ duration: 0.72, ease }}
        >
          <h1 className="font-display text-xl font-semibold uppercase tracking-[0.35em] text-primary sm:text-2xl md:text-[1.65rem] md:tracking-[0.38em]">
            {locale === "en" ? "SERVICES" : "HİZMETLERİMİZ"}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-primary/65 sm:text-lg">
            {HIZMETLERIMIZ_INTRO}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={withLocalePath("/projeler", locale)}
              className={cn(
                "inline-flex items-center justify-center rounded-full border border-border bg-white px-5 py-2.5",
                "text-xs font-semibold uppercase tracking-[0.22em] text-primary/80",
                "transition-colors hover:border-primary/25 hover:bg-primary/[0.03] hover:text-primary",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent",
              )}
            >
              {locale === "en" ? "See Projects" : "Projeleri Gör"}
            </Link>
            <Link
              href={withLocalePath("/iletisim", locale)}
              className={cn(
                "inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5",
                "text-xs font-semibold uppercase tracking-[0.22em] text-white",
                "transition-colors hover:bg-primary/90",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent",
              )}
            >
              {locale === "en" ? "Contact" : "İletişim"}
            </Link>
          </div>
        </motion.header>

        <motion.div
          className="mt-10 grid w-full min-w-0 grid-cols-1 gap-y-8 sm:mt-14 md:mt-16 md:grid-cols-2 md:gap-x-8 md:gap-y-10 lg:mt-20 lg:grid-cols-3 lg:gap-x-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.06, margin: "-4% 0px" }}
        >
          {items.map((service, index) => (
            <motion.div
              key={service.slug}
              variants={itemVariants}
              className="min-w-0 w-full max-w-full"
              transition={reduceMotion ? undefined : { delay: Math.min(index * 0.06, 0.36) }}
            >
              <HizmetCard service={service} index={index} locale={locale} />
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-14 rounded-2xl border border-border bg-white/70 p-8 text-center shadow-[var(--shadow-card)] sm:mt-16 md:mt-20">
          <p className="mx-auto max-w-3xl text-pretty text-sm leading-relaxed text-primary/70 sm:text-base">
            {locale === "en"
              ? "Tell us your goals, constraints, and timeline. We’ll recommend the right scope and the most efficient delivery plan."
              : "Hedeflerinizi, kısıtlarınızı ve zaman planınızı paylaşın; size doğru kapsamı ve en verimli teslim planını önerelim."}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={withLocalePath("/iletisim", locale)}
              className={cn(
                "inline-flex items-center justify-center rounded-full bg-primary px-6 py-3",
                "text-xs font-semibold uppercase tracking-[0.22em] text-white",
                "transition-colors hover:bg-primary/90",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent",
              )}
            >
              {locale === "en" ? "Start a Request" : "Talep Oluştur / İletişim"}
            </Link>
            <Link
              href={withLocalePath("/projeler", locale)}
              className={cn(
                "inline-flex items-center justify-center rounded-full border border-border bg-white px-6 py-3",
                "text-xs font-semibold uppercase tracking-[0.22em] text-primary/80",
                "transition-colors hover:border-primary/25 hover:bg-primary/[0.03] hover:text-primary",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent",
              )}
            >
              {locale === "en" ? "Projects" : "Projeler"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
