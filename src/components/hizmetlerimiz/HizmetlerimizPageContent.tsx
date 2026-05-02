"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SERVICES_GALLERY as SERVICES_GALLERY_TR } from "@/content/services-gallery";
import { SERVICES_GALLERY as SERVICES_GALLERY_EN } from "@/content/services-gallery.en";
import { HIZMETLERIMIZ_INTRO as HIZMETLERIMIZ_INTRO_TR } from "@/content/hizmetlerimiz-page";
import { HIZMETLERIMIZ_INTRO as HIZMETLERIMIZ_INTRO_EN } from "@/content/hizmetlerimiz-page.en";
import { cn } from "@/lib/cn";
import { localeFromPathname, withLocalePath } from "@/lib/locale";
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

function HizmetCard({ index }: { index: number }) {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const services = locale === "en" ? SERVICES_GALLERY_EN : SERVICES_GALLERY_TR;
  const service = services[index]!;

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
            <h3
              className={cn(
                "text-center font-display text-[11px] font-semibold uppercase leading-relaxed text-white drop-shadow-sm",
                "break-normal text-pretty tracking-[0.1em] sm:text-[11px] sm:tracking-[0.18em] md:text-xs md:tracking-[0.22em] lg:tracking-[0.24em]",
                "transition-transform duration-500 ease-out motion-reduce:transition-none",
                "group-hover:-translate-y-2 motion-reduce:group-hover:translate-y-0",
              )}
            >
              {service.title}
            </h3>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function HizmetlerimizPageContent() {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const SERVICES_GALLERY = locale === "en" ? SERVICES_GALLERY_EN : SERVICES_GALLERY_TR;
  const HIZMETLERIMIZ_INTRO =
    locale === "en" ? HIZMETLERIMIZ_INTRO_EN : HIZMETLERIMIZ_INTRO_TR;

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
        </motion.header>

        <motion.div
          className="mt-10 grid w-full min-w-0 grid-cols-1 gap-y-8 sm:mt-14 md:mt-16 md:grid-cols-2 md:gap-x-8 md:gap-y-10 lg:mt-20 lg:grid-cols-3 lg:gap-x-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.06, margin: "-4% 0px" }}
        >
          {SERVICES_GALLERY.map((service, index) => (
            <motion.div
              key={service.title}
              variants={itemVariants}
              className="min-w-0 w-full max-w-full"
              transition={reduceMotion ? undefined : { delay: Math.min(index * 0.06, 0.36) }}
            >
              <HizmetCard index={index} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
