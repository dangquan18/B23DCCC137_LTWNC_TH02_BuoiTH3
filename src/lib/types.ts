import type { UserRole } from "./permissions";

export const DEADLINE_TYPES = ["assignment", "quiz", "exam", "project", "lab"] as const;
export type DeadlineType = (typeof DEADLINE_TYPES)[number];

export const DEADLINE_TYPE_LABELS: Record<DeadlineType, string> = {
  assignment: "Bài tập",
  quiz: "Kiểm tra",
  exam: "Thi",
  project: "Đồ án",
  lab: "Thực hành",
};

export interface Subject {
  slug: string;
  code: string;
  name: string;
  lecturer: string;
  credits: number;
  room: string;
  schedule: string;
  color: string;
  image: string;
  description: string;
  grading: { label: string; weight: number }[];
}

export interface Deadline {
  id: string;
  title: string;
  subjectSlug: string;
  type: DeadlineType;
  /** ISO 8601 có múi giờ, ví dụ 2026-11-20T23:59:00+07:00 */
  dueAt: string;
  description: string;
  createdAt: string;
}

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

/** userId → danh sách id deadline đã xong */
export type Completions = Record<string, string[]>;

/** Kết quả trả về chung của Server Action dùng với useActionState. */
export type ActionState<TField extends string = string> =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Partial<Record<TField, string[]>> };
