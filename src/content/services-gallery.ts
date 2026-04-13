/**
 * Hizmetler galerisi — başlıklar birebir sabit; görseller placeholder.
 */
export type ServiceGalleryItem = {
  slug: string;
  title: string;
  imageUrl: string;
};

export const SERVICES_GALLERY: ServiceGalleryItem[] = [
  {
    slug: "ic-mimarlik-dekorasyon",
    title: "İÇ MİMARLIK & DEKORASYON",
    imageUrl: "/images/hero-1.webp",
  },
  {
    slug: "anahtar-teslim-proje",
    title: "ANAHTAR TESLİM PROJE",
    imageUrl: "/images/hero-2.webp",
  },
  {
    slug: "mimari-kontrolorluk",
    title: "MİMARİ KONTROLÖRLÜK",
    imageUrl: "/images/hero-3.webp",
  },
  {
    slug: "mimari-tasarim-ruhsat-projesi",
    title: "MİMARİ TASARIM & RUHSAT PROJESİ",
    imageUrl: "/images/hero-4.webp",
  },
  {
    slug: "mimari-danismanlik",
    title: "MİMARİ DANIŞMANLIK",
    imageUrl: "/images/hero-5.webp",
  },
  {
    slug: "yenileme-tadilat",
    title: "YENİLEME & TADİLAT",
    imageUrl: "/images/hero-6.webp",
  },
];
