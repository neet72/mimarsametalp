"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect } from "react";
import { cn } from "@/lib/cn";
import type { ServiceListingItem } from "@/lib/service-listing-item";
import { withLocalePath } from "@/lib/locale";

const ease = [0.22, 1, 0.36, 1] as const;
const spring = { type: "spring" as const, stiffness: 380, damping: 28 };

const cardReveal: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease },
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
  const reduceMotion = useReducedMotion();

  const onMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${((0.5 - py) * 5).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${((px - 0.5) * 6).toFixed(2)}deg`);
    el.style.setProperty("--glow-x", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--glow-y", `${(py * 100).toFixed(1)}%`);
  }, []);

  const onLeave = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--glow-x", "50%");
    el.style.setProperty("--glow-y", "30%");
  }, []);

  return (
    <motion.article
      className="group relative w-full"
      initial={false}
      whileHover={reduceMotion ? undefined : { y: -6, transition: spring }}
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      transition={spring}
    >
      <Link
        href={withLocalePath(`/hizmetlerimiz/${service.slug}`, locale)}
        className="block w-full rounded-lg text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
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
          onMouseMove={reduceMotion ? undefined : onMove}
          onMouseLeave={reduceMotion ? undefined : onLeave}
        >
          <div
            className={cn(
              "absolute inset-0 origin-center transition-transform duration-[750ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
              "group-hover:scale-[1.03] motion-reduce:group-hover:scale-100",
            )}
          >
            <Image
              src={service.imageUrl}
              alt={
                locale === "en"
                  ? `${service.title} — service overview, Samet Alp Architecture`
                  : `${service.title} — hizmet görünümü, Samet Alp Mimarlık`
              }
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={index === 0}
              className={cn(
                "object-cover object-center transition-[filter] duration-700 ease-out",
                "group-hover:brightness-[1.03] motion-reduce:group-hover:brightness-100",
              )}
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
          <h2 className="font-display text-sm font-semibold tracking-tight text-primary transition-colors duration-300 group-hover:text-accent sm:text-[0.9375rem]">
            {service.title}
          </h2>
        </div>
      </Link>
    </motion.article>
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
  const hasItems = items.length > 0;
  const title = locale === "en" ? "Services" : "Hizmetlerimiz";
  const kicker = locale === "en" ? "Expertise" : "Uzmanlık";
  const description =
    locale === "en"
      ? "From concept and permits to delivery and consulting — a clear scope at every scale."
      : "Konseptten ruhsata, uygulamadan danışmanlığa — her ölçekte net ve ölçülü bir kapsam.";

  useEffect(() => {
    if (reduceMotion) return;
    if (typeof window !== "undefined") {
      const isCoarse = window.matchMedia?.("(pointer: coarse)")?.matches === true;
      if (isCoarse) return;
    }

    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 0.92,
      touchMultiplier: 1.85,
    });

    let rafId = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [reduceMotion]);

  return (
    <div className="relative w-full overflow-hidden bg-surface">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-8%,rgb(var(--color-accent-rgb)/0.08),transparent_52%),linear-gradient(to_bottom,rgb(var(--color-primary-rgb)/0.03),transparent_28%)]"
      />

      <div className="relative mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <header className="border-b border-border/70 pb-10 pt-12 sm:pb-12 sm:pt-16 md:pt-20">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
            <div className="max-w-2xl">
              <p className="font-display text-[10px] font-semibold uppercase tracking-[0.34em] text-accent sm:text-[11px]">
                {kicker}
              </p>
              <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-primary sm:text-5xl md:text-6xl">
                {title}
              </h1>
              <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
                {description}
              </p>
            </div>
            {hasItems ? (
              <p className="shrink-0 font-display text-[11px] font-medium uppercase tracking-[0.28em] text-muted tabular-nums">
                {locale === "en" ? `${items.length} services` : `${items.length} hizmet`}
              </p>
            ) : null}
          </div>
        </header>

        {hasItems ? (
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 py-12 sm:grid-cols-2 sm:gap-y-14 sm:py-14 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-16 lg:py-16">
            {items.map((service, index) => (
              <motion.div
                key={service.slug}
                variants={reduceMotion ? undefined : cardReveal}
                initial={reduceMotion ? false : "hidden"}
                whileInView={reduceMotion ? undefined : "show"}
                viewport={{ once: true, margin: "0px 0px -8% 0px", amount: 0.2 }}
                transition={{
                  delay: reduceMotion ? 0 : Math.min(index * 0.06, 0.42),
                }}
              >
                <HizmetCard service={service} index={index} locale={locale} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-start gap-6 border-b border-border/70 py-14 sm:py-16">
            <div aria-hidden className="h-px w-16 bg-accent/70" />
            <p className="max-w-md text-pretty text-base leading-relaxed text-muted sm:text-lg">
              {locale === "en"
                ? "Services are being prepared for this page. Explore projects or get in touch in the meantime."
                : "Hizmetler bu sayfa için hazırlanıyor. Bu sırada projelerimizi inceleyebilir veya bizimle iletişime geçebilirsiniz."}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={withLocalePath("/projeler", locale)}
                className={cn(
                  "inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-panel px-6 py-2.5",
                  "font-display text-[11px] font-medium uppercase tracking-[0.22em] text-primary",
                  "transition hover:border-primary/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                )}
              >
                {locale === "en" ? "Projects" : "Projeler"}
              </Link>
              <Link
                href={withLocalePath("/iletisim", locale)}
                className={cn(
                  "inline-flex min-h-11 items-center justify-center rounded-full bg-solid px-6 py-2.5",
                  "font-display text-[11px] font-medium uppercase tracking-[0.22em] text-on-solid",
                  "transition hover:bg-solid/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                )}
              >
                {locale === "en" ? "Contact" : "İletişim"}
              </Link>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-5 border-t border-border/60 py-12 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:py-14 md:py-16">
          <p className="max-w-lg text-pretty text-sm leading-relaxed text-muted sm:text-base">
            {locale === "en"
              ? "Tell us your goals and constraints — we will propose the right scope."
              : "Hedeflerinizi ve kısıtlarınızı paylaşın — doğru kapsamı birlikte netleştirelim."}
          </p>
          <Link
            href={withLocalePath("/iletisim", locale)}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-solid px-7 py-2.5",
              "font-display text-[11px] font-medium uppercase tracking-[0.22em] text-on-solid",
              "transition hover:bg-solid/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
            )}
          >
            {locale === "en" ? "Start a conversation" : "Görüşme başlat"}
          </Link>
        </div>
      </div>
    </div>
  );
}
