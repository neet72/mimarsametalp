"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { usePathname } from "next/navigation";
import { SERVICES_GALLERY as SERVICES_GALLERY_TR } from "@/content/services-gallery";
import { SERVICES_GALLERY as SERVICES_GALLERY_EN } from "@/content/services-gallery.en";
import { ServiceGalleryCard } from "./ServiceGalleryCard";
import { localeFromPathname } from "@/lib/locale";
import { easePremium, fadeUpSoft } from "@/lib/motion";

const gridContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.06,
    },
  },
};

const cardItem: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: easePremium },
  },
};

export function ServicesSection() {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const SERVICES_GALLERY = locale === "en" ? SERVICES_GALLERY_EN : SERVICES_GALLERY_TR;

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
    <section
      className="border-t border-border/60 bg-surface py-24 md:py-28"
      aria-labelledby="hizmetlerimiz-baslik"
    >
      <div className="mx-auto w-full min-w-0 max-w-[1440px] px-4 min-[400px]:px-6 md:px-16">
        <motion.div
          className="mx-auto max-w-4xl text-center"
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

        <motion.div
          className="mt-14 grid w-full min-w-0 grid-cols-1 gap-y-8 md:mt-16 md:grid-cols-2 md:gap-x-8 md:gap-y-10 lg:mt-20 lg:grid-cols-3 lg:gap-x-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-6% 0px", amount: 0.08 }}
        >
          {SERVICES_GALLERY.map((service, index) => (
            <motion.div
              key={service.title}
              variants={itemVariants}
              className="min-w-0 w-full max-w-full"
            >
              <ServiceGalleryCard service={service} index={index} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
