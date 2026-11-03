"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toggleCompleteAction } from "@/app/actions/deadlines";
import { can } from "@/lib/permissions";

/**
 * Nút "Đánh dấu đã xong".
 * - Ở /dashboard (SSR): nhận sẵn `initialDone` từ server.
 * - Ở /deadlines/[id] (ISR, HTML dùng chung cho mọi người): tự hỏi trạng thái của user hiện tại
 *   qua /api/me/completions, để trang vẫn tĩnh.
 */
export function CompleteButton({
  deadlineId,
  initialDone,
  callbackUrl,
}: {
  deadlineId: string;
  initialDone?: boolean;
  callbackUrl?: string;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [done, setDone] = useState<boolean | null>(initialDone ?? null);
  const [error, setError] = useState<string | null>(null);
  // Không dùng useTransition: isPending sẽ bị "dính" vào lần làm mới router sau action,
  // nên nút chỉ phản ánh đúng thời gian chờ chính Server Action.
  const [pending, setPending] = useState(false);

  const allowed = can(session?.user?.role, "deadline:complete");

  useEffect(() => {
    if (initialDone !== undefined || status !== "authenticated" || !allowed) return;
    let cancelled = false;
    fetch("/api/me/completions", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: { completed: string[] }) => {
        if (!cancelled) setDone(data.completed.includes(deadlineId));
      })
      .catch(() => !cancelled && setError("Không tải được trạng thái."));
    return () => {
      cancelled = true;
    };
  }, [initialDone, status, allowed, deadlineId]);

  if (status === "loading") {
    return <div aria-hidden className="h-9 w-44 animate-pulse rounded-lg bg-slate-100" />;
  }

  if (!session?.user) {
    const back = callbackUrl ?? `/deadlines/${deadlineId}`;
    return (
      <Link href={`/login?callbackUrl=${encodeURIComponent(back)}`} className="btn-secondary">
        Đăng nhập để đánh dấu đã xong
      </Link>
    );
  }

  if (!allowed) return null;

  const toggle = async () => {
    const next = !done;
    setError(null);
    setPending(true);
    try {
      const result = await toggleCompleteAction(deadlineId, next);
      if (result.ok) {
        setDone(result.done);
        // Tải lại dữ liệu server (danh sách, thống kê) của trang hiện tại.
        router.refresh();
      } else {
        setError(result.message);
      }
    } catch {
      setError("Không kết nối được máy chủ, vui lòng thử lại.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={pending || done === null}
        aria-pressed={done ?? false}
        className={done ? "btn bg-emerald-600 text-white hover:bg-emerald-700" : "btn-secondary"}
      >
        <span aria-hidden>{done ? "✓" : "○"}</span>
        {pending ? "Đang lưu…" : done ? "Đã xong" : "Đánh dấu đã xong"}
      </button>
      {error && (
        <p role="alert" className="text-xs text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}
