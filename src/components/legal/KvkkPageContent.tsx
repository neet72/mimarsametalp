"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  KVKK_PAGE_TITLE,
  KVKK_SECTIONS,
  KVKK_UPDATED,
} from "@/content/kvkk-page";
import {
  KVKK_PAGE_TITLE as KVKK_PAGE_TITLE_EN,
  KVKK_SECTIONS as KVKK_SECTIONS_EN,
  KVKK_UPDATED as KVKK_UPDATED_EN,
} from "@/content/kvkk-page.en";
import { localeFromPathname, withLocalePath } from "@/lib/locale";
import { pageContainerClass } from "@/lib/page-layout";
import { cn } from "@/lib/cn";

export function KvkkPageContent() {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const isEn = locale === "en";
  const title = isEn ? KVKK_PAGE_TITLE_EN : KVKK_PAGE_TITLE;
  const updated = isEn ? KVKK_UPDATED_EN : KVKK_UPDATED;
  const sections = isEn ? KVKK_SECTIONS_EN : KVKK_SECTIONS;

  return (
    <div className="w-full bg-surface">
      <div className={cn(pageContainerClass, "py-14 sm:py-16 md:py-20")}>
        <header className="max-w-3xl border-b border-border/70 pb-10">
          <p className="font-display text-[10px] font-semibold uppercase tracking-[0.34em] text-accent sm:text-[11px]">
            {isEn ? "Legal" : "Yasal"}
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-primary sm:text-4xl md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-sm text-muted">
            {isEn ? "Last updated:" : "Son güncelleme:"} {updated}
          </p>
        </header>

        <div className="mt-12 max-w-3xl space-y-12">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-28">
              <h2 className="font-display text-xl font-semibold tracking-tight text-primary sm:text-2xl">
                {section.title}
              </h2>
              <div className="mt-4 space-y-4">
                {section.paragraphs.map((p) => (
                  <p
                    key={p.slice(0, 48)}
                    className="text-pretty text-base leading-relaxed text-muted sm:text-[1.0625rem]"
                  >
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-14 max-w-3xl border-t border-border/60 pt-8 text-sm text-muted">
          <Link
            href={withLocalePath("/iletisim", locale)}
            className="font-medium text-primary underline-offset-4 transition hover:text-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {isEn ? "Back to contact" : "İletişime dön"}
          </Link>
        </p>
      </div>
    </div>
  );
}
