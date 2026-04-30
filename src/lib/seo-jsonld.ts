import "server-only";

import { getSiteUrl, siteName } from "@/lib/seo";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE_TEL,
  CONTACT_SOCIAL_INSTAGRAM,
  CONTACT_SOCIAL_LINKEDIN,
  CONTACT_SOCIAL_WHATSAPP,
} from "@/content/contact-page";

type JsonLd = Record<string, unknown>;

export function jsonLdScriptProps(data: JsonLd) {
  return {
    type: "application/ld+json",
    // Next.js: server component içinde inline script
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  } as const;
}

export function organizationJsonLd() {
  const base = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: base,
    logo: `${base}/icon.svg`,
    email: CONTACT_EMAIL,
    telephone: CONTACT_PHONE_TEL,
    sameAs: [CONTACT_SOCIAL_INSTAGRAM, CONTACT_SOCIAL_WHATSAPP, CONTACT_SOCIAL_LINKEDIN].filter(Boolean),
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        telephone: CONTACT_PHONE_TEL,
        email: CONTACT_EMAIL,
        availableLanguage: ["tr-TR", "en-US"],
      },
    ],
  } satisfies JsonLd;
}

export function localBusinessJsonLd() {
  const base = getSiteUrl();
  return {
    "@context": "https://schema.org",
    // Mimarlık ofisi için en doğru genel tiplerden biri
    "@type": "ProfessionalService",
    name: siteName,
    url: base,
    image: `${base}/opengraph-image`,
    logo: `${base}/icon.svg`,
    telephone: CONTACT_PHONE_TEL,
    email: CONTACT_EMAIL,
    sameAs: [CONTACT_SOCIAL_INSTAGRAM, CONTACT_SOCIAL_WHATSAPP, CONTACT_SOCIAL_LINKEDIN].filter(Boolean),
    areaServed: {
      "@type": "Country",
      name: "Türkiye",
    },
    // Local SEO (mock — sonra kolayca güncelleyebilmen için)
    address: {
      "@type": "PostalAddress",
      streetAddress: "Güzelevler, 2067/2 SK A blok no:32/3",
      addressLocality: "Yüreğir",
      addressRegion: "Adana",
      postalCode: "01220",
      addressCountry: "TR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 37.0,
      longitude: 35.32,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "10:00",
        closes: "15:00",
      },
    ],
  } satisfies JsonLd;
}

export function websiteJsonLd(input?: { inLanguage?: string; path?: `/${string}` }) {
  const base = getSiteUrl();
  const path = input?.path ?? "";
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: `${base}${path}`,
    inLanguage: input?.inLanguage ?? "tr-TR",
  } satisfies JsonLd;
}

export function siteNavigationJsonLd(input: {
  inLanguage: string;
  pathPrefix?: "" | "/en";
}) {
  const base = getSiteUrl();
  const p = input.pathPrefix ?? "";
  const items = [
    { name: input.inLanguage.startsWith("en") ? "Home" : "Ana Sayfa", path: `${p || "/"}` },
    { name: input.inLanguage.startsWith("en") ? "Projects" : "Projeler", path: `${p}/projeler` },
    { name: input.inLanguage.startsWith("en") ? "Services" : "Hizmetlerimiz", path: `${p}/hizmetlerimiz` },
    { name: input.inLanguage.startsWith("en") ? "About" : "Hakkımızda", path: `${p}/hakkimizda` },
    { name: input.inLanguage.startsWith("en") ? "Contact" : "İletişim", path: `${p}/iletisim` },
  ].map((it) => ({
    "@type": "SiteNavigationElement",
    name: it.name,
    url: `${base}${it.path === "/" ? "" : it.path}`,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: input.inLanguage.startsWith("en") ? "Site Navigation" : "Site Navigasyonu",
    inLanguage: input.inLanguage,
    itemListElement: items,
  } satisfies JsonLd;
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; url: string } | { name: string; path: `/${string}` }>,
) {
  const base = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, idx) => {
      const raw = "url" in it ? it.url : it.path;
      const url = raw.startsWith("http") ? raw : `${base}${raw}`;
      return {
      "@type": "ListItem",
      position: idx + 1,
      name: it.name,
        item: url,
      };
    }),
  } satisfies JsonLd;
}

export function serviceJsonLd(input: { name: string; description: string; path: `/${string}`; imageUrl?: string }) {
  const base = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    provider: {
      "@type": "Organization",
      name: siteName,
      url: base,
    },
    url: `${base}${input.path}`,
    ...(input.imageUrl ? { image: input.imageUrl.startsWith("http") ? input.imageUrl : `${base}${input.imageUrl}` } : {}),
  } satisfies JsonLd;
}

export function projectJsonLd(input: {
  name: string;
  description?: string | null;
  path: `/${string}`;
  imageUrls?: string[];
  category?: string | null;
  status?: string | null;
  location?: string | null;
  year?: number | null;
  areaM2?: number | null;
}) {
  const base = getSiteUrl();
  const images = (input.imageUrls ?? []).map((u) => (u.startsWith("http") ? u : `${base}${u}`));
  const additionalProperty = [
    input.category
      ? { "@type": "PropertyValue", name: "Category", value: input.category }
      : null,
    input.status ? { "@type": "PropertyValue", name: "Status", value: input.status } : null,
    input.areaM2 != null
      ? {
          "@type": "PropertyValue",
          name: "Area",
          value: input.areaM2,
          unitText: "m²",
        }
      : null,
  ].filter(Boolean);
  return {
    "@context": "https://schema.org",
    // Mimarlık işleri için Project iyi bir genel tip; gerekirse CreativeWork'a düşer.
    "@type": "Project",
    name: input.name,
    description: input.description ?? undefined,
    url: `${base}${input.path}`,
    ...(images.length ? { image: images } : {}),
    ...(additionalProperty.length ? { additionalProperty } : {}),
    ...(input.location ? { location: input.location } : {}),
    ...(input.year ? { temporalCoverage: String(input.year) } : {}),
  } satisfies JsonLd;
}

