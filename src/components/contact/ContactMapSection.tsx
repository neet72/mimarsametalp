"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { localeFromPathname } from "@/lib/locale";

/** Embed, API anahtarı gerektirmez */
const OFFICE_ADDRESS = "Güzelevler, 2067/2 SK A blok no:32/3, 01220 Yüreğir/Adana";
const OFFICE_PLACE_NAME_TR = "MİMAR SAMET ALP";
const OFFICE_PLACE_NAME_EN = "Samet Alp Architecture";

function mapEmbedUrl(query: string, lang: "tr" | "en") {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&hl=${lang}&z=16&output=embed`;
}

function mapOpenUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function ContactMapSection() {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const isEn = locale === "en";
  const query = `${isEn ? OFFICE_PLACE_NAME_EN : OFFICE_PLACE_NAME_TR}, ${OFFICE_ADDRESS}`;
  const embedUrl = mapEmbedUrl(query, isEn ? "en" : "tr");
  const openUrl = mapOpenUrl(query);

  useEffect(() => {
    // Dev / fast-refresh edge case: if this overlay link ends up duplicated, keep only the first.
    const nodes = Array.from(document.querySelectorAll('[data-map-open="true"]'));
    if (nodes.length <= 1) return;
    nodes.slice(1).forEach((n) => n.remove());
  }, []);

  return (
    <motion.section
      className="relative mt-20 w-screen max-w-none border-t border-border/60 bg-border/20 md:mt-28 left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]"
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      aria-label={isEn ? "Office location map" : "Ofis konumu haritası"}
    >
      <div
        className="relative h-[min(52vh,440px)] w-full min-h-[280px] overflow-hidden grayscale contrast-[1.15] brightness-[0.94] transition-[filter] duration-700 ease-out hover:grayscale-[0.35] hover:brightness-[0.98] motion-reduce:grayscale-0 motion-reduce:contrast-100 motion-reduce:brightness-100"
      >
        <a
          href={openUrl}
          target="_blank"
          rel="noreferrer noopener"
          data-map-open="true"
          className="absolute left-3 top-3 z-10 rounded-full border border-white/15 bg-black/35 px-4 py-2 text-xs font-semibold text-white/90 backdrop-blur-sm transition-colors hover:bg-black/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {isEn ? "Open in Maps" : "Haritalarda aç"}
        </a>
        <iframe
          title={isEn ? "Office map" : "Ofis haritası"}
          src={embedUrl}
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
