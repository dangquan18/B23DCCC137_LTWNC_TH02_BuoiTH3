"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { checkActionPermission } from "@/lib/authz";
import { createDeadline, deleteDeadline, getDeadline, getSubjects, setCompleted } from "@/lib/db";
import type { ActionState } from "@/lib/types";
import { createDeadlineSchema, deadlineIdSchema } from "@/lib/validation";

/**
 * Mọi Server Action là một endpoint POST công khai: ai cũng có thể gọi trực tiếp
 * mà không đi qua trang hay Middleware. Vì vậy MỖI action đều:
 *   1) tự kiểm tra quyền bằng can(role, action),
 *   2) kiểm tra hợp lệ dữ liệu đầu vào bằng zod.
 */

/** On-demand ISR: làm mới ngay trang chi tiết bị ảnh hưởng (và sitemap). */
function revalidateDeadline(id: string) {
  revalidatePath(`/deadlines/${id}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin");
  revalidatePath("/dashboard", "layout");
}

function storageError(err: unknown): ActionState {
  console.error("[data] write failed", err);
  return {
    status: "error",
    message: "Không ghi được dữ liệu (máy chủ có thể đang ở chế độ chỉ đọc). Vui lòng thử lại.",
  };
}

/* ---------- Thêm deadline (admin) ---------- */

export type CreateField = "title" | "subjectSlug" | "type" | "dueAt" | "description";

export async function createDeadlineAction(
  _prev: ActionState<CreateField>,
  formData: FormData,
): Promise<ActionState<CreateField>> {
  const perm = await checkActionPermission("deadline:create");
  if (!perm.ok) return { status: "error", message: perm.message };

  const subjects = await getSubjects();
  const parsed = createDeadlineSchema(subjects.map((s) => s.slug)).safeParse({
    title: formData.get("title") ?? "",
    subjectSlug: formData.get("subjectSlug") ?? "",
    type: formData.get("type") ?? "",
    dueAt: formData.get("dueAt") ?? "",
    description: formData.get("description") ?? "",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Dữ liệu chưa hợp lệ, vui lòng kiểm tra lại.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  try {
    const created = await createDeadline(parsed.data);
    revalidateDeadline(created.id);
    return { status: "success", message: `Đã thêm deadline #${created.id}: ${created.title}` };
  } catch (err) {
    return storageError(err);
  }
}

/* ---------- Xoá deadline (admin) ---------- */

export async function deleteDeadlineAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const perm = await checkActionPermission("deadline:delete");
  if (!perm.ok) return { status: "error", message: perm.message };

  const parsed = deadlineIdSchema.safeParse(formData.get("id"));
  if (!parsed.success) return { status: "error", message: "Id deadline không hợp lệ." };

  try {
    const removed = await deleteDeadline(parsed.data);
    if (!removed) return { status: "error", message: `Deadline #${parsed.data} không tồn tại.` };
    revalidateDeadline(parsed.data);
    return { status: "success", message: `Đã xoá deadline #${parsed.data}.` };
  } catch (err) {
    return storageError(err);
  }
}

/* ---------- Đánh dấu đã xong (user, admin) ---------- */

const toggleSchema = z.object({ id: deadlineIdSchema, done: z.boolean() });

export async function toggleCompleteAction(
  id: unknown,
  done: unknown,
): Promise<{ ok: true; done: boolean } | { ok: false; message: string }> {
  const perm = await checkActionPermission("deadline:complete");
  if (!perm.ok) return { ok: false, message: perm.message };

  const parsed = toggleSchema.safeParse({ id, done });
  if (!parsed.success) return { ok: false, message: "Dữ liệu không hợp lệ." };

  if (!(await getDeadline(parsed.data.id))) {
    return { ok: false, message: "Deadline không tồn tại hoặc đã bị xoá." };
  }

  try {
    const result = await setCompleted(perm.session.user.id, parsed.data.id, parsed.data.done);
    revalidatePath("/dashboard", "layout");
    return { ok: true, done: result };
  } catch (err) {
    const { message } = storageError(err) as { message: string };
    return { ok: false, message };
  }
}
