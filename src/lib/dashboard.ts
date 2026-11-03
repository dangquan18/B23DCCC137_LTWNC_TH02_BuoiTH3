import "server-only";
import { getCompletedIds, getDeadlines, getSubjects } from "./db";

/** Dữ liệu cá nhân hoá cho dashboard của một user (đọc theo từng request). */
export async function getDashboardData(userId: string) {
  const [deadlines, subjects, completedIds] = await Promise.all([
    getDeadlines(),
    getSubjects(),
    getCompletedIds(userId),
  ]);
  const done = new Set(completedIds);
  const now = Date.now();
  const subjectMap = new Map(subjects.map((s) => [s.slug, s]));

  const items = deadlines.map((d) => ({
    deadline: d,
    subject: subjectMap.get(d.subjectSlug),
    done: done.has(d.id),
    overdue: Date.parse(d.dueAt) < now,
  }));

  return {
    items,
    stats: {
      total: items.length,
      done: items.filter((i) => i.done).length,
      upcoming: items.filter((i) => !i.done && !i.overdue).length,
      overdue: items.filter((i) => !i.done && i.overdue).length,
    },
  };
}
