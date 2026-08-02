export default function PanelLoading() {
  return (
    <div className="mx-auto max-w-xl space-y-4 py-8" aria-busy="true" aria-label="Yükleniyor">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-border/60" />
      <div className="h-4 w-64 max-w-full animate-pulse rounded bg-border/40" />
      <div className="mt-6 h-40 animate-pulse rounded-2xl border border-border bg-surface/60" />
      <div className="h-40 animate-pulse rounded-2xl border border-border bg-surface/60" />
    </div>
  );
}
