import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { isAdminEmail } from "@/lib/security/admin";

/**
 * Edge / middleware — bcrypt yok. Gerçek doğrulama `auth.ts` içinde aynı provider id ile.
 */
export default {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
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
      authorize: async () => null,
    }),
    Credentials({
      id: "client-credentials",
      name: "Müşteri",
      credentials: {
        username: { label: "Kullanıcı adı", type: "text" },
        password: { label: "Şifre", type: "password" },
      },
      authorize: async () => null,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
  },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.role =
          user.role === "admin" || user.role === "client"
            ? user.role
            : isAdminEmail(user.email)
              ? "admin"
              : "client";
        token.isAdmin = token.role === "admin";
        token.mustChangePassword = Boolean(user.mustChangePassword);
      }
      // Panel şifre değişince session.update ile bayrağı temizle
      if (trigger === "update" && session && typeof session === "object") {
        const s = session as { mustChangePassword?: boolean };
        if (typeof s.mustChangePassword === "boolean") {
          token.mustChangePassword = s.mustChangePassword;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "admin";
        session.user.email = token.email as string;
        session.user.role =
          token.role === "admin" || token.role === "client"
            ? token.role
            : token.isAdmin
              ? "admin"
              : "client";
        session.user.isAdmin = Boolean(token.isAdmin) || session.user.role === "admin";
        session.user.mustChangePassword = Boolean(token.mustChangePassword);
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
