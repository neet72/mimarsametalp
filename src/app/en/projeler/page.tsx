import type { Metadata } from "next";
import { ProjectsPortfolio } from "@/components/projects/ProjectsPortfolio";
import { pageMetadata } from "@/lib/seo";
import { getPublicProjects } from "@/lib/public/projects";
import { breadcrumbJsonLd, jsonLdScriptProps } from "@/lib/seo-jsonld";

export const metadata: Metadata = pageMetadata({
  title: "Projects",
  description:
    "A curated selection of residential, commercial, and interior architecture projects and applications.",
  path: "/en/projeler",
});

export default async function ProjectsPageEn() {
  const rows = await getPublicProjects();
  const projects = rows.map((p) => ({
    slug: p.slug,
    title: p.title,
    imageUrl: p.imageUrls[0] ?? "/images/hero-1.webp",
  }));
  return (
    <>
      <script
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Home", path: "/en" },
            { name: "Projects", path: "/en/projeler" },
          ]),
        )}
      />
      <ProjectsPortfolio projects={projects} />
    </>
  );
}

