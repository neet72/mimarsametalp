"use client";

export default function PanelError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-4 py-16 text-center">
      <p className="text-primary">Bir hata oluştu.</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
      >
        Tekrar dene
      </button>
    </div>
  );
}
