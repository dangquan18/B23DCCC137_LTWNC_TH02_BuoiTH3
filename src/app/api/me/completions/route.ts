import { NextResponse } from "next/server";
import { checkActionPermission } from "@/lib/authz";
import { getCompletedIds } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Danh sách id deadline mà user hiện tại đã đánh dấu xong (dùng ở trang ISR). */
export async function GET() {
  const perm = await checkActionPermission("deadline:complete");
  if (!perm.ok) {
    return NextResponse.json({ error: perm.message }, { status: 401 });
  }
  const completed = await getCompletedIds(perm.session.user.id);
  return NextResponse.json({ completed }, { headers: { "Cache-Control": "private, no-store" } });
}
