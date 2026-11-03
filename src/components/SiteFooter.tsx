import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {SITE_NAME} · Bài tập Lập trình Web (Buổi 7–8)
        </p>
        <nav aria-label="Liên kết cuối trang" className="flex gap-4">
          <Link href="/deadlines" className="hover:text-slate-900">
            Tất cả deadline
          </Link>
          <Link href="/sitemap.xml" className="hover:text-slate-900" prefetch={false}>
            Sitemap
          </Link>
        </nav>
      </div>
    </footer>
  );
}
