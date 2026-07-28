import "server-only";

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db/prisma";

export type PublicService = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  heroImageUrl: string | null;
  titleEn: string | null;
  shortDescriptionEn: string | null;
  scope: string[];
  scopeEn: string[];
  process: Array<{ title: string; description: string }>;
  processEn: Array<{ title: string; description: string }>;
  faq: Array<{ question: string; answer: string }>;
  faqEn: Array<{ question: string; answer: string }>;
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

function parseFaqItems(raw: string | null): Array<{ question: string; answer: string }> {
  const faqRaw = safeParseJson<Array<Record<string, unknown>>>(raw, []);
  return faqRaw
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
}

function toPublicService(row: {
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
  updatedAt: Date;
}): PublicService {
  const scope = safeParseJson<string[]>(row.scope, []).filter((x) => typeof x === "string");
  const scopeEn = safeParseJson<string[]>(row.scopeEn, []).filter((x) => typeof x === "string");
  const processRaw = safeParseJson<Array<Record<string, unknown>>>(row.process, []);
  const process = processRaw
    .map((x) => ({
      title: String(x.title ?? "").trim(),
      description: String(x.description ?? "").trim(),
    }))
    .filter((x) => x.title.length > 0 || x.description.length > 0);

  const processEnRaw = safeParseJson<Array<Record<string, unknown>>>(row.processEn, []);
  const processEn = processEnRaw.map((x) => ({
    title: String(x.title ?? "").trim(),
    description: String(x.description ?? "").trim(),
  }));

  const faq = parseFaqItems(row.faq);
  const faqEnRaw = safeParseJson<Array<Record<string, unknown>>>(row.faqEn, []);
  const faqEn = faqEnRaw.map((x) => ({
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
  }));

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.shortDescription,
    heroImageUrl: row.heroImageUrl,
    titleEn: row.titleEn,
    shortDescriptionEn: row.shortDescriptionEn,
    scope,
    scopeEn,
    process,
    processEn,
    faq,
    faqEn,
    updatedAt: row.updatedAt,
  };
}

export const getPublicServices = unstable_cache(
  async () => {
    try {
      const rows = (await prisma.service.findMany({
        where: { published: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        select: {
          id: true,
          slug: true,
          title: true,
          shortDescription: true,
          heroImageUrl: true,
          titleEn: true,
          shortDescriptionEn: true,
          scope: true,
          scopeEn: true,
          process: true,
          processEn: true,
          faq: true,
          faqEn: true,
          updatedAt: true,
        },
      } as Parameters<typeof prisma.service.findMany>[0])) as Array<Parameters<typeof toPublicService>[0]>;
      return rows.map(toPublicService);
    } catch (error) {
      console.error(
        JSON.stringify({
          level: "error",
          msg: "getPublicServices failed",
          scope: "public.services",
          error: error instanceof Error ? { name: error.name, message: error.message } : String(error),
        }),
      );
      return [];
    }
  },
  ["public-services:v4"],
  { revalidate: 60, tags: ["public-services"] },
);

export const getPublicServiceBySlug = (slug: string) =>
  unstable_cache(
    async () => {
      try {
        const row = (await prisma.service.findFirst({
          where: { published: true, slug },
          select: {
            id: true,
            slug: true,
            title: true,
            shortDescription: true,
            heroImageUrl: true,
            titleEn: true,
            shortDescriptionEn: true,
            scope: true,
            scopeEn: true,
            process: true,
            processEn: true,
            faq: true,
            faqEn: true,
            updatedAt: true,
          },
        } as Parameters<typeof prisma.service.findFirst>[0])) as Parameters<typeof toPublicService>[0] | null;
        return row ? toPublicService(row) : null;
      } catch (error) {
        console.error(
          JSON.stringify({
            level: "error",
            msg: "getPublicServiceBySlug failed",
            scope: "public.services",
            slug,
            error: error instanceof Error ? { name: error.name, message: error.message } : String(error),
          }),
        );
        return null;
      }
    },
    [`public-service:${slug}:v4`],
    { revalidate: 60, tags: ["public-services", `public-service:${slug}`] },
  )();

