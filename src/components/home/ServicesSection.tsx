"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { SERVICES_GALLERY } from "@/content/services-gallery";
import { ServiceGalleryCard } from "./ServiceGalleryCard";

const ease = [0.22, 1, 0.36, 1] as const;

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
    transition: { duration: 0.72, ease },
  },
};

export function ServicesSection() {
  const reduceMotion = useReducedMotion();

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
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-16">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.75, ease }}
        >
          <h2
            id="hizmetlerimiz-baslik"
            className="font-display text-xl font-semibold uppercase tracking-[0.35em] text-primary sm:text-2xl md:text-[1.65rem] md:tracking-[0.38em]"
          >
            HİZMETLERİMİZ
          </h2>
        </motion.div>

        <motion.div
          className="mt-14 grid grid-cols-1 gap-8 md:mt-16 md:grid-cols-2 md:gap-10 lg:mt-20 lg:grid-cols-3 lg:gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-6% 0px", amount: 0.08 }}
        >
          {SERVICES_GALLERY.map((service, index) => (
            <motion.div key={service.title} variants={itemVariants}>
              <ServiceGalleryCard service={service} index={index} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
