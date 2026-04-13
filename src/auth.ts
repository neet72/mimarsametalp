import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import authConfig from "./auth.config";
import { rateLimit } from "@/lib/security/rate-limit";

function stripEnvQuotes(value: string): string {
  const t = value.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1);
  }
  return t;
}

function normalizeAdminEmailEnv(): string {
  return stripEnvQuotes(process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
}

function resolveAdminPasswordHash(): string | null {
  const b64 = process.env.ADMIN_PASSWORD_HASH_B64?.trim();
  if (b64) {
    try {
      const decoded = Buffer.from(stripEnvQuotes(b64), "base64").toString("utf8");
      if (decoded.startsWith("$2a$") || decoded.startsWith("$2b$") || decoded.startsWith("$2y$")) {
        return decoded;
      }
    } catch {
      /* ignore */
    }
    console.error("[auth] ADMIN_PASSWORD_HASH_B64 geçersiz (base64 veya bcrypt formatı).");
    return null;
  }

  const raw = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (!raw) {
    console.error("[auth] ADMIN_PASSWORD_HASH_B64 veya ADMIN_PASSWORD_HASH tanımlı değil.");
    return null;
  }
  return stripEnvQuotes(raw);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET ?? authConfig.secret,
  providers: [
    Credentials({
      id: "credentials",
      name: "Yönetici",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null;

          const email = String(credentials.email).toLowerCase().trim();

          // Brute-force koruması (email bazlı) — 10 dakikada 8 deneme.
          const rl = rateLimit(`admin-login:${email}`, 8, 10 * 60 * 1000);
          if (!rl.ok) return null;

          const adminEmail = normalizeAdminEmailEnv();
          if (!adminEmail || email !== adminEmail) return null;

          const hash = resolveAdminPasswordHash();
          if (!hash) return null;

          const { compare } = await import("bcryptjs");
          const ok = await compare(String(credentials.password), hash);
          if (!ok) return null;

          return {
            id: "admin",
            name: "Yönetici",
            email: adminEmail,
          };
        } catch (e) {
          console.error("[auth] authorize:", e);
          return null;
        }
      },
    }),
  ],
});
