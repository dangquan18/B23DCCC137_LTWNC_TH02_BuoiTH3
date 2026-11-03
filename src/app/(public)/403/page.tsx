import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Không có quyền truy cập",
  robots: { index: false, follow: false },
};

export default function ForbiddenPage() {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <p className="text-7xl font-bold text-rose-600">403</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Bạn không có quyền truy cập trang này</h1>
      <p className="mt-2 text-slate-600">
        Trang quản trị chỉ dành cho lớp trưởng. Nếu bạn cho rằng đây là nhầm lẫn, hãy đăng nhập bằng tài khoản
        khác.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/dashboard" className="btn-primary">
          Về Dashboard
        </Link>
        <Link href="/" className="btn-secondary">
          Trang chủ
        </Link>
      </div>
    </div>
  );
}
