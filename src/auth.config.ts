import type { NextAuthConfig } from "next-auth";
import { isUserRole } from "@/lib/permissions";

/**
 * Cấu hình dùng chung, an toàn cho Edge runtime (Middleware):
 * không import fs, bcrypt hay provider Credentials ở đây.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user, account }) {
      // `user` chỉ có ở lần đăng nhập đầu tiên → copy id, role vào JWT.
      if (user) {
        token.id =
          account?.provider === "github"
            ? `github-${account.providerAccountId}`
            : (user.id ?? token.sub ?? "");
        token.role = isUserRole(user.role) ? user.role : "user";
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      // Không tin dữ liệu trong token một cách mù quáng: role lạ → hạ về "user".
      session.user.role = isUserRole(token.role) ? token.role : "user";
      return session;
    },
  },
} satisfies NextAuthConfig;
