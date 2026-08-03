import "server-only";

import { isVideoUrl } from "@/lib/media-url";
import { getSiteUrl, siteName } from "@/lib/seo";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE_TEL,
  CONTACT_SOCIAL_INSTAGRAM,
  CONTACT_SOCIAL_LINKEDIN,
  CONTACT_SOCIAL_WHATSAPP,
} from "@/content/contact-page";
import {
  OFFICE_COUNTRY_CODE,
  OFFICE_LOCALITY,
  OFFICE_POSTAL,
  OFFICE_REGION,
  OFFICE_STREET_TR,
} from "@/content/kvkk-page";
import {
  ABOUT_ARCHITECT_BIO,
  ABOUT_ARCHITECT_NAME,
  ABOUT_ARCHITECT_ROLE,
  ABOUT_VISION_BODY,
} from "@/content/about-page";

type JsonLd = Record<string, unknown>;

const ORG_ID = (base: string) => `${base}/#organization`;
const LOCAL_ID = (base: string) => `${base}/#localbusiness`;
const WEBSITE_ID = (base: string) => `${base}/#website`;
const PERSON_ID = (base: string) => `${base}/#architect`;

/** Knowledge Panel / rich result için kare PNG (favicon.svg yerine). */
function brandLogoUrl(base: string) {
  return `${base}/apple-touch-icon.png`;
}

export function jsonLdScriptProps(data: JsonLd) {
  // `</script>` içeren CMS metinleri script bloğunu erken kapatmasın diye `<` kaçırılır
  const html = JSON.stringify(data).replace(/</g, "\\u003c");
  return {
    type: "application/ld+json",
    // Next.js: server component içinde inline script
    dangerouslySetInnerHTML: { __html: html },
  } as const;
}

export function organizationJsonLd() {
  const base = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID(base),
    name: siteName,
    legalName: siteName,
    url: base,
    logo: {
      "@type": "ImageObject",
      url: brandLogoUrl(base),
      width: 180,
      height: 180,
    },
    image: brandLogoUrl(base),
    email: CONTACT_EMAIL,
    telephone: CONTACT_PHONE_TEL,
    sameAs: [CONTACT_SOCIAL_INSTAGRAM, CONTACT_SOCIAL_WHATSAPP, CONTACT_SOCIAL_LINKEDIN].filter(Boolean),
    address: {
      "@type": "PostalAddress",
      streetAddress: OFFICE_STREET_TR,
      addressLocality: OFFICE_LOCALITY,
      addressRegion: OFFICE_REGION,
      postalCode: OFFICE_POSTAL,
      addressCountry: OFFICE_COUNTRY_CODE,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        telephone: CONTACT_PHONE_TEL,
        email: CONTACT_EMAIL,
        areaServed: "TR",
        availableLanguage: ["Turkish", "English"],
      },
    ],
  } satisfies JsonLd;
}

export function localBusinessJsonLd() {
  const base = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": ["ProfessionalService", "LocalBusiness"],
    "@id": LOCAL_ID(base),
    name: siteName,
    url: base,
    image: [`${base}/opengraph-image`, brandLogoUrl(base)],
    logo: brandLogoUrl(base),
    telephone: CONTACT_PHONE_TEL,
    email: CONTACT_EMAIL,
    priceRange: "$$",
    sameAs: [CONTACT_SOCIAL_INSTAGRAM, CONTACT_SOCIAL_WHATSAPP, CONTACT_SOCIAL_LINKEDIN].filter(Boolean),
    parentOrganization: { "@id": ORG_ID(base) },
    areaServed: [
      { "@type": "City", name: "Adana" },
      { "@type": "AdministrativeArea", name: "Çukurova" },
      { "@type": "Country", name: "Türkiye" },
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: OFFICE_STREET_TR,
      addressLocality: OFFICE_LOCALITY,
      addressRegion: OFFICE_REGION,
      postalCode: OFFICE_POSTAL,
      addressCountry: OFFICE_COUNTRY_CODE,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 36.9914,
      longitude: 35.3308,
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
    knowsAbout: [
      "Architectural design",
      "Interior architecture",
      "Building permits",
      "Turnkey construction",
      "Renovation",
    ],
  } satisfies JsonLd;
}

export function websiteJsonLd(input?: { inLanguage?: string; path?: `/${string}` }) {
  const base = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID(base),
    name: siteName,
    url: base,
    inLanguage: input?.inLanguage ?? "tr-TR",
    publisher: { "@id": ORG_ID(base) },
    about: { "@id": LOCAL_ID(base) },
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

export function personArchitectJsonLd(input?: { imageUrl?: string | null }) {
  const base = getSiteUrl();
  const img = input?.imageUrl?.trim();
  const image = img ? (img.startsWith("http") ? img : `${base}${img}`) : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID(base),
    name: ABOUT_ARCHITECT_NAME,
    jobTitle: ABOUT_ARCHITECT_ROLE,
    description: ABOUT_ARCHITECT_BIO,
    worksFor: { "@id": ORG_ID(base) },
    url: `${base}/hakkimizda`,
    ...(image ? { image } : {}),
    knowsAbout: ["Architecture", "Project management", "Interior design", "Turnkey delivery"],
  } satisfies JsonLd;
}

export function aboutPageJsonLd(input: {
  path: `/${string}`;
  inLanguage: string;
  description?: string;
  portraitImageUrl?: string | null;
}) {
  const base = getSiteUrl();
  const url = `${base}${input.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${url}#webpage`,
    url,
    name: input.inLanguage.startsWith("en") ? `About | ${siteName}` : `Hakkımızda | ${siteName}`,
    description: input.description ?? ABOUT_VISION_BODY.slice(0, 300),
    inLanguage: input.inLanguage,
    isPartOf: { "@id": WEBSITE_ID(base) },
    about: [{ "@id": ORG_ID(base) }, { "@id": PERSON_ID(base) }],
    mainEntity: { "@id": PERSON_ID(base) },
  } satisfies JsonLd;
}

export function contactPageJsonLd(input: { path: `/${string}`; inLanguage: string; description?: string }) {
  const base = getSiteUrl();
  const url = `${base}${input.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${url}#webpage`,
    url,
    name: input.inLanguage.startsWith("en") ? `Contact | ${siteName}` : `İletişim | ${siteName}`,
    description: input.description,
    inLanguage: input.inLanguage,
    isPartOf: { "@id": WEBSITE_ID(base) },
    about: { "@id": LOCAL_ID(base) },
    mainEntity: { "@id": LOCAL_ID(base) },
  } satisfies JsonLd;
}

export function faqPageJsonLd(input: {
  path: `/${string}`;
  inLanguage: string;
  items: Array<{ question: string; answer: string }>;
}) {
  const base = getSiteUrl();
  const url = `${base}${input.path}`;
  const entities = input.items
    .map((it) => ({
      q: it.question.trim(),
      a: it.answer.trim(),
    }))
    .filter((it) => it.q.length > 0 && it.a.length > 0)
    .slice(0, 20);

  if (entities.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    url,
    inLanguage: input.inLanguage,
    isPartOf: { "@id": WEBSITE_ID(base) },
    mainEntity: entities.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: it.a,
      },
    })),
  } satisfies JsonLd;
}

export function webPageJsonLd(input: {
  path: `/${string}`;
  name: string;
  description?: string;
  inLanguage: string;
}) {
  const base = getSiteUrl();
  const url = `${base}${input.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: input.name,
    description: input.description,
    inLanguage: input.inLanguage,
    isPartOf: { "@id": WEBSITE_ID(base) },
    about: { "@id": ORG_ID(base) },
  } satisfies JsonLd;
}

export function serviceJsonLd(input: {
  name: string;
  description: string | null | undefined;
  path: `/${string}`;
  imageUrl?: string | null;
  inLanguage?: string;
  dateModified?: Date | string | null;
  serviceType?: string | null;
}) {
  const base = getSiteUrl();
  const url = `${base}${input.path}`;
  const img = input.imageUrl?.trim();
  const image = img ? (img.startsWith("http") ? img : `${base}${img}`) : undefined;
  const desc = String(input.description ?? "").trim();
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: input.name,
    description: desc.length > 0 ? desc : undefined,
    serviceType: input.serviceType?.trim() || input.name,
    provider: {
      "@id": ORG_ID(base),
    },
    areaServed: { "@type": "City", name: "Adana" },
    url,
    mainEntityOfPage: { "@id": `${url}#webpage` },
    ...(input.inLanguage ? { inLanguage: input.inLanguage } : {}),
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    ...(image ? { image } : {}),
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
  inLanguage?: string;
  dateModified?: Date | string | null;
}) {
  const base = getSiteUrl();
  const url = `${base}${input.path}`;
  const images = (input.imageUrls ?? [])
    .filter((u) => typeof u === "string" && u.trim() && !isVideoUrl(u))
    .map((u) => (u.startsWith("http") ? u : `${base}${u}`));
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
  const desc = String(input.description ?? "").trim();
  return {
    "@context": "https://schema.org",
    "@type": "Project",
    "@id": `${url}#project`,
    name: input.name,
    description: desc.length > 0 ? desc : undefined,
    url,
    mainEntityOfPage: { "@id": `${url}#webpage` },
    isPartOf: { "@id": WEBSITE_ID(base) },
    creator: { "@id": ORG_ID(base) },
    ...(images.length ? { image: images } : {}),
    ...(additionalProperty.length ? { additionalProperty } : {}),
    ...(input.location ? { location: { "@type": "Place", name: input.location } } : {}),
    ...(input.year ? { temporalCoverage: String(input.year) } : {}),
    ...(input.inLanguage ? { inLanguage: input.inLanguage } : {}),
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
  } satisfies JsonLd;
}

export function itemListJsonLd(input: {
  name: string;
  path: `/${string}`;
  inLanguage: string;
  items: Array<{ name: string; path: `/${string}`; imageUrl?: string | null; itemType?: string }>;
}) {
  const base = getSiteUrl();
  const url = `${base}${input.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${url}#itemlist`,
    name: input.name,
    url,
    inLanguage: input.inLanguage,
    itemListElement: input.items.map((it, idx) => {
      const itemUrl = `${base}${it.path}`;
      const rawImg = it.imageUrl?.trim();
      const image = rawImg ? (rawImg.startsWith("http") ? rawImg : `${base}${rawImg}`) : undefined;
      return {
        "@type": "ListItem",
        position: idx + 1,
        item: {
          "@type": it.itemType ?? "Thing",
          "@id": itemUrl,
          url: itemUrl,
          name: it.name,
          ...(image ? { image } : {}),
        },
      };
    }),
  } satisfies JsonLd;
}
