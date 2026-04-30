import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";
import { getPublicProjects } from "@/lib/public/projects";
import { SERVICES_GALLERY } from "@/content/services-gallery";
import { getPublicServices } from "@/lib/public/services";

const routes = ["", "/projeler", "/hizmetlerimiz", "/hakkimizda", "/iletisim"] as const;
const enRoutes = ["/en", "/en/projeler", "/en/hizmetlerimiz", "/en/hakkimizda", "/en/iletisim"] as const;

// Çok sık değişmiyor — cache dostu.
export const revalidate = 86400; // 1 gün

const lastModified = new Date();

const paths: MetadataRoute.Sitemap = routes.map((path) => {
  const base = getSiteUrl();
  return {
    url: path === "" ? `${base}/` : `${base}${path}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.75,
  };
});

const enPaths: MetadataRoute.Sitemap = enRoutes.map((path) => {
  const base = getSiteUrl();
  return {
    url: `${base}${path}`,
    lastModified,
    changeFrequency: path === "/en" ? "weekly" : "monthly",
    priority: path === "/en" ? 0.9 : 0.7,
  };
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  let projects: Awaited<ReturnType<typeof getPublicProjects>> = [];
  let services: Awaited<ReturnType<typeof getPublicServices>> = [];
  try {
    [projects, services] = await Promise.all([getPublicProjects(), getPublicServices()]);
  } catch {
    // DB yoksa bile sitemap çalışsın.
  }

  const projectPaths: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${base}/projeler/${p.slug}`,
    lastModified: p.updatedAt ?? lastModified,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const projectPathsEn: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${base}/en/projeler/${p.slug}`,
    lastModified: p.updatedAt ?? lastModified,
    changeFrequency: "monthly",
    priority: 0.55,
  }));

  const serviceSource =
    services.length > 0
      ? services.map((s) => ({ slug: s.slug, updatedAt: s.updatedAt }))
      : SERVICES_GALLERY.map((s) => ({ slug: s.slug, updatedAt: lastModified }));

  const servicePaths: MetadataRoute.Sitemap = serviceSource.map((s) => ({
    url: `${base}/hizmetlerimiz/${s.slug}`,
    lastModified: s.updatedAt ?? lastModified,
    changeFrequency: "monthly",
    priority: 0.55,
  }));

  const servicePathsEn: MetadataRoute.Sitemap = serviceSource.map((s) => ({
    url: `${base}/en/hizmetlerimiz/${s.slug}`,
    lastModified: s.updatedAt ?? lastModified,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...paths, ...enPaths, ...servicePaths, ...servicePathsEn, ...projectPaths, ...projectPathsEn];
}
