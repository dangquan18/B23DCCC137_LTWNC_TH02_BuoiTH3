import {
  ACTIONS,
  can,
  requiredActionFor,
  roleOf,
  type Action,
  type Role,
} from "./permissions";

describe("can(role, action) — ma trận phân quyền", () => {
  const matrix: Record<Action, Record<Role, boolean>> = {
    "deadline:view": { guest: true, user: true, admin: true },
    "deadline:complete": { guest: false, user: true, admin: true },
    "deadline:create": { guest: false, user: false, admin: true },
    "deadline:delete": { guest: false, user: false, admin: true },
  };

  const cases = (Object.keys(matrix) as Action[]).flatMap((action) =>
    (Object.keys(matrix[action]) as Role[]).map(
      (role) => [role, action, matrix[action][role]] as const,
    ),
  );

  it.each(cases)("%s → %s = %s", (role, action, expected) => {
    expect(can(role, action)).toBe(expected);
  });

  it("bảng test bao phủ mọi action", () => {
    expect(Object.keys(matrix).sort()).toEqual([...ACTIONS].sort());
  });

  it("role null/undefined được coi là guest", () => {
    for (const action of ACTIONS) {
      expect(can(null, action)).toBe(can("guest", action));
      expect(can(undefined, action)).toBe(can("guest", action));
    }
  });

  it("role không hợp lệ không được cấp thêm quyền (fail-safe)", () => {
    const forged = "superadmin" as unknown as Role;
    expect(can(forged, "deadline:view")).toBe(true);
    expect(can(forged, "deadline:complete")).toBe(false);
    expect(can(forged, "deadline:create")).toBe(false);
    expect(can(forged, "deadline:delete")).toBe(false);
  });

  it("action không tồn tại luôn bị từ chối", () => {
    expect(can("admin", "deadline:hack" as unknown as Action)).toBe(false);
  });
});

describe("roleOf(session)", () => {
  it("không có session → guest", () => {
    expect(roleOf(null)).toBe("guest");
    expect(roleOf(undefined)).toBe("guest");
    expect(roleOf({})).toBe("guest");
  });

  it("lấy role từ session", () => {
    expect(roleOf({ user: { role: "user" } })).toBe("user");
    expect(roleOf({ user: { role: "admin" } })).toBe("admin");
  });
});

describe("requiredActionFor(pathname)", () => {
  it("bảo vệ /dashboard và route con", () => {
    expect(requiredActionFor("/dashboard")).toBe("deadline:complete");
    expect(requiredActionFor("/dashboard/deadlines")).toBe("deadline:complete");
  });

  it("bảo vệ /admin", () => {
    expect(requiredActionFor("/admin")).toBe("deadline:create");
    expect(requiredActionFor("/admin/anything")).toBe("deadline:create");
  });

  it("không bảo vệ route công khai hoặc route trùng tiền tố", () => {
    expect(requiredActionFor("/")).toBeNull();
    expect(requiredActionFor("/deadlines/1")).toBeNull();
    expect(requiredActionFor("/administrator")).toBeNull();
  });
});
