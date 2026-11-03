"use client";

import { useMemo, useState } from "react";
import { useNow, useSearchParam } from "@/lib/client-stores";
import { DEADLINE_TYPE_LABELS, DEADLINE_TYPES, type Deadline, type DeadlineType, type Subject } from "@/lib/types";
import { DeadlineCard } from "./DeadlineCard";

type Status = "all" | "upcoming" | "overdue";

/**
 * Bộ lọc deadline (Client Component vì cần state + tương tác).
 * Danh sách đầy đủ vẫn nằm trong HTML tĩnh (tốt cho SEO); lọc chỉ diễn ra trên trình duyệt.
 */
export function DeadlineFilter({
  deadlines,
  subjects,
}: {
  deadlines: Deadline[];
  subjects: Pick<Subject, "slug" | "name" | "color">[];
}) {
  // Link /deadlines?mon=<slug> chọn sẵn môn; đọc ở client nên trang vẫn tĩnh (ISR).
  const mon = useSearchParam("mon");
  const [subjectChoice, setSubject] = useState<string | null>(null);
  const subject = subjectChoice ?? (mon && subjects.some((s) => s.slug === mon) ? mon : "all");
  const [type, setType] = useState<DeadlineType | "all">("all");
  const [status, setStatus] = useState<Status>("all");
  const [query, setQuery] = useState("");
  const now = useNow();

  const subjectMap = useMemo(() => new Map(subjects.map((s) => [s.slug, s])), [subjects]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return deadlines.filter((d) => {
      if (subject !== "all" && d.subjectSlug !== subject) return false;
      if (type !== "all" && d.type !== type) return false;
      if (status !== "all" && now !== null) {
        const overdue = Date.parse(d.dueAt) < now;
        if (status === "overdue" ? !overdue : overdue) return false;
      }
      if (q && !d.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [deadlines, subject, type, status, query, now]);

  const hasFilter = subject !== "all" || type !== "all" || status !== "all" || query !== "";

  return (
    <div className="space-y-5">
      <form
        role="search"
        aria-label="Lọc deadline"
        className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <label htmlFor="f-q" className="label">
            Tìm theo tên
          </label>
          <input
            id="f-q"
            className="input"
            placeholder="VD: SQL, React…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="f-subject" className="label">
            Môn học
          </label>
          <select id="f-subject" className="input" value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="all">Tất cả môn</option>
            {subjects.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-type" className="label">
            Loại
          </label>
          <select
            id="f-type"
            className="input"
            value={type}
            onChange={(e) => setType(e.target.value as DeadlineType | "all")}
          >
            <option value="all">Tất cả loại</option>
            {DEADLINE_TYPES.map((t) => (
              <option key={t} value={t}>
                {DEADLINE_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-status" className="label">
            Trạng thái
          </label>
          <select
            id="f-status"
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
          >
            <option value="all">Tất cả</option>
            <option value="upcoming">Sắp tới</option>
            <option value="overdue">Đã quá hạn</option>
          </select>
        </div>
      </form>

      <div className="flex items-center justify-between text-sm text-slate-600">
        <p aria-live="polite">
          Hiển thị <strong>{filtered.length}</strong> / {deadlines.length} deadline
        </p>
        {hasFilter && (
          <button
            type="button"
            className="font-medium text-brand-700 hover:underline"
            onClick={() => {
              setSubject("all");
              setType("all");
              setStatus("all");
              setQuery("");
            }}
          >
            Xoá bộ lọc
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="card p-8 text-center text-slate-600">Không có deadline nào khớp bộ lọc.</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((d) => (
            <li key={d.id}>
              <DeadlineCard deadline={d} subject={subjectMap.get(d.subjectSlug)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
