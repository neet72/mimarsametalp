import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetailClient } from "@/components/projects/ProjectDetailClient";
import { getPublicProjectBySlug, getPublicProjects } from "@/lib/public/projects";
import { pageMetadata } from "@/lib/seo";
import { firstImageUrl } from "@/lib/media-url";
import { pickProjectForLocale } from "@/lib/public/project-locale";
import { breadcrumbJsonLd, jsonLdScriptProps, projectJsonLd } from "@/lib/seo-jsonld";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const slug = String(id ?? "").trim().toLowerCase();
  if (!slug) {
    return pageMetadata({
      title: "Projects",
      description: "Architecture portfolio — Samet Alp Architecture project gallery.",
      path: "/en/projeler",
    });
  }

  const project = await getPublicProjectBySlug(slug);
  if (!project) {
    return {
      ...pageMetadata({
        title: "Project not found",
        description: "This project is not published or may have moved. Browse the portfolio list.",
        path: "/en/projeler",
      }),
      robots: { index: false, follow: true },
    };
  }

  const view = pickProjectForLocale(project, "en");
  const img = firstImageUrl(project.imageUrls);
  const title = view.title;
  const description =
    view.description?.slice(0, 180) ||
    `${view.title}${view.category ? ` — ${view.category}` : ""}${view.location ? `, ${view.location}` : ""}. Samet Alp Architecture project detail, gallery, and key information.`.slice(
      0,
      180,
    );

  return {
    ...pageMetadata({
      title,
      description,
      path: `/en/projeler/${project.slug}`,
    }),
    openGraph: {
      type: "website",
      locale: "en_US",
      title: `${title} | Samet Alp Architecture`,
      description,
      url: `/en/projeler/${project.slug}`,
      images: img ? [{ url: img }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Samet Alp Architecture`,
      description,
      images: img ? [img] : undefined,
    },
  };
}

export default async function ProjectDetailPageEn({ params }: PageProps) {
  const { id } = await params;
  const slug = String(id ?? "").trim().toLowerCase();
  if (!slug) notFound();

  const project = await getPublicProjectBySlug(slug);
  if (!project) notFound();

  const view = pickProjectForLocale(project, "en");

  const all = await getPublicProjects();
  const relatedProjects = all
    .filter((p) => p.slug !== project.slug && (view.category ? pickProjectForLocale(p, "en").category === view.category : true))
    .slice(0, 4)
    .map((p) => {
      const v = pickProjectForLocale(p, "en");
      return { title: v.title, href: `/en/projeler/${p.slug}` };
    });

  return (
    <div className="w-full">
      <script
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Home", path: "/en" },
            { name: "Projects", path: "/en/projeler" },
            { name: view.title, path: `/en/projeler/${project.slug}` },
          ]),
        )}
      />
      <script
        {...jsonLdScriptProps(
          projectJsonLd({
            name: view.title,
            description: view.description,
            path: `/en/projeler/${project.slug}`,
            imageUrls: project.imageUrls,
            category: view.category,
            status: view.status,
            location: view.location,
            year: project.year,
            areaM2: project.areaM2,
            inLanguage: "en-US",
            dateModified: project.updatedAt,
          }),
        )}
      />
      <ProjectDetailClient
        project={{
          title: view.title,
          category: view.category ?? null,
          description: view.description ?? null,
          status: view.status ?? null,
          year: project.year ?? null,
          location: view.location ?? null,
          areaM2: project.areaM2 ?? null,
          imageUrl: project.imageUrls[0] ?? "/images/hero-1.webp",
          gallery: project.imageUrls,
        }}
        relatedProjects={relatedProjects}
      />
    </div>
  );
}

