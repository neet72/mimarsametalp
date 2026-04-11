export type ProjectCategoryName =
  | "İç Mimarlık & Dekorasyon"
  | "Anahtar Teslim Proje"
  | "Mimari Kontrolörlük"
  | "Mimari Tasarım & Ruhsat Projesi"
  | "Mimari Danışmanlık"
  | "Yenileme & Tadilat";

export type Project = {
  id: number;
  title: string;
  category: ProjectCategoryName;
  imageUrl: string;
};

/** Her kategoride en az bir kayıt; toplam 8 proje. */
export const PROJECTS: Project[] = [
  {
    id: 1,
    title: "Güneylı Konut Salonu",
    category: "İç Mimarlık & Dekorasyon",
    imageUrl: "/images/hero-1.webp",
  },
  {
    id: 2,
    title: "Çukurova Villa",
    category: "Anahtar Teslim Proje",
    imageUrl: "/images/hero-2.webp",
  },
  {
    id: 3,
    title: "Rezidans İnşaat Denetimi",
    category: "Mimari Kontrolörlük",
    imageUrl: "/images/hero-3.webp",
  },
  {
    id: 4,
    title: "Kentsel Villa Ruhsat Paketi",
    category: "Mimari Tasarım & Ruhsat Projesi",
    imageUrl: "/images/hero-4.webp",
  },
  {
    id: 5,
    title: "Ofis Kulesi Danışmanlık",
    category: "Mimari Danışmanlık",
    imageUrl: "/images/hero-5.webp",
  },
  {
    id: 6,
    title: "Tarihi Konak Yenileme",
    category: "Yenileme & Tadilat",
    imageUrl: "/images/hero-6.webp",
  },
  {
    id: 7,
    title: "Penthouse İç Mekân",
    category: "İç Mimarlık & Dekorasyon",
    imageUrl: "/images/hero-7.webp",
  },
  {
    id: 8,
    title: "Bahçeli Konut Anahtar Teslim",
    category: "Anahtar Teslim Proje",
    imageUrl: "/images/hero-8.webp",
  },
];
