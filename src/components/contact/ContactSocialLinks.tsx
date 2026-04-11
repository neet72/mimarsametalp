"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  CONTACT_SOCIAL_INSTAGRAM,
  CONTACT_SOCIAL_LINKEDIN,
  CONTACT_SOCIAL_WHATSAPP,
} from "@/content/contact-page";
import { InstagramGlyph } from "@/components/icons/InstagramGlyph";
import { LinkedinGlyph } from "@/components/icons/LinkedinGlyph";
import { WhatsAppGlyph } from "@/components/icons/WhatsAppGlyph";
import { cn } from "@/lib/cn";

const ease = [0.22, 1, 0.36, 1] as const;
const spring = { type: "spring" as const, stiffness: 420, damping: 26 };

const list: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.06 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease },
  },
};

const social = [
  {
    href: CONTACT_SOCIAL_INSTAGRAM,
    label: "Instagram",
    Icon: InstagramGlyph,
  },
  {
    href: CONTACT_SOCIAL_WHATSAPP,
    label: "WhatsApp",
    Icon: WhatsAppGlyph,
  },
  {
    href: CONTACT_SOCIAL_LINKEDIN,
    label: "LinkedIn",
    Icon: LinkedinGlyph,
  },
] as const;

export function ContactSocialLinks() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="mt-8 border-t border-border/50 pt-8"
      initial={reduceMotion ? false : { opacity: 0 }}
      whileInView={reduceMotion ? undefined : { opacity: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, ease }}
    >
      <p className="font-display text-[10px] font-semibold uppercase tracking-[0.28em] text-primary/40">
        Sosyal medya
      </p>
      <motion.ul
        className="mt-4 flex flex-wrap gap-3"
        variants={list}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        aria-label="Sosyal medya bağlantıları"
      >
        {social.map(({ href, label, Icon }) => (
          <motion.li key={label} variants={item} className="relative">
            <motion.a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full",
                "border border-border/80 bg-surface/60 text-primary/65 shadow-sm backdrop-blur-sm",
                "transition-colors duration-300 hover:border-primary/25 hover:text-primary",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              )}
              whileHover={
                reduceMotion
                  ? undefined
                  : { y: -3, scale: 1.06, transition: spring }
              }
              whileTap={reduceMotion ? undefined : { scale: 0.94 }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/[0.07] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
              <Icon className="relative z-[1] h-[1.15rem] w-[1.15rem]" />
              <span className="sr-only">{label}</span>
            </motion.a>
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
}
