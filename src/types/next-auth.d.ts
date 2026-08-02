import type { DefaultSession } from "next-auth";

export type AuthRole = "admin" | "client";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      isAdmin?: boolean;
      role?: AuthRole;
      mustChangePassword?: boolean;
    };
  }

  interface User {
    role?: AuthRole;
    mustChangePassword?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    email?: string | null;
    isAdmin?: boolean;
    role?: AuthRole;
    mustChangePassword?: boolean;
  }
}
