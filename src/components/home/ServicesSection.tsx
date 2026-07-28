"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, type Variants } from "framer-motion";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SERVICES_GALLERY as SERVICES_GALLERY_TR } from "@/content/services-gallery";
import { SERVICES_GALLERY as SERVICES_GALLERY_EN } from "@/content/services-gallery.en";
import type { ServiceListingItem } from "@/lib/service-listing-item";
import { localeFromPathname, withLocalePath } from "@/lib/locale";
import { easePremium, fadeUp, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/cn";

const stripContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.06,
    },
  },
};

const cardItem: Variants = {
  hidden: { opacity: 0, x: 26 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.68, ease: easePremium },
  },
};

export function ServicesSection({ serviceItems }: { serviceItems?: ServiceListingItem[] }) {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const staticGallery = locale === "en" ? SERVICES_GALLERY_EN : SERVICES_GALLERY_TR;
  const SERVICES_GALLERY =
    serviceItems && serviceItems.length > 0 ? serviceItems : staticGallery;

  const containerVariants: Variants = reduceMotion
    ? { hidden: {}, visible: { transition: { staggerChildren: 0, delayChildren: 0 } } }
    : stripContainer;

  const itemVariants: Variants = reduceMotion
    ? { hidden: { opacity: 1, x: 0 }, visible: { opacity: 1, x: 0, transition: { duration: 0 } } }
    : cardItem;

  const loopItems = useMemo(() => [...SERVICES_GALLERY, ...SERVICES_GALLERY], [SERVICES_GALLERY]);
  const [paused, setPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const pause = useCallback(() => setPaused(true), []);
  const resume = useCallback(() => setPaused(false), []);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const halfWRef = useRef(0);
  const lastTRef = useRef<number | null>(null);

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    halfWRef.current = el.scrollWidth / 2;
  }, []);

  useEffect(() => {
    measure();
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measure, loopItems.length]);

  useAnimationFrame((t) => {
    if (reduceMotion || paused || isDragging) {
      lastTRef.current = t;
      return;
    }
    if (lastTRef.current == null) lastTRef.current = t;
    const dt = Math.min(0.05, (t - lastTRef.current) / 1000);
    lastTRef.current = t;

    const half = halfWRef.current;
    if (!half) return;

    const SPEED = 24;
    let next = x.get() - SPEED * dt;
    if (next <= -half) next += half;
    x.set(next);
  });

  return (
    <section
      className="border-t border-border/60 bg-surface py-24 md:py-28"
      aria-labelledby="hizmetlerimiz-baslik"
    >
      <div className="mx-auto w-full min-w-0 max-w-[1440px] px-4 min-[400px]:px-6 md:px-16">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <motion.div
            className="min-w-0"
            variants={reduceMotion ? undefined : fadeUp}
            initial={reduceMotion ? false : "hidden"}
            whileInView={reduceMotion ? undefined : "visible"}
            viewport={viewportOnce}
            transition={{ duration: 0.75, ease: easePremium }}
          >
            <h2
              id="hizmetlerimiz-baslik"
              className="font-display text-xl font-semibold uppercase tracking-[0.35em] text-primary sm:text-2xl md:text-[1.65rem] md:tracking-[0.38em]"
            >
              {locale === "en" ? "SERVICES" : "HİZMETLERİMİZ"}
            </h2>
          </motion.div>

          <motion.div
            variants={reduceMotion ? undefined : fadeUp}
            initial={reduceMotion ? false : "hidden"}
            whileInView={reduceMotion ? undefined : "visible"}
            viewport={viewportOnce}
            transition={{ duration: 0.65, delay: reduceMotion ? 0 : 0.06, ease: easePremium }}
          >
            <Link
              href={withLocalePath("/hizmetlerimiz", locale)}
              className={cn(
                "inline-flex min-h-11 items-center font-display text-[11px] font-medium uppercase tracking-[0.22em] text-muted",
                "transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              )}
            >
              {locale === "en" ? "View all" : "Tümünü gör"}
            </Link>
          </motion.div>
        </div>

        <div className="relative mt-14 md:mt-16 lg:mt-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-10 bg-gradient-to-r from-surface to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-10 bg-gradient-to-l from-surface to-transparent"
          />

          <div
            className="relative overflow-hidden"
            onMouseEnter={pause}
            onMouseLeave={resume}
            aria-label={locale === "en" ? "Services strip" : "Hizmetlerimiz şeridi"}
          >
            <motion.div
              className="flex w-max flex-row gap-8"
              ref={trackRef}
              style={{ x }}
              drag={reduceMotion ? false : "x"}
              dragElastic={0.06}
              dragMomentum
              onDragStart={() => {
                setIsDragging(true);
                pause();
              }}
              onDragEnd={() => {
                window.setTimeout(() => setIsDragging(false), 120);
                window.setTimeout(resume, 220);
              }}
              onPanStart={pause}
              onPanEnd={() => window.setTimeout(resume, 220)}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {loopItems.map((service, index) => (
                <motion.div
                  key={`${service.slug}-${index}`}
                  variants={itemVariants}
                  className="w-[78vw] min-[520px]:w-[58vw] md:w-[340px] lg:w-[380px] flex-shrink-0 snap-start"
                >
                  <Link
                    href={withLocalePath(`/hizmetlerimiz/${service.slug}`, locale)}
                    className={cn(
                      "group block w-full rounded-lg text-left",
                      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent",
                    )}
                    onClick={(e) => {
                      if (isDragging) e.preventDefault();
                    }}
                    draggable={false}
                    aria-label={
                      locale === "en"
                        ? `Go to ${service.title} details`
                        : `${service.title} detayına git`
                    }
                  >
                    <div
                      className={cn(
                        "tilt-card relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-border/30",
                        "shadow-[var(--shadow-card)] ring-1 ring-inset ring-primary/[0.06]",
                        "transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        "group-hover:shadow-[var(--shadow-card-hover)]",
                        "motion-reduce:transition-none",
                      )}
                    >
                      <div
                        className={cn(
                          "absolute inset-0 origin-center transition-transform duration-[750ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                          "group-hover:scale-[1.03] motion-reduce:group-hover:scale-100",
                        )}
                      >
                        <Image
                          src={service.imageUrl}
                          alt={
                            locale === "en"
                              ? `${service.title} — home services, Samet Alp Architecture`
                              : `${service.title} — ana sayfa hizmetleri, Samet Alp Mimarlık`
                          }
                          fill
                          sizes="(max-width: 768px) 78vw, (max-width: 1200px) 340px, 380px"
                          priority={index === 0}
                          className="object-cover object-center"
                          draggable={false}
                        />
                      </div>
                      <div
                        aria-hidden
                        className={cn(
                          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500",
                          "bg-gradient-to-t from-primary/55 via-primary/10 to-transparent",
                          "group-hover:opacity-100 motion-reduce:group-hover:opacity-0",
                        )}
                      />
                      <div
                        aria-hidden
                        className={cn(
                          "pointer-events-none absolute bottom-0 left-0 right-0 h-[3px] origin-left scale-x-0 bg-accent",
                          "transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                          "group-hover:scale-x-100 motion-reduce:group-hover:scale-x-0",
                        )}
                      />
                    </div>
                    <div className="mt-4 text-left">
                      <h3 className="font-display text-sm font-semibold tracking-tight text-primary transition-colors duration-300 group-hover:text-accent sm:text-[0.9375rem]">
                        {service.title}
                      </h3>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
