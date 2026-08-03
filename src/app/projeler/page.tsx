import type { Metadata } from "next";
import { ProjectsPortfolio } from "@/components/projects/ProjectsPortfolio";
import { pageMetadata } from "@/lib/seo";
import { getPublicProjects } from "@/lib/public/projects";
import { breadcrumbJsonLd, itemListJsonLd, jsonLdScriptProps } from "@/lib/seo-jsonld";

const pageTitle = "Projeler | Samet Alp Mimarlık";
const pageDescription =
  "Adana mimarlık portföyü: konut, ticari ve iç mimarlık projeleri. Samet Alp Mimarlık uygulama ve tasarım çalışmalarını keşfedin.";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Projeler",
    description: pageDescription,
    path: "/projeler",
  }),
  title: { absolute: pageTitle },
  description: pageDescription,
};

export default async function ProjelerPage() {
  const rows = await getPublicProjects();
  const projects = rows.map((p) => ({
    slug: p.slug,
    title: p.title,
    imageUrl: p.imageUrls[0] ?? "/images/hero-1.webp",
  }));
  return (
    <div className="w-full">
      <script
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Ana Sayfa", path: "/" },
            { name: "Projeler", path: "/projeler" },
          ]),
        )}
      />
      <script
        {...jsonLdScriptProps(
          itemListJsonLd({
            name: "Projeler",
            path: "/projeler",
            inLanguage: "tr-TR",
            items: projects.map((p) => ({
              name: p.title,
              path: `/projeler/${p.slug}`,
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
