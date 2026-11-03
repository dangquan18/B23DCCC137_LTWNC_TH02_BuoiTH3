import Link from "next/link";
import { formatDateTime } from "@/lib/format";
import type { Deadline, Subject } from "@/lib/types";
import { SubjectBadge, TypeBadge } from "./Badges";
import { Countdown } from "./Countdown";

export function DeadlineCard({
  deadline,
  subject,
  children,
}: {
  deadline: Deadline;
  subject?: Pick<Subject, "name" | "color">;
  children?: React.ReactNode;
}) {
  return (
    <article
      id={`d-${deadline.id}`}
      className="card flex flex-col gap-3 p-4 transition hover:border-brand-500 sm:flex-row sm:items-center sm:justify-between"
      style={{ borderLeft: `4px solid ${subject?.color ?? "#cbd5e1"}` }}
    >
      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          {subject && <SubjectBadge subject={subject} />}
          <TypeBadge type={deadline.type} />
        </div>
        <h3 className="font-semibold text-slate-900">
          <Link href={`/deadlines/${deadline.id}`} className="hover:text-brand-700 hover:underline">
            {deadline.title}
          </Link>
        </h3>
        <p className="text-sm text-slate-600">
          Hạn: <time dateTime={deadline.dueAt}>{formatDateTime(deadline.dueAt)}</time>
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Countdown dueAt={deadline.dueAt} />
        {children}
      </div>
    </article>
  );
}
