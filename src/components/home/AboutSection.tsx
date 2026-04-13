"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ABOUT_SECTION_BODY as ABOUT_SECTION_BODY_TR } from "@/content/home-copy";
import { ABOUT_SECTION_BODY as ABOUT_SECTION_BODY_EN } from "@/content/home-copy.en";
import { cn } from "@/lib/cn";
import { pageContainerClass } from "@/lib/page-layout";
import { localeFromPathname, withLocalePath } from "@/lib/locale";

const ease = [0.22, 1, 0.36, 1] as const;

const ABOUT_IMAGE = "/images/hero-4.webp";

export function AboutSection() {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const ABOUT_SECTION_BODY = locale === "en" ? ABOUT_SECTION_BODY_EN : ABOUT_SECTION_BODY_TR;
  const xImage = reduceMotion ? 0 : -56;
  const xText = reduceMotion ? 0 : 56;

  return (
    <section
      className="border-t border-border/60 bg-surface py-24 sm:py-28 lg:py-32"
      aria-labelledby="firma-hakkinda-baslik"
    >
      <div className={pageContainerClass}>
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16 xl:gap-20 2xl:gap-24">
          <motion.div
            className="relative lg:col-span-5"
            initial={reduceMotion ? false : { opacity: 0, x: xImage }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.78, ease }}
          >
            <div
              className={cn(
                "group relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-2xl border border-border/60 bg-border/20 shadow-card",
                "shadow-[0_18px_60px_-30px_rgb(15_23_42/0.55)] lg:mx-0 lg:max-w-none",
                "lg:min-h-[min(72vh,640px)] lg:aspect-auto",
              )}
            >
              <motion.div
                className="absolute inset-0 origin-center will-change-transform [transform:translateZ(0)]"
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        scale: [1.03, 1.06, 1.03],
                        x: [0, -12, 0],
                        y: [0, 10, 0],
                      }
                }
                transition={
                  reduceMotion
                    ? undefined
                    : {
                        duration: 16,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "mirror",
                      }
                }
              >
                <Image
                  src={ABOUT_IMAGE}
                  alt="Samet Alp Mimarlık mimari proje görseli"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  priority={false}
                />
              </motion.div>

              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.16),transparent_48%),linear-gradient(to_top,rgba(0,0,0,0.22),transparent_55%)] opacity-80 transition-opacity duration-700 group-hover:opacity-100"
              />

              <motion.div
                aria-hidden
                className="pointer-events-none absolute -inset-y-8 -left-1/2 w-[55%] rotate-[18deg] bg-gradient-to-r from-transparent via-white/18 to-transparent opacity-0 mix-blend-overlay"
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        x: ["-60%", "170%"],
                        opacity: [0, 0.8, 0],
                      }
                }
                transition={
                  reduceMotion
                    ? undefined
                    : {
                        duration: 6.5,
                        ease: ease,
                        repeat: Infinity,
                        repeatDelay: 2.2,
                      }
                }
              />
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col justify-center lg:col-span-7"
            initial={reduceMotion ? false : { opacity: 0, x: xText }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.78, delay: reduceMotion ? 0 : 0.06, ease }}
          >
            <h2
              id="firma-hakkinda-baslik"
              className="font-display text-3xl font-semibold tracking-tight text-primary sm:text-4xl"
            >
              {locale === "en" ? "About the Studio" : "Firmamız Hakkında"}
            </h2>
            <p className="mt-6 max-w-3xl text-pretty text-base leading-[1.85] text-muted sm:text-lg">
              {ABOUT_SECTION_BODY}
            </p>
            <div className="mt-10">
              <Link
                href={withLocalePath("/hakkimizda", locale)}
                aria-label={locale === "en" ? "Go to the About page" : "Hakkımızda sayfasına git"}
                className="inline-flex items-center justify-center rounded-full bg-primary px-10 py-3 font-display text-[11px] font-medium uppercase tracking-[0.28em] text-surface shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {locale === "en" ? "ABOUT" : "HAKKIMIZDA"}
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
