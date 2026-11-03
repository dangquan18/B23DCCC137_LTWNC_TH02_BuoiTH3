import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import type { Provider } from "next-auth/providers";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { findUserByEmail } from "@/lib/db";
import { loginSchema } from "@/lib/validation";

// Hash giả (bcrypt hợp lệ) để so sánh khi email không tồn tại.
const DUMMY_HASH = "$2b$10$G81t4QE2me6k4JI5QHWy1unzJ.oqTV6Ao.V8.xtJSs1Av50WwXT0S";

class InvalidLoginError extends CredentialsSignin {
  code = "invalid_credentials";
}

export const githubEnabled = Boolean(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET);

const providers: Provider[] = [
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Mật khẩu", type: "password" },
    },
    async authorize(raw) {
      // Kiểm tra hợp lệ đầu vào trước khi đụng tới dữ liệu.
      const parsed = loginSchema.safeParse(raw);
      if (!parsed.success) throw new InvalidLoginError();

      const user = await findUserByEmail(parsed.data.email);
      // Luôn chạy bcrypt.compare để thời gian phản hồi không lộ email có tồn tại hay không.
      const hash = user?.passwordHash ?? DUMMY_HASH;
      const ok = await bcrypt.compare(parsed.data.password, hash);
      if (!user || !ok) throw new InvalidLoginError();

      return { id: user.id, name: user.name, email: user.email, role: user.role };
    },
  }),
];

// Điểm cộng: GitHub OAuth (chỉ bật khi có biến môi trường).
if (githubEnabled) {
  providers.push(
    GitHub({
      profile(profile) {
        return {
          id: String(profile.id),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
          role: "user",
        };
      },
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
  logger: {
    // Sai mật khẩu là tình huống bình thường, không cần in stack trace ra log server.
    error(error) {
      if (error instanceof CredentialsSignin) return;
      console.error("[auth]", error);
    },
  },
});
