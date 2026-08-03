import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";
import { getPublicProjects } from "@/lib/public/projects";
import { SERVICES_GALLERY } from "@/content/services-gallery";
import { getPublicServices } from "@/lib/public/services";

// Çok sık değişmiyor — cache dostu.
export const revalidate = 86400; // 1 gün

const lastModified = new Date();

function isValidPublicSlug(slug: unknown): slug is string {
  if (typeof slug !== "string") return false;
  const s = slug.trim().toLowerCase();
  if (s.length < 2 || s.length > 120) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
}

function withLangAlternates(
  trPath: string,
  enPath: string,
  extra: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">,
): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const trUrl = trPath === "/" ? `${base}/` : `${base}${trPath}`;
  const enUrl = `${base}${enPath}`;
  const languages = { "tr-TR": trUrl, tr: trUrl, "en-US": enUrl, en: enUrl, "x-default": trUrl };
  return [
    { url: trUrl, alternates: { languages }, ...extra },
    { url: enUrl, alternates: { languages }, ...extra },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  let projects: Awaited<ReturnType<typeof getPublicProjects>> = [];
  let services: Awaited<ReturnType<typeof getPublicServices>> = [];
  try {
    [projects, services] = await Promise.all([getPublicProjects(), getPublicServices()]);
  } catch {
    // DB yoksa bile sitemap çalışsın.
  }

  const staticPairs: MetadataRoute.Sitemap = [
    ...withLangAlternates("/", "/en", { lastModified, changeFrequency: "weekly", priority: 1 }),
    ...withLangAlternates("/projeler", "/en/projeler", {
      lastModified,
      changeFrequency: "monthly",
      priority: 0.85,
    }),
    ...withLangAlternates("/hizmetlerimiz", "/en/hizmetlerimiz", {
      lastModified,
      changeFrequency: "monthly",
      priority: 0.85,
    }),
    ...withLangAlternates("/hakkimizda", "/en/hakkimizda", {
      lastModified,
      changeFrequency: "monthly",
      priority: 0.75,
    }),
    ...withLangAlternates("/iletisim", "/en/iletisim", {
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    }),
    ...withLangAlternates("/kvkk", "/en/kvkk", {
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    }),
  ];

  const serviceSource =
    services.length > 0
      ? services.map((s) => ({ slug: s.slug, updatedAt: s.updatedAt }))
      : SERVICES_GALLERY.map((s) => ({ slug: s.slug, updatedAt: lastModified }));

  const servicePairs: MetadataRoute.Sitemap = serviceSource
    .filter((s) => isValidPublicSlug(s.slug))
    .flatMap((s) =>
      withLangAlternates(`/hizmetlerimiz/${s.slug}`, `/en/hizmetlerimiz/${s.slug}`, {
        lastModified: s.updatedAt ?? lastModified,
        changeFrequency: "monthly",
        priority: 0.65,
      }),
    );

  const projectPairs: MetadataRoute.Sitemap = projects
    .filter((p) => isValidPublicSlug(p.slug))
    .flatMap((p) =>
      withLangAlternates(`/projeler/${p.slug}`, `/en/projeler/${p.slug}`, {
        lastModified: p.updatedAt ?? lastModified,
        changeFrequency: "monthly",
        priority: 0.7,
      }),
    );

  // llms.txt keşfi için (sitemap’te opsiyonel ama zararsız değil — atlıyoruz; public’te zaten var)
  void base;

  return [...staticPairs, ...servicePairs, ...projectPairs];
}
