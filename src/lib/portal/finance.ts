import type { ClientTransactionType, Prisma } from "@prisma/client";

export type PortalTransactionLike = {
  type: ClientTransactionType;
  amount: Prisma.Decimal | number | string;
};

function toNumber(amount: Prisma.Decimal | number | string): number {
  if (typeof amount === "number") return amount;
  if (typeof amount === "string") return Number(amount);
  return Number(amount.toString());
}

/** Borç mu? PROJECT_FEE ve OTHER borç; PAYMENT alacak. */
export function isTransactionDebit(type: ClientTransactionType): boolean {
  return type !== "PAYMENT";
}

/**
 * Bakiye = toplam(ödemeler) − toplam(proje bedeli + diğer).
 * Negatif = müşteri borcu; pozitif = fazla ödeme / alacak.
 */
export function computeProjectBalance(rows: PortalTransactionLike[]): number {
  let payments = 0;
  let debts = 0;
  for (const row of rows) {
    const n = toNumber(row.amount);
    if (row.type === "PAYMENT") payments += n;
    else debts += n;
  }
  return payments - debts;
}

export function formatTry(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(amount);
}

export const CLIENT_TRANSACTION_TYPE_TR: Record<ClientTransactionType, string> = {
  PROJECT_FEE: "Proje bedeli",
  PAYMENT: "Ödeme",
  OTHER: "Diğer",
};

export function transactionTypeTr(type: string): string {
  return CLIENT_TRANSACTION_TYPE_TR[type as ClientTransactionType] ?? type;
}
