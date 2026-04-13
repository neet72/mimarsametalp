"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { InstagramGlyph } from "@/components/icons/InstagramGlyph";
import { usePathname } from "next/navigation";
import { SOCIAL_GALLERY_IMAGES as SOCIAL_GALLERY_IMAGES_TR } from "@/content/home-copy";
import { SOCIAL_GALLERY_IMAGES as SOCIAL_GALLERY_IMAGES_EN } from "@/content/home-copy.en";
import { cn } from "@/lib/cn";
import { pageContainerClass } from "@/lib/page-layout";
import { localeFromPathname } from "@/lib/locale";
import { easePremium, fadeUp, stagger } from "@/lib/motion";

const instagramHref =
  process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://www.instagram.com/";

const container = stagger({ stagger: 0.07, delay: 0.06 });
const tile = fadeUp;

export function SocialGallery() {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const SOCIAL_GALLERY_IMAGES =
    locale === "en" ? SOCIAL_GALLERY_IMAGES_EN : SOCIAL_GALLERY_IMAGES_TR;
  const variants = reduceMotion
    ? { hidden: {}, visible: { transition: { staggerChildren: 0, delayChildren: 0 } } }
    : container;
  const tileVariants = reduceMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0, transition: { duration: 0 } } }
    : tile;

  return (
    <section
      className="border-t border-border/60 bg-surface py-24 sm:py-28 lg:py-32"
      aria-labelledby="sosyal-baslik"
    >
      <div className={pageContainerClass}>
        <motion.div
          className="mx-auto max-w-3xl text-center"
          variants={reduceMotion ? undefined : stagger({ stagger: 0.08, delay: 0.02 })}
          initial={reduceMotion ? false : "hidden"}
          whileInView={reduceMotion ? undefined : "visible"}
          viewport={{ once: true, margin: "-12% 0px" }}
          transition={reduceMotion ? undefined : { duration: 0.65, ease: easePremium }}
        >
          <motion.h2
            id="sosyal-baslik"
            className="font-display text-2xl font-semibold tracking-tight text-primary sm:text-3xl"
            variants={reduceMotion ? undefined : fadeUp}
          >
            {locale === "en" ? "Follow us on social" : "Bizi Sosyal Medyada Takip Edin"}
          </motion.h2>
        </motion.div>

        <motion.div
          className="mt-12 overflow-hidden rounded-2xl border border-border/50 bg-border/35 shadow-card sm:mt-14 lg:mt-16"
          variants={variants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-8% 0px" }}
          transition={reduceMotion ? undefined : { duration: 0.6, ease: easePremium }}
        >
          <div className="grid grid-cols-2 gap-px bg-border/45 md:grid-cols-4">
            {SOCIAL_GALLERY_IMAGES.map((src, index) => (
              <motion.div
                key={`${src}-${index}`}
                variants={tileVariants}
                className="group relative aspect-square overflow-hidden bg-surface md:rounded-none"
              >
                <Image
                  src={src}
                  alt={
                    locale === "en"
                      ? `Social media image ${index + 1}`
                      : `Sosyal medya görseli ${index + 1}`
                  }
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05] motion-reduce:group-hover:scale-100"
                />
                <div
                  className="absolute inset-0 flex items-center justify-center bg-primary/0 opacity-0 transition duration-300 group-hover:bg-primary/35 group-hover:opacity-100 motion-reduce:group-hover:bg-transparent motion-reduce:group-hover:opacity-0"
                  aria-hidden
                >
                  <InstagramGlyph className="h-9 w-9 text-surface drop-shadow-md sm:h-10 sm:w-10" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="mt-12 flex justify-center sm:mt-14"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.08, ease: easePremium }}
        >
          <Link
            href={instagramHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "group inline-flex items-center gap-3 rounded-full border border-primary/15 bg-primary px-9 py-3.5 font-display text-[11px] font-medium uppercase tracking-[0.28em] text-surface",
              "shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-primary hover:bg-primary/90 hover:shadow-card-hover",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
            )}
          >
            <InstagramGlyph className="h-5 w-5 shrink-0 text-surface/90 transition group-hover:scale-105" />
            <span>Instagram</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
