"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/cn";

const HERO_IMAGES = [
  "/images/hero-1.webp",
  "/images/hero-2.webp",
  "/images/hero-3.webp",
  "/images/hero-4.webp",
  "/images/hero-5.webp",
  "/images/hero-6.webp",
  "/images/hero-7.webp",
  "/images/hero-8.webp",
  "/images/hero-9.webp",
] as const;

const ease = [0.22, 1, 0.36, 1] as const;

export function HeroSlider() {
  const reduceMotion = useReducedMotion();
  const [slide, setSlide] = useState(0);
  const total = HERO_IMAGES.length;

  const next = useCallback(() => {
    setSlide((i) => (i + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setSlide((i) => (i - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(next, 7200);
    return () => window.clearInterval(id);
  }, [next, reduceMotion]);

  return (
    <section className="w-full bg-surface" aria-label="Karşılama görseli">
      <div className="mx-auto w-full max-w-[1440px] px-4 pt-4 sm:px-6 sm:pt-6 md:px-8 lg:px-10 lg:pt-8">
        <div
          className={cn(
            "relative w-full overflow-hidden rounded-2xl border border-border/50 bg-border/20 shadow-card sm:rounded-3xl",
            "h-[70vh] min-h-[300px] max-h-[920px] sm:h-[75vh] sm:min-h-[340px] lg:h-[78vh]",
          )}
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={slide}
              className="absolute inset-0"
              initial={{ opacity: reduceMotion ? 1 : 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: reduceMotion ? 1 : 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.55, ease }}
            >
              <Image
                src={HERO_IMAGES[slide]}
                alt={`Seçili proje görseli ${slide + 1}`}
                fill
                priority={slide === 0}
                sizes="(max-width: 1440px) 100vw, 1440px"
                className="object-cover object-center"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent"
                aria-hidden
              />
            </motion.div>
          </AnimatePresence>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center gap-1.5 pb-4 sm:pb-5">
            {HERO_IMAGES.map((_, i) => (
              <span
                key={HERO_IMAGES[i]}
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  i === slide ? "w-7 bg-surface" : "w-1.5 bg-surface/45",
                )}
                aria-hidden
              />
            ))}
          </div>

          <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-2 sm:pl-4">
            <button
              type="button"
              onClick={prev}
              className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/80 text-primary shadow-sm backdrop-blur-md transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              aria-label="Önceki görsel"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.6} />
            </button>
          </div>
          <div className="absolute inset-y-0 right-0 z-10 flex items-center pr-2 sm:pr-4">
            <button
              type="button"
              onClick={next}
              className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/80 text-primary shadow-sm backdrop-blur-md transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              aria-label="Sonraki görsel"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
