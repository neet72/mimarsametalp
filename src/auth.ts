import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import authConfig from "./auth.config";
import { rateLimit } from "@/lib/security/rate-limit";
import { logger } from "@/lib/observability/logger";
import { prisma } from "@/lib/db/prisma";

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
    logger.error({
      msg: "ADMIN_PASSWORD_HASH_B64 geçersiz (base64 veya bcrypt formatı).",
      scope: "auth.env",
    });
    return null;
  }

  const raw = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (!raw) {
    logger.error({
      msg: "ADMIN_PASSWORD_HASH_B64 veya ADMIN_PASSWORD_HASH tanımlı değil.",
      scope: "auth.env",
    });
    return null;
  }
  return stripEnvQuotes(raw);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET ?? authConfig.secret,
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: (() => {
    const secure = process.env.NODE_ENV === "production";
    const cookiePrefix = secure ? "__Secure-" : "";
    const hostPrefix = secure ? "__Host-" : "";
    return {
      sessionToken: {
        name: `${cookiePrefix}authjs.session-token`,
        options: {
          httpOnly: true,
          sameSite: "strict",
          path: "/",
          secure,
        },
      },
      csrfToken: {
        name: `${hostPrefix}authjs.csrf-token`,
        options: {
          httpOnly: true,
          sameSite: "strict",
          path: "/",
          secure,
        },
      },
      callbackUrl: {
        name: `${cookiePrefix}authjs.callback-url`,
        options: {
          httpOnly: true,
          sameSite: "strict",
          path: "/",
          secure,
        },
      },
    };
  })(),
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
            role: "admin" as const,
            mustChangePassword: false,
          };
        } catch (e) {
          logger.error({
            msg: "authorize failed",
            scope: "auth.authorize",
            error: e instanceof Error ? { name: e.name, message: e.message, stack: e.stack } : String(e),
          });
          return null;
        }
      },
    }),
    Credentials({
      id: "client-credentials",
      name: "Müşteri",
      credentials: {
        username: { label: "Kullanıcı adı", type: "text" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) return null;

          const username = String(credentials.username).trim().toLowerCase();
          const rl = rateLimit(`client-login:${username}`, 8, 10 * 60 * 1000);
          if (!rl.ok) return null;

          const client = await prisma.clientUser.findUnique({
            where: { username },
          });
          if (!client || !client.active) return null;

          const { compare } = await import("bcryptjs");
          const ok = await compare(String(credentials.password), client.passwordHash);
          if (!ok) return null;

          return {
            id: client.id,
            name: client.fullName,
            email: client.email ?? undefined,
            role: "client" as const,
            mustChangePassword: client.mustChangePassword,
          };
        } catch (e) {
          logger.error({
            msg: "client authorize failed",
            scope: "auth.authorize.client",
            error: e instanceof Error ? { name: e.name, message: e.message, stack: e.stack } : String(e),
          });
          return null;
        }
      },
    }),
  ],
});
