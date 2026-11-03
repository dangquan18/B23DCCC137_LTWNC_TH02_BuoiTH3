import type { Metadata } from "next";
import { CompleteButton } from "@/components/CompleteButton";
import { DeadlineCard } from "@/components/DeadlineCard";
import { requirePagePermission } from "@/lib/authz";
import { getDashboardData } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Deadline của tôi",
  robots: { index: false, follow: false },
};

export default async function MyDeadlinesPage() {
  const session = await requirePagePermission("deadline:complete", "/dashboard/deadlines");
  const { items } = await getDashboardData(session.user.id);

  const groups = [
    { id: "chua-xong", title: "Chưa xong", items: items.filter((i) => !i.done) },
    { id: "da-xong", title: "Đã xong", items: items.filter((i) => i.done) },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Deadline của tôi</h1>
        <p className="text-slate-600">Bấm nút để đánh dấu đã xong hoặc bỏ đánh dấu.</p>
      </header>

      {groups.map((g) => (
        <section key={g.id} aria-labelledby={g.id} className="space-y-3">
          <h2 id={g.id} className="text-lg font-semibold text-slate-900">
            {g.title} <span className="text-sm font-normal text-slate-600">({g.items.length})</span>
          </h2>
          {g.items.length === 0 ? (
            <p className="card p-6 text-center text-sm text-slate-600">Không có deadline nào.</p>
          ) : (
            <ul className="space-y-3">
              {g.items.map(({ deadline, subject, done }) => (
                <li key={deadline.id} className={done ? "opacity-75" : undefined}>
                  <DeadlineCard deadline={deadline} subject={subject}>
                    <CompleteButton deadlineId={deadline.id} initialDone={done} />
                  </DeadlineCard>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
