"use client";

import Image from "next/image";
import { AnimatePresence, motion, useAnimationFrame, useMotionValue, useReducedMotion, type Variants } from "framer-motion";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SERVICES_GALLERY as SERVICES_GALLERY_TR } from "@/content/services-gallery";
import { SERVICES_GALLERY as SERVICES_GALLERY_EN } from "@/content/services-gallery.en";
import { localeFromPathname } from "@/lib/locale";
import { easePremium, fadeUpSoft } from "@/lib/motion";
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

export function ServicesSection() {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const SERVICES_GALLERY = locale === "en" ? SERVICES_GALLERY_EN : SERVICES_GALLERY_TR;

  const containerVariants: Variants = reduceMotion
    ? { hidden: {}, visible: { transition: { staggerChildren: 0, delayChildren: 0 } } }
    : stripContainer;

  const itemVariants: Variants = reduceMotion
    ? { hidden: { opacity: 1, x: 0 }, visible: { opacity: 1, x: 0, transition: { duration: 0 } } }
    : cardItem;

  const loopItems = useMemo(() => [...SERVICES_GALLERY, ...SERVICES_GALLERY], [SERVICES_GALLERY]);
  const [paused, setPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lightbox, setLightbox] = useState<{ src: string; title: string } | null>(null);

  const pause = useCallback(() => setPaused(true), []);
  const resume = useCallback(() => setPaused(false), []);

  // Track-based autoplay + drag (stable; no snap/scrollLeft issues)
  const trackRef = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const halfWRef = useRef(0);
  const lastTRef = useRef<number | null>(null);

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    // loopItems is duplicated: half width = single-set width
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

    const SPEED = 24; // px/sec (slow, premium)
    let next = x.get() - SPEED * dt;
    if (next <= -half) next += half;
    x.set(next);
  });

  const openLightbox = useCallback((src: string, title: string) => {
    setLightbox({ src, title });
  }, []);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, closeLightbox]);

  return (
    <>
      <section
        className="border-t border-border/60 bg-surface py-24 md:py-28"
        aria-labelledby="hizmetlerimiz-baslik"
      >
        <div className="mx-auto w-full min-w-0 max-w-[1440px] px-4 min-[400px]:px-6 md:px-16">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <motion.div
              className="min-w-0"
              variants={reduceMotion ? undefined : fadeUpSoft}
              initial={reduceMotion ? false : "hidden"}
              whileInView={reduceMotion ? undefined : "visible"}
              viewport={{ once: false, margin: "-10% 0px" }}
              transition={{ duration: 0.75, ease: easePremium }}
            >
              <h2
                id="hizmetlerimiz-baslik"
                className="font-display text-xl font-semibold uppercase tracking-[0.35em] text-primary sm:text-2xl md:text-[1.65rem] md:tracking-[0.38em]"
              >
                {locale === "en" ? "SERVICES" : "HİZMETLERİMİZ"}
              </h2>
            </motion.div>

            {/* Auto-moving strip uses track autoplay; arrows omitted */}
          </div>

          <div className="relative mt-14 md:mt-16 lg:mt-20">
            {/* Edge fades (outside scroll area; stable) */}
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
                className="flex w-max flex-row gap-6"
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
                {loopItems.map((service, index) => {
                  return (
                    <motion.div
                      key={`${service.slug}-${index}`}
                      variants={itemVariants}
                      className="flex-shrink-0 w-[85vw] min-[520px]:w-[70vw] md:w-[400px] lg:w-[450px] snap-start"
                    >
                      <button
                        type="button"
                        className={cn(
                          "group block w-full min-w-0 max-w-full rounded-2xl text-left",
                          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent",
                        )}
                        onClick={() => {
                          if (isDragging) return;
                          openLightbox(service.imageUrl, service.title);
                        }}
                        aria-label={
                          locale === "en"
                            ? `Open ${service.title} image`
                            : `${service.title} görselini aç`
                        }
                      >
                        <article
                          className={cn(
                            "tilt-card relative w-full min-w-0 max-w-full overflow-hidden rounded-2xl bg-border/25",
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
                                  ? `${service.title} — home services gallery, Samet Alp Architecture`
                                  : `${service.title} — ana sayfa hizmet galerisi, Samet Alp Mimarlık`
                              }
                              fill
                              sizes="(max-width: 768px) 85vw, (max-width: 1200px) 400px, 450px"
                              priority={index === 0}
                              className={cn(
                                "object-cover object-center transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
                                "group-hover:scale-[1.12] motion-reduce:group-hover:scale-100",
                              )}
                            />
                            <div
                              aria-hidden
                              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:group-hover:opacity-0"
                            >
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.16),transparent_55%)] mix-blend-overlay" />
                            </div>
                            <div
                              aria-hidden
                              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
                            />
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-6 md:p-7">
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
                      </button>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {lightbox ? (
        <motion.div
          key="services-lightbox"
          className="fixed inset-0 z-[450] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.22, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-modal="true"
          aria-label={locale === "en" ? "Image viewer" : "Görsel görüntüleyici"}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={closeLightbox}
            aria-label={locale === "en" ? "Close" : "Kapat"}
          />
          <motion.div
            className="relative z-[1] mx-auto w-[min(1200px,92vw)]"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.98, y: 8 }}
            animate={reduceMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              onClick={closeLightbox}
              className={cn(
                "touch-manipulation absolute right-3 top-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full",
                "border border-white/15 bg-white/5 text-white/90 backdrop-blur-sm",
                "transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              )}
              aria-label={locale === "en" ? "Close" : "Kapat"}
            >
              <X className="h-5 w-5" strokeWidth={1.8} />
            </button>
            <div className="relative h-[78vh] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/20 shadow-[0_18px_70px_-22px_rgb(0_0_0/0.7)]">
              <Image
                src={lightbox.src}
                alt={
                  locale === "en"
                    ? `${lightbox.title} — enlarged service image`
                    : `${lightbox.title} — büyütülmüş hizmet görseli`
                }
                fill
                sizes="(max-width: 768px) 92vw, 1200px"
                className="object-contain object-center"
                priority={false}
              />
            </div>
            <p className="mt-4 text-center font-display text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
              {lightbox.title}
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
    </>
  );
}
