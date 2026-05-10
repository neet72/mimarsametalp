/** `prisma generate` sonrası @prisma/client ile uyumlu — şema: Service modeli */
export type ServiceDbRow = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  heroImageUrl: string | null;
  titleEn: string | null;
  shortDescriptionEn: string | null;
  scope: string | null;
  scopeEn: string | null;
  process: string | null;
  processEn: string | null;
  faq: string | null;
  faqEn: string | null;
  published: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};
