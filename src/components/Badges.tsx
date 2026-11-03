import { DEADLINE_TYPE_LABELS, type DeadlineType, type Subject } from "@/lib/types";

export function TypeBadge({ type }: { type: DeadlineType }) {
  return (
    <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
      {DEADLINE_TYPE_LABELS[type]}
    </span>
  );
}

export function SubjectBadge({ subject }: { subject: Pick<Subject, "name" | "color"> }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
      <span aria-hidden className="size-2.5 rounded-full" style={{ backgroundColor: subject.color }} />
      {subject.name}
    </span>
  );
}
