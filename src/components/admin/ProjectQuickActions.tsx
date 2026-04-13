"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { setProjectPublished, setProjectSortOrder } from "@/actions/admin/projects";

export function ProjectPublishedToggle({ id, published }: { id: string; published: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await setProjectPublished(id, !published);
          router.refresh();
        });
      }}
      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${
        published
          ? "border-emerald-900/40 bg-emerald-950/25 text-emerald-200 hover:bg-emerald-950/35"
          : "border-zinc-700 bg-zinc-950/40 text-zinc-300 hover:bg-zinc-900"
      }`}
    >
      {published ? "Yayında" : "Taslak"}
    </button>
  );
}

export function ProjectSortOrderInput({ id, value }: { id: string; value: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [v, setV] = useState(String(value ?? 0));

  useEffect(() => setV(String(value ?? 0)), [value]);

  return (
    <div className="flex items-center justify-end gap-2">
      <input
        type="number"
        value={v}
        onChange={(e) => setV(e.target.value)}
        className="w-20 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-100"
      />
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          const n = Number(v);
          if (!Number.isFinite(n)) return;
          startTransition(async () => {
            await setProjectSortOrder(id, n);
            router.refresh();
          });
        }}
        className="rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-xs font-semibold text-zinc-200 hover:bg-zinc-900 disabled:opacity-50"
      >
        {pending ? "…" : "Kaydet"}
      </button>
    </div>
  );
}

