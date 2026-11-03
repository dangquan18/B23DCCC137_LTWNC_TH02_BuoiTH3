import type { Metadata } from "next";
import { auth } from "@/auth";
import { Providers } from "@/components/Providers";
import { SiteHeader } from "@/components/SiteHeader";

// Mọi trang trong nhóm (app) là trang riêng tư → không lập chỉ mục.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Layout nhóm (app): khu vực cần đăng nhập, render động (SSR).
 * Đọc session ở server rồi truyền xuống client để header hiển thị ngay, không nháy.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <Providers session={session}>
      <SiteHeader />
      <div className="border-b border-amber-200 bg-amber-50">
        <p className="mx-auto max-w-6xl px-4 py-2 text-xs text-amber-900">
          Khu vực riêng tư · nội dung được render theo từng request (SSR) và không được lập chỉ mục.
        </p>
      </div>
      <main id="noi-dung" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
    </Providers>
  );
}
