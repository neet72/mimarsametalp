import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetailClient } from "@/components/projects/ProjectDetailClient";
import { getPublicProjectBySlug } from "@/lib/public/projects";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, jsonLdScriptProps, projectJsonLd } from "@/lib/seo-jsonld";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const slug = String(id ?? "").trim().toLowerCase();
  if (!slug) {
    return pageMetadata({
      title: "Project",
      description: "Project details.",
      path: "/en/projeler",
    });
  }

  const project = await getPublicProjectBySlug(slug);
  if (!project) {
    return pageMetadata({
      title: "Project",
      description: "Project details.",
      path: "/en/projeler",
    });
  }

  const img = project.imageUrls[0];
  const title = project.title;
  const description =
    project.description?.slice(0, 180) ||
    "Samet Alp Architecture project detail: architectural approach, gallery, and key project information.";

  return {
    ...pageMetadata({
      title,
      description,
      path: `/en/projeler/${project.slug}`,
    }),
    openGraph: {
      type: "website",
      locale: "en_US",
      title: `${title} · Samet Alp Architecture`,
      description,
      url: `/en/projeler/${project.slug}`,
      images: img ? [{ url: img }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · Samet Alp Architecture`,
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

  return (
    <>
      <script
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Home", path: "/en" },
            { name: "Projects", path: "/en/projeler" },
            { name: project.title, path: `/en/projeler/${project.slug}` },
          ]),
        )}
      />
      <script
        {...jsonLdScriptProps(
          projectJsonLd({
            name: project.title,
            description: project.description,
            path: `/en/projeler/${project.slug}`,
            imageUrls: project.imageUrls,
            location: project.location,
            year: project.year,
          }),
        )}
      />
      <ProjectDetailClient
        project={{
          title: project.title,
          category: project.category ?? null,
          description: project.description ?? null,
          status: project.status ?? null,
          year: project.year ?? null,
          location: project.location ?? null,
          areaM2: project.areaM2 ?? null,
          imageUrl: project.imageUrls[0] ?? "/images/hero-1.webp",
          gallery: project.imageUrls,
        }}
      />
    </>
  );
}

