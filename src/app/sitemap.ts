import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

const routes = ["", "/projeler", "/hizmetlerimiz", "/hakkimizda", "/iletisim"] as const;

const paths: MetadataRoute.Sitemap = routes.map((path) => {
  const base = getSiteUrl();
  return {
    url: path === "" ? `${base}/` : `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.75,
  };
});

export default function sitemap(): MetadataRoute.Sitemap {
  return paths;
}
