import { requireClient } from "@/actions/client/guard";
import { listTransactionsForUser } from "@/lib/portal/queries";
import {
  computeProjectBalance,
  formatTry,
  transactionTypeTr,
} from "@/lib/portal/finance";

export default async function PanelBalancePage() {
  const { client } = await requireClient();
  const rows = await listTransactionsForUser(client.id);

  const byProject = new Map<
    string,
    {
      title: string;
      items: typeof rows;
      balance: number;
    }
  >();

  for (const row of rows) {
    const cur = byProject.get(row.projectId) ?? {
      title: row.project.title,
      items: [],
      balance: 0,
    };
    cur.items.push(row);
    byProject.set(row.projectId, cur);
  }

  for (const [, group] of byProject) {
    group.balance = computeProjectBalance(group.items);
  }

  const overall = computeProjectBalance(rows);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-primary">
          Bakiye / Ekstre
        </h1>
        <p className="mt-2 text-muted">
          Proje cari hareketleriniz. Bakiye = ödemeler − (proje bedeli + diğer).
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface/80 px-5 py-5 sm:px-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
          Güncel bakiye
        </p>
        <p
          className={
            overall < 0
              ? "mt-1 font-display text-3xl font-semibold tracking-tight text-red-700"
              : overall > 0
                ? "mt-1 font-display text-3xl font-semibold tracking-tight text-emerald-700"
                : "mt-1 font-display text-3xl font-semibold tracking-tight text-primary"
          }
        >
          {formatTry(overall)}
        </p>
        <p className="mt-2 text-xs text-muted">
          Negatif tutar kalan borç; pozitif tutar fazla ödeme / alacak anlamına gelir.
        </p>
      </div>

      {byProject.size === 0 ? (
        <div className="rounded-2xl border border-border bg-surface/80 px-6 py-14 text-center">
          <p className="font-display text-xl font-semibold text-primary">Henüz hareket yok</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            Ofis proje bedeli veya ödeme kaydı eklediğinde burada listelenir.
          </p>
        </div>
      ) : (
        <ul className="space-y-8">
          {[...byProject.entries()].map(([projectId, group]) => (
            <li key={projectId} className="space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <h2 className="font-display text-lg font-semibold text-primary">{group.title}</h2>
                <p
                  className={
                    group.balance < 0
                      ? "text-sm font-semibold text-red-700"
                      : group.balance > 0
                        ? "text-sm font-semibold text-emerald-700"
                        : "text-sm font-semibold text-primary"
                  }
                >
                  {formatTry(group.balance)}
                </p>
              </div>
              <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface/80">
                {group.items.map((row) => {
                  const amount = Number(row.amount.toString());
                  const isPayment = row.type === "PAYMENT";
                  return (
                    <li key={row.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3.5">
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wider text-accent">
                          {transactionTypeTr(row.type)}
                        </p>
                        <p className="mt-0.5 text-sm text-primary">
                          {row.description.trim() || "—"}
                        </p>
                        <time className="mt-1 block text-xs text-muted" dateTime={row.eventDate.toISOString()}>
                          {row.eventDate.toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </time>
                      </div>
                      <p
                        className={
                          isPayment
                            ? "shrink-0 font-semibold text-emerald-700"
                            : "shrink-0 font-semibold text-red-700"
                        }
                      >
                        {isPayment ? "+" : "−"}
                        {formatTry(amount)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
