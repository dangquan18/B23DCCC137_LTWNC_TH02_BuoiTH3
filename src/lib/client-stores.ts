"use client";

import { useSyncExternalStore } from "react";

/* ---------- Đồng hồ dùng chung: mọi Countdown chia sẻ một setInterval ---------- */

const listeners = new Set<() => void>();
let now = Date.now();
let timer: ReturnType<typeof setInterval> | undefined;

function subscribeClock(onChange: () => void) {
  now = Date.now();
  listeners.add(onChange);
  timer ??= setInterval(() => {
    now = Date.now();
    listeners.forEach((l) => l());
  }, 60_000);
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

/**
 * Thời điểm hiện tại, tự cập nhật mỗi phút.
 * Trả về null khi render ở server / lúc hydrate → HTML tĩnh không phụ thuộc thời gian build.
 */
export function useNow(): number | null {
  return useSyncExternalStore(
    subscribeClock,
    () => now,
    () => null,
  );
}

/* ---------- Đọc query string mà không làm trang tĩnh mất tính tĩnh ---------- */

const noopSubscribe = () => () => {};

/** Giá trị ?name= trên URL hiện tại (null ở server). */
export function useSearchParam(name: string): string | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => new URLSearchParams(window.location.search).get(name),
    () => null,
  );
}
