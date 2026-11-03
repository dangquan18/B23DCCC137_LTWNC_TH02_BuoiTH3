import type { MetadataRoute } from "next";
import { getDeadlines, getSubjects } from "@/lib/db";
import { absoluteUrl } from "@/lib/site";

// Làm mới định kỳ và cũng được revalidate ngay khi admin thêm/xoá deadline.
export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [subjects, deadlines] = await Promise.all([getSubjects(), getDeadlines()]);

  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/deadlines"), changeFrequency: "hourly", priority: 0.9 },
    ...subjects.map((s) => ({
      url: absoluteUrl(`/subjects/${s.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...deadlines.map((d) => ({
      url: absoluteUrl(`/deadlines/${d.id}`),
      lastModified: new Date(d.createdAt),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
