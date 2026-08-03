import type { Metadata } from "next";
import { ProjectsPortfolio } from "@/components/projects/ProjectsPortfolio";
import { pageMetadata } from "@/lib/seo";
import { pickProjectForLocale } from "@/lib/public/project-locale";
import { getPublicProjects } from "@/lib/public/projects";
import { breadcrumbJsonLd, itemListJsonLd, jsonLdScriptProps } from "@/lib/seo-jsonld";

const pageTitle = "Projects | Samet Alp Architecture";
const pageDescription =
  "Architecture portfolio in Adana: residential, commercial, and interior projects by Samet Alp Architecture.";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Projects",
    description: pageDescription,
    path: "/en/projeler",
  }),
  title: { absolute: pageTitle },
  description: pageDescription,
};

export default async function ProjectsPageEn() {
  const rows = await getPublicProjects();
  const projects = rows.map((p) => {
    const en = pickProjectForLocale(p, "en");
    return {
      slug: p.slug,
      title: en.title,
      imageUrl: p.imageUrls[0] ?? "/images/hero-1.webp",
    };
  });
  return (
    <div className="w-full">
      <script
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Home", path: "/en" },
            { name: "Projects", path: "/en/projeler" },
          ]),
        )}
      />
      <script
        {...jsonLdScriptProps(
          itemListJsonLd({
            name: "Projects",
            path: "/en/projeler",
            inLanguage: "en-US",
            items: projects.map((p) => ({
              name: p.title,
              path: `/en/projeler/${p.slug}`,
              imageUrl: p.imageUrl,
              itemType: "Project",
            })),
          }),
        )}
      />
      <ProjectsPortfolio projects={projects} />
    </div>
  );
}

