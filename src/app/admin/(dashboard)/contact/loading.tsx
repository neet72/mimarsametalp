export default function AdminSectionLoading() {
  return (
    <div className="space-y-4 py-6" aria-busy="true" aria-label="Yükleniyor">
      <div className="h-7 w-48 animate-pulse rounded-lg bg-zinc-800/80" />
      <div className="h-4 w-72 max-w-full animate-pulse rounded bg-zinc-800/50" />
      <div className="mt-6 h-36 animate-pulse rounded-xl border border-zinc-800 bg-zinc-950/40" />
    </div>
  );
}
