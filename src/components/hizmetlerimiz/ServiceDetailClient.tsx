"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, ChevronDown, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { usePathname } from "next/navigation";
import { localeFromPathname, withLocalePath } from "@/lib/locale";
import { shouldUnoptimizeImage } from "@/lib/media/next-image";
import {
  easePremium,
  fadeUpShow,
  headerItem,
  headerReveal,
  sectionStagger,
  viewportOnce,
} from "@/lib/motion";

export type ServiceDetailData = {
  slug: string;
  name: string;
  heroImageUrl: string;
  shortDescription: string;
  hizmetKapsami: string[];
  hizmetSureci: Array<{ title: string; description: string }>;
  sss: Array<{ question: string; answer: string }>;
};

type Props = {
  service: ServiceDetailData;
  relatedServices?: Array<{ title: string; href: string }>;
};

export function ServiceDetailClient({ service, relatedServices }: Props) {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const sectionInitial = reduceMotion ? false : "hidden";
  const sectionWhileInView = reduceMotion ? undefined : "show";

  const faqIcon = useMemo(() => (service.sss.length > 6 ? Plus : ChevronDown), [service.sss.length]);
  const FaqIcon = faqIcon;

  return (
    <div className="w-full bg-surface">
      {/* HERO */}
      <section className="relative h-[50vh] w-full overflow-hidden bg-border/30">
        <Image
          src={service.heroImageUrl}
          alt={
            locale === "en"
              ? `${service.name} — service hero image, Samet Alp Architecture`
              : `${service.name} — hizmet kapak görseli, Samet Alp Mimarlık`
          }
          fill
          priority
          sizes="100vw"
          unoptimized={shouldUnoptimizeImage(service.heroImageUrl)}
          className="object-cover object-center"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/35 to-black/10" />
        <div className="relative z-10 flex h-full w-full items-center justify-center px-6 text-center">
          <motion.div
            className="mx-auto max-w-4xl"
            variants={reduceMotion ? undefined : headerReveal}
            initial={reduceMotion ? false : "hidden"}
            animate={reduceMotion ? undefined : "show"}
          >
            <motion.p
              variants={reduceMotion ? undefined : headerItem}
              className="font-display text-[11px] font-semibold uppercase tracking-[0.32em] text-white/70 sm:text-xs"
            >
              {locale === "en" ? "SERVICE DETAIL" : "HİZMET DETAYI"}
            </motion.p>
            <motion.h1
              variants={reduceMotion ? undefined : headerItem}
              className="mt-4 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl"
            >
              {service.name}
            </motion.h1>
            <motion.p
              variants={reduceMotion ? undefined : headerItem}
              className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-white/75 sm:text-lg"
            >
              {service.shortDescription}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* DESCRIPTION + SCOPE */}
      <motion.section
        className="mx-auto w-full max-w-[1200px] px-4 py-14 sm:px-6 sm:py-16 md:px-8 md:py-20"
        variants={sectionStagger}
        initial={sectionInitial}
        whileInView={sectionWhileInView}
        viewport={viewportOnce}
      >
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <motion.div variants={fadeUpShow}>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-primary">
              {service.name}
            </h2>
            <p className="mt-6 text-pretty text-base leading-relaxed text-muted sm:text-lg">
              {service.shortDescription}
            </p>
            <p className="mt-4 text-pretty text-base leading-relaxed text-muted sm:text-lg">
              {locale === "en"
                ? "We structure a transparent, measurable process that clarifies design decisions, keeps budget and timeline under control, and protects quality during execution."
                : "Tasarım kararlarını netleştiren; bütçeyi ve zaman çizelgesini kontrol altında tutan; uygulamada kaliteyi koruyan, şeffaf ve ölçülebilir bir süreç kurguluyoruz."}
            </p>
          </motion.div>

          <motion.div variants={fadeUpShow} className="rounded-2xl border border-border bg-surface p-8 shadow-[var(--shadow-card)]">
            <h3 className="font-display text-base font-semibold uppercase tracking-[0.26em] text-muted">
              {locale === "en" ? "SCOPE" : "HİZMET KAPSAMI"}
            </h3>
            <ul className="mt-6 space-y-4">
              {service.hizmetKapsami.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.8} />
                  <span className="text-sm leading-relaxed text-muted sm:text-base">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </motion.section>

      {/* PROCESS / TIMELINE */}
      <motion.section
        className="mx-auto w-full max-w-[1200px] px-4 pb-14 sm:px-6 sm:pb-16 md:px-8 md:pb-20"
        variants={sectionStagger}
        initial={sectionInitial}
        whileInView={sectionWhileInView}
        viewport={viewportOnce}
      >
        <motion.div variants={fadeUpShow} className="flex items-end justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
              {locale === "en" ? "Process" : "Hizmet Süreci"}
            </h2>
            <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
              {locale === "en"
                ? "We define goals, deliverables, and approval checkpoints at each step—minimizing surprises and maximizing quality."
                : "Her adımda hedefi, çıktıyı ve onay noktalarını netleştirerek sürprizleri azaltır, kaliteyi yükseltiriz."}
            </p>
          </div>
        </motion.div>

        <motion.ol
          variants={sectionStagger}
          className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          {service.hizmetSureci.map((step, i) => (
            <motion.li
              key={step.title}
              variants={fadeUpShow}
              className="relative rounded-2xl border border-border bg-panel p-7 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-solid text-on-solid">
                  <span className="font-display text-sm font-semibold tracking-wide">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-semibold tracking-tight text-primary">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-muted sm:text-base">
                    {step.description}
                  </p>
                </div>
              </div>
              <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-accent/70 via-accent/20 to-transparent opacity-70" />
            </motion.li>
          ))}
        </motion.ol>
      </motion.section>

      {/* FAQ */}
      <motion.section
        className="mx-auto w-full max-w-[1200px] px-4 pb-14 sm:px-6 sm:pb-16 md:px-8 md:pb-20"
        variants={sectionStagger}
        initial={sectionInitial}
        whileInView={sectionWhileInView}
        viewport={viewportOnce}
      >
        <motion.div variants={fadeUpShow}>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
            {locale === "en" ? "FAQ" : "Sık Sorulan Sorular"}
          </h2>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
            {locale === "en"
              ? "We have gathered the most common questions about the process, deliverables, and communication flow."
              : "Süreç, teslim kapsamı ve iletişim akışı hakkında en sık gelen soruları bir araya getirdik."}
          </p>
        </motion.div>

        <motion.div variants={fadeUpShow} className="mt-10 divide-y divide-border rounded-2xl border border-border bg-panel shadow-[var(--shadow-card)]">
          {service.sss.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.question} className="px-6 py-5 sm:px-8">
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between gap-4 text-left",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent rounded-lg",
                  )}
                  onClick={() => setOpenIndex((v) => (v === index ? null : index))}
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-base font-semibold tracking-tight text-primary sm:text-lg">
                    {item.question}
                  </span>
                  <motion.span
                    aria-hidden
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted"
                    initial={false}
                    animate={reduceMotion ? undefined : { rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: reduceMotion ? 0.01 : 0.25, ease: easePremium }}
                  >
                    <FaqIcon className="h-4 w-4" strokeWidth={2} />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      key="content"
                      initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                      animate={reduceMotion ? undefined : { height: "auto", opacity: 1 }}
                      exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: reduceMotion ? 0.01 : 0.28, ease: easePremium }}
                      className="overflow-hidden"
                    >
                      <p className="mt-4 text-pretty text-sm leading-relaxed text-muted sm:text-base">
                        {item.answer}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </motion.section>

      {/* CTA */}
      <motion.section
        className="mx-auto w-full max-w-[1200px] px-4 pb-16 sm:px-6 sm:pb-20 md:px-8 md:pb-24"
        variants={sectionStagger}
        initial={sectionInitial}
        whileInView={sectionWhileInView}
        viewport={viewportOnce}
      >
        <motion.div
          variants={fadeUpShow}
          className="flex flex-col gap-5 border-t border-border/60 pt-12 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:pt-14 md:pt-16"
        >
          <div className="min-w-0">
            <p className="max-w-lg text-pretty text-sm leading-relaxed text-muted sm:text-base">
              {locale === "en"
                ? "With a short call, we will clarify scope and propose the best roadmap for you."
                : "Kısa bir görüşmeyle kapsamı netleştirip size en uygun yol haritasını çıkaralım."}
            </p>
          </div>
          <div className="flex w-full flex-wrap gap-3 sm:w-auto sm:justify-end">
            <Link
              href={withLocalePath("/iletisim", locale)}
              title={locale === "en" ? "Go to contact page" : "İletişim sayfasına git"}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-solid px-7 py-2.5",
                "font-display text-[11px] font-medium uppercase tracking-[0.22em] text-on-solid",
                "transition hover:bg-solid/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              )}
            >
              {locale === "en" ? "Start a conversation" : "Görüşme başlat"}
            </Link>
            <Link
              href={withLocalePath("/projeler", locale)}
              title={locale === "en" ? "View projects" : "Projeleri görüntüle"}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-border bg-panel px-7 py-2.5",
                "font-display text-[11px] font-medium uppercase tracking-[0.22em] text-primary",
                "transition hover:border-primary/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              )}
            >
              {locale === "en" ? "View Projects" : "Projeleri Gör"}
            </Link>
          </div>
        </motion.div>

        {relatedServices && relatedServices.length > 0 ? (
          <motion.div variants={fadeUpShow} className="mt-10 rounded-2xl border border-border bg-panel p-8 shadow-[var(--shadow-card)]">
            <h3 className="font-display text-base font-semibold uppercase tracking-[0.26em] text-muted">
              {locale === "en" ? "Related services" : "İlgili hizmetler"}
            </h3>
            <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-muted sm:text-base">
              {locale === "en"
                ? "Explore other services that often complement this workflow."
                : "Bu hizmetle birlikte en sık tercih edilen diğer hizmetleri de inceleyin."}
            </p>
            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {relatedServices.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="inline-flex w-full items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-primary/85 transition-colors hover:border-primary/25 hover:bg-primary/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  >
                    {s.title}
                    <span aria-hidden className="text-primary/40">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </motion.section>
    </div>
  );
}

