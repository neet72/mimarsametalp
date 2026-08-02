import "server-only";

import crypto from "node:crypto";

/** Okunabilir geçici şifre (kopyala-yapıştır için). */
export function generateTempPassword(length = 12): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[bytes[i]! % alphabet.length];
  }
  return out;
}

export async function hashPassword(plain: string): Promise<string> {
  const { hash } = await import("bcryptjs");
  return hash(plain, 12);
}
