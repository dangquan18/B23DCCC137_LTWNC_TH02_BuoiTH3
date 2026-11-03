export const SITE_NAME = "Class Deadline Hub";
export const SITE_DESCRIPTION =
  "Cổng deadline của lớp: xem toàn bộ bài tập, kiểm tra, đồ án của 4 môn học, đếm ngược thời hạn và đánh dấu đã hoàn thành.";

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}
