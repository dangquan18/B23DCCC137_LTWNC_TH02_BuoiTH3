import type { Metadata } from "next";
import Link from "next/link";
import { Providers } from "@/components/Providers";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Không tìm thấy trang",
  robots: { index: false },
};

/** Trang 404 của dự án: dùng cho URL không tồn tại và mọi lời gọi notFound(). */
export default function NotFound() {
  return (
    <Providers>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-16">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-7xl font-bold text-brand-600">404</p>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Không tìm thấy nội dung</h1>
          <p className="mt-2 text-slate-600">
            Deadline hoặc trang bạn tìm không tồn tại, có thể đã bị lớp trưởng xoá hoặc đường dẫn bị sai.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/deadlines" className="btn-primary">
              Xem tất cả deadline
            </Link>
            <Link href="/" className="btn-secondary">
              Trang chủ
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </Providers>
  );
}
