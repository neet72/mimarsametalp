import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

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
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-100">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-zinc-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
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
    <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/30 px-6 py-14 text-center">
      <p className="text-sm font-medium text-zinc-300">{title}</p>
      {hint ? <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">{hint}</p> : null}
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-5 inline-flex rounded-lg bg-[rgb(166,124,82)] px-4 py-2.5 text-sm font-semibold text-zinc-950"
        >
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
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-lg bg-[rgb(166,124,82)] px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-opacity hover:opacity-90",
        className,
      )}
    >
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
        tone === "accent" && "border-[rgb(166,124,82)]/30 bg-[rgb(166,124,82)]/10 text-[rgb(200,170,130)]",
        tone === "danger" && "border-red-500/25 bg-red-500/10 text-red-300",
        tone === "ok" && "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
      )}
    >
      {children}
    </span>
  );
}
