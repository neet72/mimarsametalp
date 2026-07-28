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
import { easePremium, fadeUp, viewportOnce } from "@/lib/motion";

const ABOUT_IMAGE = "/images/hero-4.webp";

export function AboutSection() {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const ABOUT_SECTION_BODY = locale === "en" ? ABOUT_SECTION_BODY_EN : ABOUT_SECTION_BODY_TR;
  const xImage = reduceMotion ? 0 : -40;
  const xText = reduceMotion ? 0 : 40;

  return (
    <section
      className="border-t border-border/60 bg-surface py-24 sm:py-28 lg:py-32"
      aria-labelledby="firma-hakkinda-baslik"
    >
      <div className={pageContainerClass}>
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16 xl:gap-20 2xl:gap-24">
          <motion.div
            className="relative lg:col-span-5"
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    x: xImage,
                    y: 10,
                    scale: 0.985,
                  }
            }
            whileInView={
              reduceMotion
                ? undefined
                : {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    scale: 1,
                  }
            }
            viewport={viewportOnce}
            transition={{ duration: 0.75, ease: easePremium }}
          >
            <div
              className={cn(
                "group relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-2xl border border-border/60 bg-border/20 shadow-card",
                "shadow-[0_18px_60px_-30px_rgb(15_23_42/0.55)] lg:mx-0 lg:max-w-none",
                "lg:min-h-[min(72vh,640px)] lg:aspect-auto",
              )}
            >
              <div className="absolute inset-0 origin-center">
                <Image
                  src={ABOUT_IMAGE}
                  alt="Samet Alp Mimarlık mimari proje görseli"
                  fill
                  className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  priority={false}
                />
              </div>

              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.16),transparent_48%),linear-gradient(to_top,rgba(0,0,0,0.22),transparent_55%)] opacity-80 transition-opacity duration-700 group-hover:opacity-100"
              />
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col justify-center lg:col-span-7"
            initial={reduceMotion ? false : { opacity: 0, x: xText }}
            whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.72, delay: reduceMotion ? 0 : 0.06, ease: easePremium }}
          >
            <h2
              id="firma-hakkinda-baslik"
              className="font-display text-3xl font-semibold tracking-tight text-primary sm:text-4xl"
            >
              {locale === "en" ? "About the Studio" : "Firmamız Hakkında"}
            </h2>
            <motion.p
              className="mt-6 max-w-3xl text-pretty text-base leading-[1.85] text-muted sm:text-lg"
              variants={reduceMotion ? undefined : fadeUp}
              initial={reduceMotion ? false : "hidden"}
              whileInView={reduceMotion ? undefined : "visible"}
              viewport={viewportOnce}
            >
              {ABOUT_SECTION_BODY}
            </motion.p>
            <div className="mt-10">
              <Link
                href={withLocalePath("/hakkimizda", locale)}
                aria-label={locale === "en" ? "Go to the About page" : "Hakkımızda sayfasına git"}
                className="inline-flex items-center justify-center rounded-full bg-solid px-10 py-3 font-display text-[11px] font-medium uppercase tracking-[0.28em] text-surface shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-solid/90 hover:shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
