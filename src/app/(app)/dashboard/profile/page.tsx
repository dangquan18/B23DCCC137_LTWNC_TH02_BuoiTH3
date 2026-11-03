import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/authz";
import { ACTION_LABELS, ACTIONS, can, ROLE_LABELS } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hồ sơ & quyền",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const session = await requirePagePermission("deadline:complete", "/dashboard/profile");
  const { id, name, email, role } = session.user;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Hồ sơ &amp; quyền</h1>

      <section aria-labelledby="session-title" className="card p-6">
        <h2 id="session-title" className="mb-4 font-semibold text-slate-900">
          Thông tin trong session (JWT)
        </h2>
        <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="text-slate-600">id</dt>
          <dd className="font-mono text-slate-900">{id}</dd>
          <dt className="text-slate-600">Tên</dt>
          <dd className="text-slate-900">{name ?? "—"}</dd>
          <dt className="text-slate-600">Email</dt>
          <dd className="text-slate-900">{email ?? "—"}</dd>
          <dt className="text-slate-600">role</dt>
          <dd className="text-slate-900">
            <code className="font-mono">{role}</code> ({ROLE_LABELS[role]})
          </dd>
        </dl>
      </section>

      <section aria-labelledby="perm-title" className="card p-6">
        <h2 id="perm-title" className="mb-4 font-semibold text-slate-900">
          Quyền của bạn theo <code>can(&quot;{role}&quot;, action)</code>
        </h2>
        <ul className="space-y-2 text-sm">
          {ACTIONS.map((a) => {
            const ok = can(role, a);
            return (
              <li key={a} className="flex items-center gap-3">
                <span
                  className={`grid size-6 place-items-center rounded-full text-xs font-bold ${
                    ok ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                  }`}
                  aria-label={ok ? "Được phép" : "Không được phép"}
                >
                  {ok ? "✓" : "✗"}
                </span>
                <span className="text-slate-800">{ACTION_LABELS[a]}</span>
                <code className="text-xs text-slate-600">{a}</code>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
