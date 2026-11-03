const TIME_ZONE = "Asia/Ho_Chi_Minh";

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: TIME_ZONE,
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const shortFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

/** "thứ Sáu, 20/11/2026 lúc 23:59" — luôn theo giờ Việt Nam, kết quả giống nhau ở server và client. */
export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}

export function formatShort(iso: string): string {
  return shortFormatter.format(new Date(iso));
}

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;

export type CountdownTone = "overdue" | "urgent" | "soon" | "normal";

/** "Còn X ngày" / "Quá hạn Y ngày" (dùng trong client component đếm ngược). */
export function describeCountdown(dueAt: string, now: number): { text: string; tone: CountdownTone } {
  const diff = Date.parse(dueAt) - now;
  if (diff < 0) {
    const overdue = -diff;
    if (overdue < DAY) {
      return { text: `Quá hạn ${Math.max(1, Math.floor(overdue / HOUR))} giờ`, tone: "overdue" };
    }
    return { text: `Quá hạn ${Math.floor(overdue / DAY)} ngày`, tone: "overdue" };
  }
  if (diff < DAY) {
    return { text: `Còn ${Math.max(1, Math.ceil(diff / HOUR))} giờ`, tone: "urgent" };
  }
  const days = Math.ceil(diff / DAY);
  return { text: `Còn ${days} ngày`, tone: days <= 3 ? "urgent" : days <= 7 ? "soon" : "normal" };
}
