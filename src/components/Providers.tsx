"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

/**
 * - Nhóm (public): không truyền session → trang vẫn tĩnh (SSG/ISR), header lấy session ở client.
 * - Nhóm (app): truyền session đã đọc ở server (SSR) → không bị nháy trạng thái đăng nhập.
 */
export function Providers({ session, children }: { session?: Session | null; children: React.ReactNode }) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
