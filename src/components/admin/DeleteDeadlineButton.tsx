"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { deleteDeadlineAction } from "@/app/actions/deadlines";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = { status: "idle" };

export function DeleteDeadlineButton({ id, title }: { id: string; title: string }) {
  const [state, formAction, pending] = useActionState(deleteDeadlineAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [state, router]);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm(`Xoá deadline "${title}"?`)) e.preventDefault();
      }}
      className="inline-flex flex-col items-end gap-1"
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="btn-danger px-3 py-1.5 text-xs" disabled={pending} aria-label={`Xoá ${title}`}>
        {pending ? "Đang xoá…" : "Xoá"}
      </button>
      {state.status === "error" && (
        <span role="alert" className="text-xs text-rose-700">
          {state.message}
        </span>
      )}
    </form>
  );
}
