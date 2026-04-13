export function normalizeEmail(value: string | null | undefined): string {
  return String(value ?? "").trim().toLowerCase();
}

export function getAdminEmailFromEnv(): string {
  // Edge uyumluluk: tırnak temizleme + lower/trim
  const raw = String(process.env.ADMIN_EMAIL ?? "").trim();
  const unquoted =
    (raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))
      ? raw.slice(1, -1)
      : raw;
  return normalizeEmail(unquoted);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  const adminEmail = getAdminEmailFromEnv();
  if (!adminEmail) return false;
  return normalizeEmail(email) === adminEmail;
}

