import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import { UserMenu } from "./UserMenu";

/** Server Component: không đọc cookie → không làm trang công khai mất tính tĩnh. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Link href="/" aria-label={`${SITE_NAME} — trang chủ`} className="flex items-center gap-2 font-bold text-slate-900">
            <span
              aria-hidden
              className="grid size-8 place-items-center rounded-lg bg-brand-600 text-sm text-white"
            >
              DH
            </span>
            <span className="hidden sm:inline">{SITE_NAME}</span>
          </Link>
          <nav aria-label="Điều hướng chính" className="flex items-center gap-1 text-sm font-medium">
            <Link href="/deadlines" className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100">
              Deadline
            </Link>
            <Link href="/#mon-hoc" className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100">
              Môn học
            </Link>
          </nav>
        </div>
        <UserMenu />
      </div>
    </header>
  );
}
