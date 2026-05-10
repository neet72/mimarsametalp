import type { PublicProject } from "@/lib/public/projects";

function pick(en: string | null | undefined, tr: string | null | undefined): string | null {
  const e = en != null && String(en).trim() !== "" ? String(en).trim() : null;
  if (e) return e;
  const t = tr != null && String(tr).trim() !== "" ? String(tr).trim() : null;
  return t;
}

/** Public /en rotalarında gösterilecek alanlar; İngilizce boşsa Türkçeye düşer. */
export function pickProjectForLocale(project: PublicProject, locale: "tr" | "en") {
  if (locale === "tr") {
    return {
      title: project.title,
      category: project.category,
      description: project.description,
      status: project.status,
      location: project.location,
      year: project.year,
      areaM2: project.areaM2,
      imageUrls: project.imageUrls,
      slug: project.slug,
    };
  }
  return {
    title: pick(project.titleEn, project.title) ?? project.title,
    category: pick(project.categoryEn, project.category),
    description: pick(project.descriptionEn, project.description),
    status: pick(project.statusEn, project.status),
    location: pick(project.locationEn, project.location),
    year: project.year,
    areaM2: project.areaM2,
    imageUrls: project.imageUrls,
    slug: project.slug,
  };
}
