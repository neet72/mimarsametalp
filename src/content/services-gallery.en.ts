/**
 * Services gallery (EN)
 */
export type ServiceGalleryItem = {
  slug: string;
  title: string;
  imageUrl: string;
};

export const SERVICES_GALLERY: ServiceGalleryItem[] = [
  {
    slug: "ic-mimarlik-dekorasyon",
    title: "INTERIOR ARCHITECTURE & DECORATION",
    imageUrl: "/images/hero-1.webp",
  },
  {
    slug: "anahtar-teslim-proje",
    title: "TURNKEY PROJECT",
    imageUrl: "/images/hero-2.webp",
  },
  {
    slug: "mimari-kontrolorluk",
    title: "ARCHITECTURAL SUPERVISION",
    imageUrl: "/images/hero-3.webp",
  },
  {
    slug: "mimari-tasarim-ruhsat-projesi",
    title: "ARCHITECTURAL DESIGN & PERMIT PROJECT",
    imageUrl: "/images/hero-4.webp",
  },
  {
    slug: "mimari-danismanlik",
    title: "ARCHITECTURAL CONSULTING",
    imageUrl: "/images/hero-5.webp",
  },
  {
    slug: "yenileme-tadilat",
    title: "RENOVATION & REMODELING",
    imageUrl: "/images/hero-6.webp",
  },
];

