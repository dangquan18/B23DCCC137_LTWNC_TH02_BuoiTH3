"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

/** Giao diện lỗi dùng chung cho các error.tsx, có nút "Thử lại". */
export function ErrorView({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="card mx-auto max-w-lg p-8 text-center">
      <p className="text-5xl" aria-hidden>
        ⚠️
      </p>
      <h2 className="mt-4 text-xl font-bold text-slate-900">Đã xảy ra lỗi</h2>
      <p className="mt-2 text-sm text-slate-600">
        Không thể tải nội dung lúc này. Vui lòng thử lại.
        {error.digest && <span className="mt-1 block font-mono text-xs">Mã lỗi: {error.digest}</span>}
      </p>
      <button
        type="button"
        className="btn-primary mt-6"
        disabled={pending}
        onClick={() =>
          // Lỗi từ Server Component: cần refresh để server render lại, rồi reset boundary.
          startTransition(() => {
            router.refresh();
            reset();
          })
        }
      >
        {pending ? "Đang thử lại…" : "Thử lại"}
      </button>
    </div>
  );
}
