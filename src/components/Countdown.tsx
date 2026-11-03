"use client";

import { useNow } from "@/lib/client-stores";
import { describeCountdown, type CountdownTone } from "@/lib/format";

const toneClass: Record<CountdownTone, string> = {
  overdue: "bg-rose-100 text-rose-800 ring-rose-200",
  urgent: "bg-amber-100 text-amber-900 ring-amber-200",
  soon: "bg-sky-100 text-sky-900 ring-sky-200",
  normal: "bg-emerald-100 text-emerald-900 ring-emerald-200",
};

/**
 * Đếm ngược "Còn X ngày / Quá hạn Y ngày".
 * Phải là Client Component: trang chứa nó là tĩnh (SSG/ISR) nên thời điểm "bây giờ"
 * chỉ đúng khi tính trên trình duyệt; tự cập nhật mỗi phút.
 */
export function Countdown({ dueAt, size = "sm" }: { dueAt: string; size?: "sm" | "lg" }) {
  const now = useNow();
  const sizeClass = size === "lg" ? "px-3 py-1.5 text-base" : "px-2 py-0.5 text-xs";

  if (now === null) {
    // HTML tĩnh: giữ chỗ cùng kích thước để không gây layout shift (CLS).
    return (
      <span className={`inline-block rounded-full bg-slate-100 text-slate-600 ring-1 ring-slate-200 ${sizeClass}`}>
        Đang tính…
      </span>
    );
  }

  const { text, tone } = describeCountdown(dueAt, now);
  return (
    <span
      className={`inline-block rounded-full font-semibold ring-1 ${toneClass[tone]} ${sizeClass}`}
      role="timer"
      aria-live="off"
    >
      {text}
    </span>
  );
}
