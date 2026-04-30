import "server-only";

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db/prisma";

export type PublicService = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  heroImageUrl: string | null;
  scope: string[];
  process: Array<{ title: string; description: string }>;
  faq: Array<{ question: string; answer: string }>;
  updatedAt: Date;
};

function safeParseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function toPublicService(row: {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  heroImageUrl: string | null;
  scope: string | null;
  process: string | null;
  faq: string | null;
  updatedAt: Date;
}): PublicService {
  const scope = safeParseJson<string[]>(row.scope, []).filter((x) => typeof x === "string");
  const processRaw = safeParseJson<Array<Record<string, unknown>>>(row.process, []);
  const process = processRaw
    .map((x) => ({
      title: String(x.title ?? "").trim(),
      description: String(x.description ?? "").trim(),
    }))
    .filter((x) => x.title.length > 0 || x.description.length > 0);

  const faqRaw = safeParseJson<Array<Record<string, unknown>>>(row.faq, []);
  const faq = faqRaw
    .map((x) => ({
      question: String(
        (typeof (x as Record<string, unknown>).question === "string" && (x as Record<string, unknown>).question) ||
          (typeof (x as Record<string, unknown>).q === "string" && (x as Record<string, unknown>).q) ||
          "",
      ).trim(),
      answer: String(
        (typeof (x as Record<string, unknown>).answer === "string" && (x as Record<string, unknown>).answer) ||
          (typeof (x as Record<string, unknown>).a === "string" && (x as Record<string, unknown>).a) ||
          "",
      ).trim(),
    }))
    .filter((x) => x.question.length > 0 || x.answer.length > 0);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.shortDescription,
    heroImageUrl: row.heroImageUrl,
    scope,
    process,
    faq,
    updatedAt: row.updatedAt,
  };
}

export const getPublicServices = unstable_cache(
  async () => {
    const rows = await prisma.service.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        shortDescription: true,
        heroImageUrl: true,
        scope: true,
        process: true,
        faq: true,
        updatedAt: true,
      },
    });
    return rows.map(toPublicService);
  },
  ["public-services:v1"],
  { revalidate: 60, tags: ["public-services"] },
);

export const getPublicServiceBySlug = (slug: string) =>
  unstable_cache(
    async () => {
      const row = await prisma.service.findFirst({
        where: { published: true, slug },
        select: {
          id: true,
          slug: true,
          title: true,
          shortDescription: true,
          heroImageUrl: true,
          scope: true,
          process: true,
          faq: true,
          updatedAt: true,
        },
      });
      return row ? toPublicService(row) : null;
    },
    [`public-service:${slug}:v1`],
    { revalidate: 60, tags: ["public-services", `public-service:${slug}`] },
  )();

