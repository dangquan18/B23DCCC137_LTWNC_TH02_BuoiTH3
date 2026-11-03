/**
 * NƠI DUY NHẤT định nghĩa phân quyền của ứng dụng.
 *
 * Middleware, trang /admin, /dashboard, Server Action, Route Handler và UI
 * đều gọi `can(role, action)` từ file này — không nơi nào tự so sánh role.
 */

export const ROLES = ["guest", "user", "admin"] as const;
/** Vai trò khi xét quyền (khách chưa đăng nhập là "guest"). */
export type Role = (typeof ROLES)[number];
/** Vai trò của một tài khoản đã đăng nhập (được lưu trong JWT/session). */
export type UserRole = Exclude<Role, "guest">;

export const ACTIONS = [
  "deadline:view",
  "deadline:complete",
  "deadline:create",
  "deadline:delete",
] as const;
export type Action = (typeof ACTIONS)[number];

export const ACTION_LABELS: Record<Action, string> = {
  "deadline:view": "Xem deadline",
  "deadline:complete": "Đánh dấu đã xong",
  "deadline:create": "Thêm deadline",
  "deadline:delete": "Xoá deadline",
};

export const ROLE_LABELS: Record<Role, string> = {
  guest: "Khách",
  user: "Sinh viên",
  admin: "Lớp trưởng",
};

/** Ma trận phân quyền: hành động → các vai trò được phép. */
const PERMISSIONS: Record<Action, readonly Role[]> = {
  "deadline:view": ["guest", "user", "admin"],
  "deadline:complete": ["user", "admin"],
  "deadline:create": ["admin"],
  "deadline:delete": ["admin"],
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export function isUserRole(value: unknown): value is UserRole {
  return isRole(value) && value !== "guest";
}

/**
 * Kiểm tra quyền. Vai trò không hợp lệ / thiếu được coi là "guest"
 * (fail-safe: không bao giờ cấp nhiều quyền hơn khách).
 */
export function can(role: Role | null | undefined, action: Action): boolean {
  const effective: Role = isRole(role) ? role : "guest";
  const allowed = PERMISSIONS[action] as readonly Role[] | undefined;
  return allowed?.includes(effective) ?? false;
}

/** Lấy vai trò từ session (null → guest). */
export function roleOf(session: { user?: { role?: UserRole } } | null | undefined): Role {
  const role = session?.user?.role;
  return isUserRole(role) ? role : "guest";
}

/**
 * Route cần bảo vệ và hành động tối thiểu để truy cập.
 * /dashboard: nơi đánh dấu đã xong → cần "deadline:complete" (user, admin).
 * /admin: nơi thêm/xoá → cần "deadline:create" (chỉ admin).
 */
export const PROTECTED_ROUTES: ReadonlyArray<{ prefix: string; action: Action }> = [
  { prefix: "/dashboard", action: "deadline:complete" },
  { prefix: "/admin", action: "deadline:create" },
];

export function requiredActionFor(pathname: string): Action | null {
  const rule = PROTECTED_ROUTES.find(
    (r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`),
  );
  return rule?.action ?? null;
}
