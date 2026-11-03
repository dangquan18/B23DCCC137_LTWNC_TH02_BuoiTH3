"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { can, ROLE_LABELS } from "@/lib/permissions";

/** Hiển thị tên, vai trò và nút Đăng nhập / Đăng xuất. */
export function UserMenu() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "loading") {
    return <div aria-hidden className="h-9 w-40 animate-pulse rounded-lg bg-slate-100" />;
  }

  if (!session?.user) {
    const callbackUrl = pathname && pathname !== "/login" ? pathname : "/dashboard";
    return (
      <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="btn-primary">
        Đăng nhập
      </Link>
    );
  }

  const { name, email, role } = session.user;

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <nav aria-label="Tài khoản" className="hidden items-center gap-1 text-sm font-medium md:flex">
        {can(role, "deadline:complete") && (
          <Link href="/dashboard" className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100">
            Dashboard
          </Link>
        )}
        {can(role, "deadline:create") && (
          <Link href="/admin" className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100">
            Quản trị
          </Link>
        )}
      </nav>
      <div className="text-right leading-tight">
        <p className="max-w-36 truncate text-sm font-semibold text-slate-900">{name ?? email}</p>
        <p
          className={`text-xs font-medium ${role === "admin" ? "text-rose-700" : "text-brand-700"}`}
          data-testid="user-role"
        >
          {ROLE_LABELS[role]} · {role}
        </p>
      </div>
      <button type="button" className="btn-secondary" onClick={() => signOut({ redirectTo: "/" })}>
        Đăng xuất
      </button>
    </div>
  );
}
