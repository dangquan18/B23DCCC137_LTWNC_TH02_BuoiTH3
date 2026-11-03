import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, githubEnabled } from "@/auth";
import { LoginForm } from "@/components/LoginForm";
import { safeCallbackUrl } from "@/lib/validation";

export const metadata: Metadata = {
  title: "Đăng nhập",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ callbackUrl?: string | string[] }> };

export default async function LoginPage({ searchParams }: Props) {
  const { callbackUrl: raw } = await searchParams;
  const callbackUrl = safeCallbackUrl(Array.isArray(raw) ? raw[0] : raw);

  const session = await auth();
  if (session?.user) redirect(callbackUrl);

  return (
    <div className="mx-auto max-w-md">
      <section className="card p-6 md:p-8">
        <h1 className="mb-1 text-2xl font-bold text-slate-900">Đăng nhập</h1>
        <p className="mb-6 text-sm text-slate-600">Đăng nhập để đánh dấu deadline đã hoàn thành.</p>
        <LoginForm callbackUrl={callbackUrl} githubEnabled={githubEnabled} />
        {callbackUrl !== "/dashboard" && (
          <p className="mt-5 text-sm text-slate-600">
            Sau khi đăng nhập bạn sẽ quay lại <code className="rounded bg-slate-100 px-1">{callbackUrl}</code>.
          </p>
        )}
      </section>

      <section className="card mt-4 space-y-3 bg-brand-50 p-5" aria-labelledby="demo-title">
        <h2 id="demo-title" className="font-semibold text-slate-900">
          Tài khoản demo
        </h2>
        <dl className="space-y-2 text-sm">
          <div className="rounded-lg bg-white p-3">
            <dt className="font-semibold text-rose-700">Lớp trưởng (admin)</dt>
            <dd className="font-mono text-slate-800">admin@ptit.edu.vn / admin123</dd>
          </div>
          <div className="rounded-lg bg-white p-3">
            <dt className="font-semibold text-brand-700">Sinh viên (user)</dt>
            <dd className="font-mono text-slate-800">sv@ptit.edu.vn / sv123456</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
