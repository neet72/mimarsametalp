import type { ClientProjectStatus, ClientStageStatus } from "@prisma/client";

export const CLIENT_PROJECT_STATUS_TR: Record<ClientProjectStatus, string> = {
  PLANNING: "Planlama",
  PERMITTING: "Ruhsat",
  CONSTRUCTION: "İnşaat",
  INTERIOR: "İç mimari",
  COMPLETED: "Tamamlandı",
};

export const CLIENT_STAGE_STATUS_TR: Record<ClientStageStatus, string> = {
  PENDING: "Bekliyor",
  IN_PROGRESS: "Devam ediyor",
  DONE: "Bitti",
};

export function projectStatusTr(status: string): string {
  return CLIENT_PROJECT_STATUS_TR[status as ClientProjectStatus] ?? status;
}

export function stageStatusTr(status: string): string {
  return CLIENT_STAGE_STATUS_TR[status as ClientStageStatus] ?? status;
}

/** Panel form input ortak sınıfları */
export const panelFieldClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-primary outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

export const panelCardClass = "rounded-2xl border border-border bg-surface/80 p-6 sm:p-8 shadow-[0_1px_0_rgb(15_23_42_/_0.04)]";
