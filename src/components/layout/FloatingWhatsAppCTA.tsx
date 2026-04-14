"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { WhatsAppGlyph } from "@/components/icons/WhatsAppGlyph";
import { CONTACT_SOCIAL_WHATSAPP } from "@/content/contact-page";

export function FloatingWhatsAppCTA() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  // Never show on admin routes
  if (pathname.startsWith("/admin")) return null;

  return (
    <motion.div
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom,0px)+1rem)] right-[max(1rem,env(safe-area-inset-right,0px)+1rem)] z-[300]"
      initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={reduceMotion ? undefined : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={CONTACT_SOCIAL_WHATSAPP}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-3 rounded-full border border-white/10 bg-primary px-4 py-3 text-sm font-semibold text-surface shadow-[0_14px_50px_-18px_rgb(15_23_42/0.6)] backdrop-blur-sm transition-[transform,box-shadow,background-color] hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_18px_70px_-22px_rgb(15_23_42/0.65)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        aria-label="WhatsApp ile iletişime geç"
      >
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
          <WhatsAppGlyph className="h-[1.3rem] w-[1.3rem] text-surface/90" strokeWidth={2} />
        </span>
        <span>WhatsApp</span>
      </Link>
    </motion.div>
  );
}

