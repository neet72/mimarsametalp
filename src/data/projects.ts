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
  description: string;
  gallery: string[];
};

/** Her kategoride en az bir kayıt; toplam 8 proje. */
export const PROJECTS: Project[] = [
  {
    id: 1,
    title: "Güneylı Konut Salonu",
    category: "İç Mimarlık & Dekorasyon",
    imageUrl: "/images/hero-1.webp",
    description:
      "Doğal ışık ve sıcak malzeme paletiyle salon kurgusu; ölçüye özel mobilya ve aydınlatma katmanlarıyla dengeli bir atmosfer.",
    gallery: ["/images/hero-1.webp", "/images/hero-2.webp", "/images/hero-3.webp", "/images/hero-4.webp"],
  },
  {
    id: 2,
    title: "Çukurova Villa",
    category: "Anahtar Teslim Proje",
    imageUrl: "/images/hero-2.webp",
    description:
      "Kütle oranları, peyzajla süreklilik ve iç-dış ilişki üzerine kurulu villa tasarımı; uygulama süreciyle birlikte anahtar teslim.",
    gallery: ["/images/hero-2.webp", "/images/hero-5.webp", "/images/hero-6.webp", "/images/hero-7.webp"],
  },
  {
    id: 3,
    title: "Rezidans İnşaat Denetimi",
    category: "Mimari Kontrolörlük",
    imageUrl: "/images/hero-3.webp",
    description:
      "Şantiye koordinasyonu, detay kontrolü ve kalite yönetimiyle rezidans uygulamasında süreç doğrulama ve saha denetimi.",
    gallery: ["/images/hero-3.webp", "/images/hero-4.webp", "/images/hero-1.webp", "/images/hero-8.webp"],
  },
  {
    id: 4,
    title: "Kentsel Villa Ruhsat Paketi",
    category: "Mimari Tasarım & Ruhsat Projesi",
    imageUrl: "/images/hero-4.webp",
    description:
      "Ruhsat seti, mimari konsept ve uygulama detaylarını bir arada ele alan; mevzuatla uyumlu, net ve okunaklı proje paketi.",
    gallery: ["/images/hero-4.webp", "/images/hero-3.webp", "/images/hero-2.webp", "/images/hero-5.webp"],
  },
  {
    id: 5,
    title: "Ofis Kulesi Danışmanlık",
    category: "Mimari Danışmanlık",
    imageUrl: "/images/hero-5.webp",
    description:
      "Program, sirkülasyon ve cephe stratejilerinde karar desteği; maliyet/performans dengesiyle konseptten uygulamaya danışmanlık.",
    gallery: ["/images/hero-5.webp", "/images/hero-6.webp", "/images/hero-7.webp", "/images/hero-2.webp"],
  },
  {
    id: 6,
    title: "Tarihi Konak Yenileme",
    category: "Yenileme & Tadilat",
    imageUrl: "/images/hero-6.webp",
    description:
      "Mevcut dokuyu koruyan müdahaleler, malzeme iyileştirmeleri ve yeni kullanım senaryolarıyla tarihi konak dönüşümü.",
    gallery: ["/images/hero-6.webp", "/images/hero-1.webp", "/images/hero-4.webp", "/images/hero-8.webp"],
  },
  {
    id: 7,
    title: "Penthouse İç Mekân",
    category: "İç Mimarlık & Dekorasyon",
    imageUrl: "/images/hero-7.webp",
    description:
      "Panoramik manzara aksını bozmayan, minimal çizgide penthouse iç mekân; depolama, mobilya ve ışık katmanlarıyla tamamlandı.",
    gallery: ["/images/hero-7.webp", "/images/hero-2.webp", "/images/hero-5.webp", "/images/hero-3.webp"],
  },
  {
    id: 8,
    title: "Bahçeli Konut Anahtar Teslim",
    category: "Anahtar Teslim Proje",
    imageUrl: "/images/hero-8.webp",
    description:
      "Bahçe ile bütünleşen yaşam kurgusu; iç mekân detayları ve sahada uygulama koordinasyonuyla baştan sona anahtar teslim çözüm.",
    gallery: ["/images/hero-8.webp", "/images/hero-6.webp", "/images/hero-4.webp", "/images/hero-1.webp"],
  },
];
