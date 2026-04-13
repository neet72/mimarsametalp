import "server-only";

import { getSiteUrl, siteName } from "@/lib/seo";

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
    logo: `${base}/favicon.ico`,
    sameAs: [],
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

export function breadcrumbJsonLd(items: Array<{ name: string; path: `/${string}` }>) {
  const base = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: it.name,
      item: `${base}${it.path}`,
    })),
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
  location?: string | null;
  year?: number | null;
}) {
  const base = getSiteUrl();
  const images = (input.imageUrls ?? []).map((u) => (u.startsWith("http") ? u : `${base}${u}`));
  return {
    "@context": "https://schema.org",
    // Mimarlık işleri için Project iyi bir genel tip; gerekirse CreativeWork'a düşer.
    "@type": "Project",
    name: input.name,
    description: input.description ?? undefined,
    url: `${base}${input.path}`,
    ...(images.length ? { image: images } : {}),
    ...(input.location ? { location: input.location } : {}),
    ...(input.year ? { temporalCoverage: String(input.year) } : {}),
  } satisfies JsonLd;
}

