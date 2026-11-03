"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { createDeadlineAction, type CreateField } from "@/app/actions/deadlines";
import { DEADLINE_TYPE_LABELS, DEADLINE_TYPES, type ActionState } from "@/lib/types";

const initialState: ActionState<CreateField> = { status: "idle" };

function FieldError({ state, name }: { state: ActionState<CreateField>; name: CreateField }) {
  const message = state.status === "error" ? state.fieldErrors?.[name]?.[0] : undefined;
  if (!message) return null;
  return (
    <p id={`${name}-error`} className="mt-1 text-xs text-rose-700">
      {message}
    </p>
  );
}

export function AddDeadlineForm({ subjects }: { subjects: { slug: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createDeadlineAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, router]);

  const invalid = (name: CreateField) =>
    state.status === "error" && state.fieldErrors?.[name] ? { "aria-invalid": true, "aria-describedby": `${name}-error` } : {};

  return (
    <form ref={formRef} action={formAction} className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <label htmlFor="title" className="label">
          Tiêu đề
        </label>
        <input id="title" name="title" className="input" required minLength={5} maxLength={120} {...invalid("title")} />
        <FieldError state={state} name="title" />
      </div>

      <div>
        <label htmlFor="subjectSlug" className="label">
          Môn học
        </label>
        <select id="subjectSlug" name="subjectSlug" className="input" required defaultValue="" {...invalid("subjectSlug")}>
          <option value="" disabled>
            Chọn môn…
          </option>
          {subjects.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
        <FieldError state={state} name="subjectSlug" />
      </div>

      <div>
        <label htmlFor="type" className="label">
          Loại
        </label>
        <select id="type" name="type" className="input" required defaultValue="assignment" {...invalid("type")}>
          {DEADLINE_TYPES.map((t) => (
            <option key={t} value={t}>
              {DEADLINE_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <FieldError state={state} name="type" />
      </div>

      <div>
        <label htmlFor="dueAt" className="label">
          Hạn nộp (giờ Việt Nam)
        </label>
        <input id="dueAt" name="dueAt" type="datetime-local" className="input" required {...invalid("dueAt")} />
        <FieldError state={state} name="dueAt" />
      </div>

      <div className="md:col-span-2">
        <label htmlFor="description" className="label">
          Mô tả
        </label>
        <textarea id="description" name="description" rows={3} maxLength={1000} className="input" {...invalid("description")} />
        <FieldError state={state} name="description" />
      </div>

      <div className="flex flex-wrap items-center gap-4 md:col-span-2">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Đang thêm…" : "Thêm deadline"}
        </button>
        {state.status !== "idle" && (
          <p
            role={state.status === "error" ? "alert" : "status"}
            className={`text-sm ${state.status === "error" ? "text-rose-700" : "text-emerald-700"}`}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
