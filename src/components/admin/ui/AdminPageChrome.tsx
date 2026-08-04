import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Admin form input — mobilde 44px dokunma, focus ring tutarlı */
export const adminFieldClass =
  "h-11 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none transition-shadow placeholder:text-zinc-600 focus-visible:border-[rgb(166,124,82)]/50 focus-visible:ring-2 focus-visible:ring-[rgb(166,124,82)]/30";

export const adminTextareaClass =
  "w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none transition-shadow placeholder:text-zinc-600 focus-visible:border-[rgb(166,124,82)]/50 focus-visible:ring-2 focus-visible:ring-[rgb(166,124,82)]/30";

export const adminLabelClass = "mb-1.5 block text-xs font-medium text-zinc-500";

export const adminSectionClass =
  "space-y-4 rounded-2xl border border-zinc-800/90 bg-zinc-950/50 p-4 shadow-[0_1px_0_rgb(255_255_255_/_0.03)] sm:p-5 lg:p-6";

export const adminIconBtnClass =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 transition-colors hover:border-zinc-600 hover:bg-zinc-900 hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(166,124,82)]/40 disabled:opacity-40";

export const adminBtnAccentClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[rgb(166,124,82)] px-4 text-sm font-semibold text-zinc-950 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(166,124,82)]/40 disabled:opacity-50";

export const adminBtnSecondaryClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/50 px-4 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(166,124,82)]/40 disabled:opacity-50";

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-500">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function AdminSectionCard({
  id,
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn(adminSectionClass, "scroll-mt-24", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgb(166,124,82)]">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="font-display text-base font-semibold tracking-tight text-zinc-100 sm:text-lg">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-zinc-500 sm:text-sm">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function AdminEmptyState({
  title,
  hint,
  actionHref,
  actionLabel,
}: {
  title: string;
  hint?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/30 px-4 py-12 text-center sm:px-6 sm:py-14">
      <p className="text-sm font-medium text-zinc-300">{title}</p>
      {hint ? <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">{hint}</p> : null}
      {actionHref && actionLabel ? (
        <Link href={actionHref} className={cn(adminBtnAccentClass, "mt-5")}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function AdminPrimaryButton({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cn(adminBtnAccentClass, className)}>
      {children}
    </Link>
  );
}

export function AdminStatusPill({
  tone,
  children,
}: {
  tone: "neutral" | "accent" | "danger" | "ok";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
        tone === "neutral" && "border-white/10 bg-white/5 text-zinc-400",
        tone === "accent" &&
          "border-[rgb(166,124,82)]/30 bg-[rgb(166,124,82)]/10 text-[rgb(200,170,130)]",
        tone === "danger" && "border-red-500/25 bg-red-500/10 text-red-300",
        tone === "ok" && "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
      )}
    >
      {children}
    </span>
  );
}
