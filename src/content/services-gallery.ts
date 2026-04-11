/**
 * Hizmetler galerisi — başlıklar birebir sabit; görseller placeholder.
 */
export type ServiceGalleryItem = {
  title: string;
  imageUrl: string;
};

export const SERVICES_GALLERY: ServiceGalleryItem[] = [
  {
    title: "İÇ MİMARLIK & DEKORASYON",
    imageUrl: "/images/hero-1.webp",
  },
  {
    title: "ANAHTAR TESLİM PROJE",
    imageUrl: "/images/hero-2.webp",
  },
  {
    title: "MİMARİ KONTROLÖRLÜK",
    imageUrl: "/images/hero-3.webp",
  },
  {
    title: "MİMARİ TASARIM & RUHSAT PROJESİ",
    imageUrl: "/images/hero-4.webp",
  },
  {
    title: "MİMARİ DANIŞMANLIK",
    imageUrl: "/images/hero-5.webp",
  },
  {
    title: "YENİLEME & TADİLAT",
    imageUrl: "/images/hero-6.webp",
  },
];
