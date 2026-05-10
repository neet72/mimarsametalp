"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Database, Sparkles } from "lucide-react";
import { syncMissingDefaultServicesFromContent } from "@/actions/admin/services";
import { useAdminToast } from "@/components/admin/ui/toast";

export function SyncDefaultServicesPanel({
  missingCountEstimate,
}: {
  /** Panelde kaç slug için henüz DB kaydı yok (yaklaşık) */
  missingCountEstimate?: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [last, setLast] = useState<{ created: number; skipped: number } | null>(null);
  const toast = useAdminToast();

  return (
    <div className="rounded-xl border border-[rgb(166,124,82)]/30 bg-[rgb(166,124,82)]/[0.07] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[rgb(200,170,130)]">
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="font-display text-sm font-semibold text-zinc-100">Sitedeki hazır örnekleri panele al</p>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-500">
              Ana sayfa ve hizmetler sayfasında gördüğünüz kartlar kod içinde tanımlıdır. Bu düğmeye basınca aynı içerik
              (metinler ve başlıklar) veritabanına <span className="text-zinc-400">kopyalanır</span>; böylece buradan
              yayın, sıra ve görseli yönetebilirsiniz. Zaten kaydı olanlar <strong className="font-medium text-zinc-400">elle
              değiştirilmez</strong>.
            </p>
            {typeof missingCountEstimate === "number" && missingCountEstimate > 0 ? (
              <p className="mt-2 text-xs text-zinc-600">
                Tahmini eksik kayıt: <span className="tabular-nums text-zinc-400">{missingCountEstimate}</span>
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setLast(null);
              startTransition(async () => {
                const r = await syncMissingDefaultServicesFromContent();
                if (!r.ok) {
                  toast.error({ title: "İçe aktarma başarısız", description: r.error });
                  return;
                }
                const d = r.data;
                if (d) {
                  setLast(d);
                  toast.success({
                    title: "Tamam",
                    description:
                      d.created > 0
                        ? `${d.created} yeni kayıt eklendi. ${d.skipped} tanesi zaten vardı.`
                        : `Yeni eklenen yok; ${d.skipped} kayıt zaten panelde.`,
                  });
                }
                router.refresh();
              });
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[rgb(166,124,82)] px-4 py-2.5 text-sm font-semibold text-zinc-950 disabled:opacity-60"
          >
            <Database className="h-4 w-4" aria-hidden />
            {pending ? "Aktarılıyor…" : "Eksikleri veritabanına ekle"}
          </button>
          {last ? (
            <p className="text-center text-xs text-zinc-600 sm:text-right">
              Son işlem: +{last.created} / atlanan {last.skipped}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
