import "server-only";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { can, roleOf, type Action } from "./permissions";

/**
 * Dùng trong Server Component (trang): tự kiểm tra quyền, không phụ thuộc Middleware.
 * Chưa đăng nhập → /login?callbackUrl=...; không đủ quyền → /403.
 */
export async function requirePagePermission(action: Action, callbackUrl: string): Promise<Session> {
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  if (!can(roleOf(session), action)) {
    redirect("/403");
  }
  return session;
}

/**
 * Dùng trong Server Action / Route Handler: trả về session nếu đủ quyền,
 * ngược lại trả về thông báo lỗi (không redirect để client hiển thị được).
 */
export async function checkActionPermission(
  action: Action,
): Promise<{ ok: true; session: Session } | { ok: false; message: string }> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "Bạn cần đăng nhập để thực hiện thao tác này." };
  if (!can(roleOf(session), action)) {
    return { ok: false, message: "Bạn không có quyền thực hiện thao tác này." };
  }
  return { ok: true, session };
}
