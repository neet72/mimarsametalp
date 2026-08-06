import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";
import { getPublicProjects } from "@/lib/public/projects";
import { SERVICES_GALLERY } from "@/content/services-gallery";
import { getPublicServices } from "@/lib/public/services";

/**
 * Tek `urlset` yeterli (geodaddy / resemble tarzı).
 * ElevenLabs / Cambridge `sitemapindex` yalnızca çok büyük siteler içindir.
 */
export const revalidate = 86400; // 1 gün

type SitemapEntry = MetadataRoute.Sitemap[number];

function isValidPublicSlug(slug: unknown): slug is string {
  if (typeof slug !== "string") return false;
  const s = slug.trim().toLowerCase();
  if (s.length < 2 || s.length > 120) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
}

function toLastModified(value: unknown): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

function absUrl(path: string): string {
  const base = getSiteUrl();
  if (path === "/" || path === "") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function absImageUrl(src: string): string | null {
  const trimmed = src.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return `${getSiteUrl()}${trimmed}`;
  return null;
}

/** TR + EN çift URL + xhtml:link hreflang (resemble xmlns:xhtml yaklaşımı). */
function withLangAlternates(
  trPath: string,
  enPath: string,
  extra: Omit<SitemapEntry, "url" | "alternates">,
): MetadataRoute.Sitemap {
  const trUrl = absUrl(trPath);
  const enUrl = absUrl(enPath);
  const languages = {
    "tr-TR": trUrl,
    tr: trUrl,
    "en-US": enUrl,
    en: enUrl,
    "x-default": trUrl,
  };
  return [
    { url: trUrl, alternates: { languages }, ...extra },
    { url: enUrl, alternates: { languages }, ...extra },
  ];
}

async function loadPublicCatalog(): Promise<{
  projects: Awaited<ReturnType<typeof getPublicProjects>>;
  services: Awaited<ReturnType<typeof getPublicServices>>;
}> {
  try {
    const [projects, services] = await Promise.all([getPublicProjects(), getPublicServices()]);
    return { projects, services };
  } catch {
    // getPublicProjects zaten DB hatasında static fallback döner; burası ek güvenlik ağı.
    return { projects: [], services: [] };
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects, services } = await loadPublicCatalog();
  const now = new Date();

  // Öncelik basamağı (geodaddy benzeri: ana sayfa → hub → detay → yasal)
  const staticPairs: MetadataRoute.Sitemap = [
    ...withLangAlternates("/", "/en", {
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    }),
    ...withLangAlternates("/projeler", "/en/projeler", {
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    }),
    ...withLangAlternates("/hizmetlerimiz", "/en/hizmetlerimiz", {
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    }),
    ...withLangAlternates("/iletisim", "/en/iletisim", {
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85,
    }),
    ...withLangAlternates("/hakkimizda", "/en/hakkimizda", {
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    }),
    ...withLangAlternates("/kvkk", "/en/kvkk", {
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    }),
  ];

  const serviceSource =
    services.length > 0
      ? services.map((s) => ({ slug: s.slug, updatedAt: s.updatedAt }))
      : SERVICES_GALLERY.map((s) => ({ slug: s.slug, updatedAt: now }));

  const servicePairs: MetadataRoute.Sitemap = serviceSource
    .filter((s) => isValidPublicSlug(s.slug))
    .flatMap((s) =>
      withLangAlternates(`/hizmetlerimiz/${s.slug}`, `/en/hizmetlerimiz/${s.slug}`, {
        lastModified: toLastModified(s.updatedAt),
        changeFrequency: "monthly",
        priority: 0.75,
      }),
    );

  const projectPairs: MetadataRoute.Sitemap = projects
    .filter((p) => isValidPublicSlug(p.slug))
    .flatMap((p) => {
      const images = (p.imageUrls ?? [])
        .map(absImageUrl)
        .filter((u): u is string => Boolean(u))
        .slice(0, 8);
      return withLangAlternates(`/projeler/${p.slug}`, `/en/projeler/${p.slug}`, {
        lastModified: toLastModified(p.updatedAt),
        changeFrequency: "monthly",
        priority: 0.8,
        ...(images.length > 0 ? { images } : {}),
      });
    });

  return [...staticPairs, ...servicePairs, ...projectPairs];
}
