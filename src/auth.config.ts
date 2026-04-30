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
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
  },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.isAdmin = isAdminEmail(user.email);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "admin";
        session.user.email = token.email as string;
        session.user.isAdmin = Boolean(token.isAdmin);
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
