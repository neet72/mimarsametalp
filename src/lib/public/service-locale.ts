import type { PublicService } from "@/lib/public/services";

function pickStr(en: string | null | undefined, tr: string | null | undefined): string | null {
  const e = en != null && String(en).trim() !== "" ? String(en).trim() : null;
  if (e) return e;
  const t = tr != null && String(tr).trim() !== "" ? String(tr).trim() : null;
  return t;
}

function mergeStringLines(tr: string[], en: string[]): string[] {
  const len = Math.max(tr.length, en.length);
  const out: string[] = [];
  for (let i = 0; i < len; i++) {
    const line = (en[i]?.trim() || tr[i]?.trim() || "").trim();
    if (line) out.push(line);
  }
  return out;
}

function mergeProcess(
  tr: Array<{ title: string; description: string }>,
  en: Array<{ title: string; description: string }>,
): Array<{ title: string; description: string }> {
  const len = Math.max(tr.length, en.length);
  const out: Array<{ title: string; description: string }> = [];
  for (let i = 0; i < len; i++) {
    const title = (en[i]?.title?.trim() || tr[i]?.title?.trim() || "").trim();
    const description = (en[i]?.description?.trim() || tr[i]?.description?.trim() || "").trim();
    if (title || description) out.push({ title, description });
  }
  return out;
}

function mergeFaq(
  tr: Array<{ question: string; answer: string }>,
  en: Array<{ question: string; answer: string }>,
): Array<{ question: string; answer: string }> {
  const len = Math.max(tr.length, en.length);
  const out: Array<{ question: string; answer: string }> = [];
  for (let i = 0; i < len; i++) {
    const question = (en[i]?.question?.trim() || tr[i]?.question?.trim() || "").trim();
    const answer = (en[i]?.answer?.trim() || tr[i]?.answer?.trim() || "").trim();
    if (question || answer) out.push({ question, answer });
  }
  return out;
}

export function pickServiceForLocale(service: PublicService, locale: "tr" | "en") {
  if (locale === "tr") {
    return {
      title: service.title,
      shortDescription: service.shortDescription,
      scope: service.scope,
      process: service.process,
      faq: service.faq,
    };
  }
  return {
    title: pickStr(service.titleEn, service.title) ?? service.title,
    shortDescription: pickStr(service.shortDescriptionEn, service.shortDescription),
    scope: mergeStringLines(service.scope, service.scopeEn),
    process: mergeProcess(service.process, service.processEn),
    faq: mergeFaq(service.faq, service.faqEn),
  };
}
