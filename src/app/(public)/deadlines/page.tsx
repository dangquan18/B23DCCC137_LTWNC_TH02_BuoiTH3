import type { Metadata } from "next";
import { DeadlineFilter } from "@/components/DeadlineFilter";
import { getDeadlines, getSubjects } from "@/lib/db";

// ISR: HTML tĩnh được tạo lại tối đa mỗi 60 giây (stale-while-revalidate).
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Tất cả deadline",
  description: "Danh sách đầy đủ bài tập, kiểm tra, thi và đồ án của lớp, sắp xếp theo hạn nộp, kèm đếm ngược.",
  alternates: { canonical: "/deadlines" },
  openGraph: { title: "Tất cả deadline của lớp", url: "/deadlines" },
};

export default async function DeadlinesPage() {
  const [deadlines, subjects] = await Promise.all([getDeadlines(), getSubjects()]);
  const generatedAt = new Date();

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tất cả deadline</h1>
          <p className="text-slate-600">
            {deadlines.length} deadline của {subjects.length} môn học, sắp xếp theo hạn nộp.
          </p>
        </div>
        <p className="text-xs text-slate-600">
          Trang tạo lúc{" "}
          <time dateTime={generatedAt.toISOString()}>
            {generatedAt.toLocaleTimeString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
          </time>{" "}
          · tự làm mới sau 60 giây (ISR)
        </p>
      </header>

      <DeadlineFilter
        deadlines={deadlines}
        subjects={subjects.map(({ slug, name, color }) => ({ slug, name, color }))}
      />
    </div>
  );
}
