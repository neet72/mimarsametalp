"use client";

import Link from "next/link";
import { SyncDefaultServicesPanel } from "@/components/admin/SyncDefaultServicesPanel";

/**
 * Liste boşken: önce site örneklerini içe aktarma (görünür konumda).
 * Listeyken: sadece eksik katalog parçası varsa üstte hatırlatma.
 */
export function AdminServicesEmptyOrSync({
  listEmpty,
  missingCountEstimate,
}: {
  listEmpty: boolean;
  missingCountEstimate: number;
}) {
  if (listEmpty) {
    return (
      <div className="space-y-6">
        <SyncDefaultServicesPanel missingCountEstimate={missingCountEstimate} />
        <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-10 text-center">
          <p className="text-base text-zinc-300">
            Panelde satır görmek için veritabanında kayıt gerekir
          </p>
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-zinc-500">
            Sitedeki hizmet kartları şu an kodla geliyor; yukarıdaki turuncu kutudaki{" "}
            <span className="font-medium text-zinc-400">«Eksikleri veritabanına ekle»</span> ile aynı başlıklar ve
            içerikler panele kopyalanır. İşlem bir kez yeterli; sonra burada yayın ve sırayı yönetirsiniz.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/admin/services/new"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-600 px-5 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-900"
            >
              Sıfırdan yeni hizmet
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (missingCountEstimate > 0) {
    return <SyncDefaultServicesPanel missingCountEstimate={missingCountEstimate} />;
  }

  return null;
}
