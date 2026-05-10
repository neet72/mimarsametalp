import { Skeleton } from "@/components/admin/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-950/60 px-4 py-3">
          <Skeleton className="h-4 w-16" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
        <div className="space-y-3 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-14 rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
