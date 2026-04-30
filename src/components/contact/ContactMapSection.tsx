"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Embed, API anahtarı gerektirmez */
const OFFICE_ADDRESS = "Güzelevler, 2067/2 SK A blok no:32/3, 01220 Yüreğir/Adana";
const OFFICE_MAP_EMBED = `https://maps.google.com/maps?q=${encodeURIComponent(
  OFFICE_ADDRESS,
)}&hl=tr&z=16&output=embed`;

export function ContactMapSection() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className="relative mt-20 w-screen max-w-none border-t border-border/60 bg-border/20 md:mt-28 left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]"
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Ofis konumu haritası"
    >
      <div
        className="relative h-[min(52vh,440px)] w-full min-h-[280px] overflow-hidden grayscale contrast-[1.15] brightness-[0.94] transition-[filter] duration-700 ease-out hover:grayscale-[0.35] hover:brightness-[0.98] motion-reduce:grayscale-0 motion-reduce:contrast-100 motion-reduce:brightness-100"
      >
        <iframe
          title="Ofis haritası"
          src={OFFICE_MAP_EMBED}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface/25 via-transparent to-surface/10"
        />
      </div>
    </motion.section>
  );
}
