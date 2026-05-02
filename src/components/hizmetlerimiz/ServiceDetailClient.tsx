"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { CheckCircle2, ChevronDown, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { usePathname } from "next/navigation";
import { localeFromPathname, withLocalePath } from "@/lib/locale";

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
};

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.06 } },
};

export function ServiceDetailClient({ service }: Props) {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const sectionInitial = reduceMotion ? false : "hidden";
  const sectionWhileInView = reduceMotion ? undefined : "show";

  const faqIcon = useMemo(() => (service.sss.length > 6 ? Plus : ChevronDown), [service.sss.length]);
  const FaqIcon = faqIcon;

  return (
    <div className="w-full bg-white text-primary">
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
          className="object-cover object-center"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/35 to-black/10" />
        <div className="relative z-10 flex h-full w-full items-center justify-center px-6 text-center">
          <div className="mx-auto max-w-4xl">
            <p className="font-display text-[11px] font-semibold uppercase tracking-[0.32em] text-white/70 sm:text-xs">
              {locale === "en" ? "SERVICE DETAIL" : "HİZMET DETAYI"}
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">
              {service.name}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-white/75 sm:text-lg">
              {service.shortDescription}
            </p>
          </div>
        </div>
      </section>

      {/* DESCRIPTION + SCOPE */}
      <motion.section
        className="mx-auto w-full max-w-[1200px] px-4 py-14 sm:px-6 sm:py-16 md:px-8 md:py-20"
        variants={stagger}
        initial={sectionInitial}
        whileInView={sectionWhileInView}
        viewport={{ once: false, amount: 0.18, margin: "-8% 0px" }}
      >
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <motion.div variants={fadeUp}>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-primary">
              {service.name}
            </h2>
            <p className="mt-6 text-pretty text-base leading-relaxed text-primary/70 sm:text-lg">
              {service.shortDescription}
            </p>
            <p className="mt-4 text-pretty text-base leading-relaxed text-primary/65 sm:text-lg">
              {locale === "en"
                ? "We structure a transparent, measurable process that clarifies design decisions, keeps budget and timeline under control, and protects quality during execution."
                : "Tasarım kararlarını netleştiren, bütçe ve zaman çizelgesini kontrollü ilerleten; uygulamada kaliteyi koruyan, şeffaf ve ölçülebilir bir süreç kurguluyoruz."}
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="rounded-2xl border border-border bg-surface p-8 shadow-[var(--shadow-card)]">
            <h3 className="font-display text-base font-semibold uppercase tracking-[0.26em] text-primary/70">
              {locale === "en" ? "SCOPE" : "HİZMET KAPSAMI"}
            </h3>
            <ul className="mt-6 space-y-4">
              {service.hizmetKapsami.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.8} />
                  <span className="text-sm leading-relaxed text-primary/75 sm:text-base">
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
        variants={stagger}
        initial={sectionInitial}
        whileInView={sectionWhileInView}
        viewport={{ once: false, amount: 0.12, margin: "-10% 0px" }}
      >
        <motion.div variants={fadeUp} className="flex items-end justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
              {locale === "en" ? "Process" : "Hizmet Süreci"}
            </h2>
            <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-primary/65 sm:text-lg">
              {locale === "en"
                ? "We define goals, deliverables, and approval checkpoints at each step—minimizing surprises and maximizing quality."
                : "Her adımda hedef, çıktı ve onay noktalarını netleştirerek minimum sürprizle, maksimum kaliteyle ilerliyoruz."}
            </p>
          </div>
        </motion.div>

        <motion.ol
          variants={stagger}
          className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          {service.hizmetSureci.map((step, i) => (
            <motion.li
              key={step.title}
              variants={fadeUp}
              className="relative rounded-2xl border border-border bg-white p-7 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                  <span className="font-display text-sm font-semibold tracking-wide">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-semibold tracking-tight text-primary">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-primary/70 sm:text-base">
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
        variants={stagger}
        initial={sectionInitial}
        whileInView={sectionWhileInView}
        viewport={{ once: false, amount: 0.12, margin: "-10% 0px" }}
      >
        <motion.div variants={fadeUp}>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
            {locale === "en" ? "FAQ" : "Sık Sorulan Sorular"}
          </h2>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-primary/65 sm:text-lg">
            {locale === "en"
              ? "We’ve gathered the most common questions about the process, deliverables, and communication flow."
              : "Süreç, teslim kapsamı ve iletişim akışı hakkında en sık gelen soruları tek yerde topladık."}
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-10 divide-y divide-border rounded-2xl border border-border bg-white shadow-[var(--shadow-card)]">
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
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-primary/75"
                    initial={false}
                    animate={reduceMotion ? undefined : { rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: reduceMotion ? 0.01 : 0.25, ease }}
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
                      transition={{ duration: reduceMotion ? 0.01 : 0.28, ease }}
                      className="overflow-hidden"
                    >
                      <p className="mt-4 text-pretty text-sm leading-relaxed text-primary/70 sm:text-base">
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
        initial={sectionInitial}
        whileInView={sectionWhileInView}
        viewport={{ once: false, amount: 0.2, margin: "-10% 0px" }}
      >
        <motion.div
          variants={fadeUp}
          className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-border bg-surface p-10 shadow-[var(--shadow-card)] md:flex-row md:items-center"
        >
          <div className="min-w-0">
            <h3 className="font-display text-2xl font-semibold tracking-tight text-primary">
              {locale === "en"
                ? "Request a free discovery call for your project"
                : "Projeniz için ücretsiz keşif talep edin"}
            </h3>
            <p className="mt-3 max-w-2xl text-pretty text-base leading-relaxed text-primary/65">
              {locale === "en"
                ? "With a short call, we’ll clarify scope and propose the best roadmap for you."
                : "Kısa bir görüşme ile kapsamı netleştirip size en doğru yol haritasını çıkaralım."}
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href={withLocalePath("/iletisim", locale)}
              title={locale === "en" ? "Go to contact page" : "İletişim sayfasına git"}
              className="inline-flex w-full shrink-0 items-center justify-center rounded-xl bg-primary px-7 py-4 font-display text-sm font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:w-auto"
            >
              {locale === "en" ? "Contact" : "İletişime Geç"}
            </Link>
            <Link
              href={withLocalePath("/projeler", locale)}
              title={locale === "en" ? "View projects" : "Projeleri görüntüle"}
              className="inline-flex w-full shrink-0 items-center justify-center rounded-xl border border-border bg-white px-7 py-4 font-display text-sm font-semibold uppercase tracking-[0.22em] text-primary transition-colors hover:border-primary/25 hover:bg-primary/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:w-auto"
            >
              {locale === "en" ? "View Projects" : "Projeleri Gör"}
            </Link>
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
}

