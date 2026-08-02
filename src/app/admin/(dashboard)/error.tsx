"use client";

export default function AdminDashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-4 py-16 text-center">
      <p className="text-zinc-200">Bir hata oluştu.</p>
      <p className="text-sm text-zinc-500">Sayfayı yenileyin veya tekrar deneyin.</p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex min-h-11 items-center rounded-lg bg-[rgb(166,124,82)] px-4 text-sm font-semibold text-zinc-950"
      >
        Tekrar dene
      </button>
    </div>
  );
}
