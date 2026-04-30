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
  if (!slug) return pageMetadata({ title: "Proje", description: "Proje detayı.", path: "/projeler" });

  const project = await getPublicProjectBySlug(slug);
  if (!project) return pageMetadata({ title: "Proje", description: "Proje detayı.", path: "/projeler" });

  const img = project.imageUrls[0];
  const title = project.title;
  const description =
    project.description?.slice(0, 180) ||
    "Samet Alp Mimarlık proje detayı: mimari yaklaşım, galeri ve proje bilgileri.";

  return {
    ...pageMetadata({
      title,
      description,
      path: `/projeler/${project.slug}`,
    }),
    openGraph: {
      type: "website",
      locale: "tr_TR",
      title: `${title} | Samet Alp Mimarlık`,
      description,
      url: `/projeler/${project.slug}`,
      images: img ? [{ url: img }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Samet Alp Mimarlık`,
      description,
      images: img ? [img] : undefined,
    },
  };
}

export default async function ProjeDetayPage({ params }: PageProps) {
  const { id } = await params;
  const slug = String(id ?? "").trim().toLowerCase();
  if (!slug) notFound();

  const project = await getPublicProjectBySlug(slug);
  if (!project) notFound();

  return (
    <>
      <script
        key="jsonld-breadcrumb"
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Ana Sayfa", path: "/" },
            { name: "Projeler", path: "/projeler" },
            { name: project.title, path: `/projeler/${project.slug}` },
          ]),
        )}
      />
      <script
        key="jsonld-project"
        {...jsonLdScriptProps(
          projectJsonLd({
            name: project.title,
            description: project.description,
            path: `/projeler/${project.slug}`,
            imageUrls: project.imageUrls,
            category: project.category,
            status: project.status,
            location: project.location,
            year: project.year,
            areaM2: project.areaM2,
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

