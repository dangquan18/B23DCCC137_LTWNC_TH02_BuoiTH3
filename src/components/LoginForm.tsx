"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { loginSchema } from "@/lib/validation";

type FieldErrors = Partial<Record<"email" | "password", string[]>>;

export function LoginForm({ callbackUrl, githubEnabled }: { callbackUrl: string; githubEnabled: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = loginSchema.safeParse({ email: form.get("email"), password: form.get("password") });
    if (!parsed.success) {
      setFieldErrors(z.flattenError(parsed.error).fieldErrors);
      setError(null);
      return;
    }
    setFieldErrors({});
    setError(null);

    startTransition(async () => {
      const res = await signIn("credentials", { ...parsed.data, redirect: false });
      if (!res || res.error) {
        setError("Email hoặc mật khẩu không đúng.");
        return;
      }
      // Tải lại toàn trang để mọi layout (kể cả trang tĩnh) nhận session mới.
      window.location.assign(callbackUrl);
    });
  }

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="input"
            placeholder="email@ptit.edu.vn"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
          />
          {fieldErrors.email && (
            <p id="email-error" className="mt-1 text-xs text-rose-700">
              {fieldErrors.email[0]}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="password" className="label">
            Mật khẩu
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="input"
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
          />
          {fieldErrors.password && (
            <p id="password-error" className="mt-1 text-xs text-rose-700">
              {fieldErrors.password[0]}
            </p>
          )}
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {error}
          </p>
        )}

        <button type="submit" className="btn-primary w-full py-2.5" disabled={pending}>
          {pending ? "Đang đăng nhập…" : "Đăng nhập"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-slate-600">
        <span className="h-px flex-1 bg-slate-200" /> hoặc <span className="h-px flex-1 bg-slate-200" />
      </div>
      <button
        type="button"
        disabled={!githubEnabled}
        aria-describedby={githubEnabled ? undefined : "github-hint"}
        className="btn w-full bg-slate-900 py-2.5 text-white hover:bg-slate-700"
        onClick={() => signIn("github", { redirectTo: callbackUrl })}
      >
        <svg aria-hidden viewBox="0 0 16 16" className="size-4 fill-current">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
        Đăng nhập bằng GitHub
      </button>
      {!githubEnabled && (
        <p id="github-hint" className="text-xs text-slate-600">
          Chưa cấu hình GitHub OAuth. Điền <code>AUTH_GITHUB_ID</code> và <code>AUTH_GITHUB_SECRET</code> vào{" "}
          <code>.env.local</code> rồi chạy lại server (xem README).
        </p>
      )}
    </div>
  );
}
