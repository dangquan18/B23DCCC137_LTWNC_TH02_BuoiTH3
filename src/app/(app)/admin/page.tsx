import type { Metadata } from "next";
import Link from "next/link";
import { AddDeadlineForm } from "@/components/admin/AddDeadlineForm";
import { DeleteDeadlineButton } from "@/components/admin/DeleteDeadlineButton";
import { SubjectBadge, TypeBadge } from "@/components/Badges";
import { requirePagePermission } from "@/lib/authz";
import { getDeadlines, getSubjects } from "@/lib/db";
import { formatShort } from "@/lib/format";
import { can } from "@/lib/permissions";

// SSR: chỉ admin, render theo từng request.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quản trị deadline",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  // Kiểm tra lần 2 ngay trong trang (phòng khi Middleware bị bỏ qua / cấu hình sai matcher).
  const session = await requirePagePermission("deadline:create", "/admin");
  const canDelete = can(session.user.role, "deadline:delete");

  const [deadlines, subjects] = await Promise.all([getDeadlines(), getSubjects()]);
  const subjectMap = new Map(subjects.map((s) => [s.slug, s]));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Quản trị deadline</h1>
        <p className="text-slate-600">
          Thêm hoặc xoá deadline. Trang chi tiết <code>/deadlines/[id]</code> được làm mới ngay (on-demand ISR);
          danh sách <code>/deadlines</code> cập nhật trong tối đa 60 giây.
        </p>
      </header>

      <section aria-labelledby="add-title" className="card p-6">
        <h2 id="add-title" className="mb-4 text-lg font-semibold text-slate-900">
          Thêm deadline
        </h2>
        <AddDeadlineForm subjects={subjects.map(({ slug, name }) => ({ slug, name }))} />
      </section>

      <section aria-labelledby="list-title" className="card overflow-hidden">
        <h2 id="list-title" className="border-b border-slate-200 p-5 text-lg font-semibold text-slate-900">
          Danh sách ({deadlines.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th scope="col" className="px-4 py-3">
                  #
                </th>
                <th scope="col" className="px-4 py-3">
                  Tiêu đề
                </th>
                <th scope="col" className="px-4 py-3">
                  Môn
                </th>
                <th scope="col" className="px-4 py-3">
                  Hạn
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {deadlines.map((d) => {
                const subject = subjectMap.get(d.subjectSlug);
                return (
                  <tr key={d.id} className="border-t border-slate-100 align-middle">
                    <td className="px-4 py-3 font-mono text-slate-600">{d.id}</td>
                    <td className="px-4 py-3">
                      <Link href={`/deadlines/${d.id}`} className="font-medium text-slate-900 hover:underline">
                        {d.title}
                      </Link>
                      <div className="mt-1">
                        <TypeBadge type={d.type} />
                      </div>
                    </td>
                    <td className="px-4 py-3">{subject && <SubjectBadge subject={subject} />}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                      <time dateTime={d.dueAt}>{formatShort(d.dueAt)}</time>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {canDelete && <DeleteDeadlineButton id={d.id} title={d.title} />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
