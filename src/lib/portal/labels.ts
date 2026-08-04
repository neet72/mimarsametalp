import type {
  ClientProjectCategory,
  ClientProjectStatus,
  ClientStageStatus,
} from "@prisma/client";

export const CLIENT_PROJECT_STATUS_TR: Record<ClientProjectStatus, string> = {
  PLANNING: "Planlama",
  PERMITTING: "Ruhsat",
  CONSTRUCTION: "İnşaat",
  INTERIOR: "İç mimari",
  COMPLETED: "Tamamlandı",
};

export const CLIENT_PROJECT_CATEGORY_TR: Record<ClientProjectCategory, string> = {
  BELEDIYE: "Belediye",
  MIMAR: "Mimar",
  DIGER: "Diğer Projeler",
  YAPI_DENETIM: "Yapı Denetim",
};

export const CLIENT_PROJECT_CATEGORY_OPTS: {
  value: ClientProjectCategory;
  label: string;
}[] = [
  { value: "BELEDIYE", label: CLIENT_PROJECT_CATEGORY_TR.BELEDIYE },
  { value: "MIMAR", label: CLIENT_PROJECT_CATEGORY_TR.MIMAR },
  { value: "DIGER", label: CLIENT_PROJECT_CATEGORY_TR.DIGER },
  { value: "YAPI_DENETIM", label: CLIENT_PROJECT_CATEGORY_TR.YAPI_DENETIM },
];

export const CLIENT_STAGE_STATUS_TR: Record<ClientStageStatus, string> = {
  PENDING: "Bekliyor",
  IN_PROGRESS: "Devam ediyor",
  DONE: "Bitti",
};

export function projectStatusTr(status: string): string {
  return CLIENT_PROJECT_STATUS_TR[status as ClientProjectStatus] ?? status;
}

export function projectCategoryTr(category: string): string {
  return CLIENT_PROJECT_CATEGORY_TR[category as ClientProjectCategory] ?? category;
}

export function stageStatusTr(status: string): string {
  return CLIENT_STAGE_STATUS_TR[status as ClientStageStatus] ?? status;
}

/** Başlangıç–bitiş arası tam gün (bitiş yoksa bugüne kadar). */
export function durationDays(start: Date, end: Date | null, now = new Date()): number {
  const endMs = (end ?? now).getTime();
  const startMs = start.getTime();
  const diff = Math.max(0, endMs - startMs);
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/** Panel form input ortak sınıfları */
export const panelFieldClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-primary outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

export const panelCardClass = "rounded-2xl border border-border bg-surface/80 p-6 sm:p-8 shadow-[0_1px_0_rgb(15_23_42_/_0.04)]";
