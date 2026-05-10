import "server-only";

import type { ServiceDetailData } from "@/components/hizmetlerimiz/ServiceDetailClient";
import { SERVICES_DETAIL as SERVICES_EN } from "@/content/services-detail.en";
import { SERVICES_DETAIL as SERVICES_TR } from "@/content/services-detail";
import type { PublicService } from "./services";
import { pickServiceForLocale } from "@/lib/public/service-locale";

const FALLBACK_HERO = "/images/hero-1.webp";

/**
 * Admin’de yayımlanan hizmet (DB) ile `services-detail` statik içeriğini birleştirir.
 * Yalnız DB’de olan slug’lar için de geçerli `ServiceDetailData` üretir.
 */
export function resolveServiceDetailData(
  slug: string,
  locale: "tr" | "en",
  db: PublicService | null,
): ServiceDetailData | null {
  const staticMap = locale === "en" ? SERVICES_EN : SERVICES_TR;
  const staticRow = staticMap[slug];

  if (staticRow && db) {
    const p = pickServiceForLocale(db, locale);
    return {
      ...staticRow,
      name: p.title.trim() || staticRow.name,
      shortDescription: p.shortDescription?.trim() || staticRow.shortDescription,
      heroImageUrl: db.heroImageUrl ?? staticRow.heroImageUrl,
      hizmetKapsami: p.scope.length > 0 ? p.scope : staticRow.hizmetKapsami,
      hizmetSureci: p.process.length > 0 ? p.process : staticRow.hizmetSureci,
      sss: p.faq.length > 0 ? p.faq : staticRow.sss,
    };
  }

  if (staticRow) return staticRow;
  if (db) return publicServiceToDetail(db, locale);

  return null;
}

function publicServiceToDetail(db: PublicService, locale: "tr" | "en"): ServiceDetailData {
  const en = locale === "en";
  const p = pickServiceForLocale(db, locale);
  const shortDescription =
    p.shortDescription?.trim() ??
    (en ? "Service details from our studio in Adana." : "Adana’daki ofisimizden hizmet detayı.");
  return {
    slug: db.slug,
    name: p.title,
    heroImageUrl: db.heroImageUrl ?? FALLBACK_HERO,
    shortDescription,
    hizmetKapsami:
      p.scope.length > 0
        ? p.scope
        : [en ? "Scope available on request." : "Kapsam için iletişime geçebilirsiniz."],
    hizmetSureci:
      p.process.length > 0
        ? p.process
        : [
            {
              title: en ? "How we work" : "Çalışma biçimi",
              description: en ? "Contact us to discuss your project." : "Projenizi konuşmak için iletişime geçin.",
            },
          ],
    sss: p.faq,
  };
}
