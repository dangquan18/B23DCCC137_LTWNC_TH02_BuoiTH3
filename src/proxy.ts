import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";
import { can, requiredActionFor } from "@/lib/permissions";

const { auth } = NextAuth(authConfig);

/**
 * Middleware của ứng dụng. Từ Next.js 16, file middleware.ts được đổi tên thành proxy.ts
 * (cùng chức năng, build hiển thị "ƒ Proxy (Middleware)").
 *
 * Đây là lớp bảo vệ thứ nhất. Trang /admin, /dashboard và mọi Server Action
 * vẫn tự kiểm tra quyền lần nữa — xem README câu hỏi (2).
 */
export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const action = requiredActionFor(pathname);
  if (!action) return NextResponse.next();

  if (!req.auth?.user) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (!can(req.auth.user.role, action)) {
    return NextResponse.redirect(new URL("/403", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
