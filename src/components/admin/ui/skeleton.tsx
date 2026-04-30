import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-gradient-to-r from-zinc-900 via-zinc-800/70 to-zinc-900",
        className,
      )}
    />
  );
}

