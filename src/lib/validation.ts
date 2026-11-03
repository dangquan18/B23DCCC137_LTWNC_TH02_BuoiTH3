import { z } from "zod";
import { DEADLINE_TYPES } from "./types";

/** Id deadline: số nguyên dương dạng chuỗi (chặn path traversal, chuỗi rỗng...). */
export const deadlineIdSchema = z
  .string({ error: "Thiếu id deadline" })
  .trim()
  .regex(/^[1-9]\d{0,8}$/, "Id deadline không hợp lệ");

export const loginSchema = z.object({
  email: z.email("Email không hợp lệ").trim().toLowerCase().max(254),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự").max(128),
});

/**
 * Giá trị từ <input type="datetime-local"> (không có múi giờ),
 * được hiểu theo giờ Việt Nam (UTC+7).
 */
const localDateTime = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Thời hạn không hợp lệ")
  .transform((v) => `${v}:00+07:00`)
  .refine((iso) => !Number.isNaN(Date.parse(iso)), "Thời hạn không hợp lệ");

export function createDeadlineSchema(subjectSlugs: readonly string[]) {
  return z.object({
    title: z
      .string()
      .trim()
      .min(5, "Tiêu đề tối thiểu 5 ký tự")
      .max(120, "Tiêu đề tối đa 120 ký tự"),
    subjectSlug: z
      .string()
      .refine((slug) => subjectSlugs.includes(slug), "Môn học không tồn tại"),
    type: z.enum(DEADLINE_TYPES, { error: "Loại deadline không hợp lệ" }),
    dueAt: localDateTime.refine((iso) => {
      const year = new Date(iso).getFullYear();
      return year >= 2020 && year <= 2100;
    }, "Thời hạn nằm ngoài khoảng cho phép"),
    description: z.string().trim().max(1000, "Mô tả tối đa 1000 ký tự").default(""),
  });
}

/** Chỉ cho phép đường dẫn nội bộ (chống open redirect qua ?callbackUrl=). */
export function safeCallbackUrl(value: unknown, fallback = "/dashboard"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
