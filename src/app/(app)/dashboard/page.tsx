import type { Metadata } from "next";
import Link from "next/link";
import { CompleteButton } from "@/components/CompleteButton";
import { DeadlineCard } from "@/components/DeadlineCard";
import { requirePagePermission } from "@/lib/authz";
import { getDashboardData } from "@/lib/dashboard";

// SSR: nội dung phụ thuộc người đăng nhập → render mỗi request.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  // Tự kiểm tra quyền, không chỉ dựa vào Middleware.
  const session = await requirePagePermission("deadline:complete", "/dashboard");
  const { items, stats } = await getDashboardData(session.user.id);
  const next = items.filter((i) => !i.done && !i.overdue).slice(0, 5);
  const percent = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;

  const cards = [
    { label: "Tổng số deadline", value: stats.total, className: "text-slate-900" },
    { label: "Đã xong", value: stats.done, className: "text-emerald-700" },
    { label: "Sắp tới", value: stats.upcoming, className: "text-sky-700" },
    { label: "Quá hạn chưa xong", value: stats.overdue, className: "text-rose-700" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Xin chào, {session.user.name ?? session.user.email} 👋</h1>
        <p className="text-slate-600">Bạn đã hoàn thành {percent}% deadline của học kỳ.</p>
        <div
          className="mt-3 h-3 rounded-full bg-slate-200"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Tiến độ hoàn thành"
        >
          <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${percent}%` }} />
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-4">
            <dt className="text-sm text-slate-600">{c.label}</dt>
            <dd className={`text-3xl font-bold ${c.className}`}>{c.value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="next-title" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="next-title" className="text-lg font-semibold text-slate-900">
            Việc cần làm tiếp theo
          </h2>
          <Link href="/dashboard/deadlines" className="text-sm font-medium text-brand-700 hover:underline">
            Xem tất cả →
          </Link>
        </div>
        {next.length === 0 ? (
          <p className="card p-6 text-center text-slate-600">Tuyệt vời! Không còn deadline nào sắp tới. 🎉</p>
        ) : (
          <ul className="space-y-3">
            {next.map(({ deadline, subject, done }) => (
              <li key={deadline.id}>
                <DeadlineCard deadline={deadline} subject={subject}>
                  <CompleteButton deadlineId={deadline.id} initialDone={done} />
                </DeadlineCard>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
