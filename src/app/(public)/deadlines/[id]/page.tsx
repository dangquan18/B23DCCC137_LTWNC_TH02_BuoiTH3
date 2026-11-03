import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SubjectBadge, TypeBadge } from "@/components/Badges";
import { CompleteButton } from "@/components/CompleteButton";
import { Countdown } from "@/components/Countdown";
import { getDeadline, getDeadlines, getSubject } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { absoluteUrl } from "@/lib/site";
import { DEADLINE_TYPE_LABELS } from "@/lib/types";
import { deadlineIdSchema } from "@/lib/validation";

/**
 * ISR theo yêu cầu (on-demand): sinh sẵn mọi deadline lúc build, giữ HTML tĩnh vô thời hạn,
 * và chỉ tạo lại khi admin thêm/xoá (revalidatePath trong Server Action).
 * Id mới (chưa có lúc build) được render lần đầu khi có request rồi cache lại.
 */
export const revalidate = false;
export const dynamicParams = true;

export async function generateStaticParams() {
  const deadlines = await getDeadlines();
  return deadlines.map((d) => ({ id: d.id }));
}

type Props = { params: Promise<{ id: string }> };

/** Cắt theo ranh giới từ để meta description không bị đứt giữa chữ. */
function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

async function load(rawId: string) {
  const id = deadlineIdSchema.safeParse(rawId);
  if (!id.success) return null;
  const deadline = await getDeadline(id.data);
  if (!deadline) return null;
  const subject = await getSubject(deadline.subjectSlug);
  return { deadline, subject };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await load(id);
  if (!data) return { title: "Không tìm thấy deadline", robots: { index: false } };

  const { deadline, subject } = data;
  const title = `${deadline.title} — hạn ${formatDateTime(deadline.dueAt)}`;
  const description = truncate(`${DEADLINE_TYPE_LABELS[deadline.type]} môn ${subject?.name ?? ""}. ${deadline.description}`, 155);

  // Ảnh chia sẻ được sinh tự động từ opengraph-image.tsx cùng thư mục.
  return {
    title: deadline.title,
    description,
    alternates: { canonical: `/deadlines/${deadline.id}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/deadlines/${deadline.id}`,
      publishedTime: deadline.createdAt,
      section: subject?.name,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function DeadlineDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await load(id);
  if (!data) notFound();

  const { deadline, subject } = data;
  const generatedAt = new Date();

  const breadcrumb = [
    { name: "Trang chủ", path: "/" },
    { name: "Deadline", path: "/deadlines" },
    { name: deadline.title, path: `/deadlines/${deadline.id}` },
  ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumb.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <script
        type="application/ld+json"
        // Escape "<" để nội dung (vd. tiêu đề do admin nhập) không thể đóng thẻ <script>.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />

      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-600">
          {breadcrumb.map((item, i) => (
            <li key={item.path} className="flex items-center gap-1">
              {i > 0 && <span aria-hidden>/</span>}
              {i < breadcrumb.length - 1 ? (
                <Link href={item.path} className="hover:underline">
                  {item.name}
                </Link>
              ) : (
                <span aria-current="page" className="line-clamp-1 text-slate-900">
                  {item.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="card overflow-hidden">
        <div className="h-2" style={{ backgroundColor: subject?.color ?? "#6366f1" }} />
        <div className="space-y-5 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            {subject && (
              <Link href={`/subjects/${subject.slug}`} className="hover:underline">
                <SubjectBadge subject={subject} />
              </Link>
            )}
            <TypeBadge type={deadline.type} />
            <span className="text-xs text-slate-600">#{deadline.id}</span>
          </div>

          <h1 className="text-2xl leading-snug font-bold text-slate-900 md:text-3xl">{deadline.title}</h1>

          <div className="flex flex-wrap items-center gap-4 rounded-xl bg-slate-50 p-4">
            <div>
              <p className="text-xs font-medium tracking-wide text-slate-600 uppercase">Hạn nộp</p>
              <p className="font-semibold text-slate-900">
                <time dateTime={deadline.dueAt}>{formatDateTime(deadline.dueAt)}</time>
              </p>
            </div>
            <Countdown dueAt={deadline.dueAt} size="lg" />
          </div>

          <section aria-labelledby="mo-ta">
            <h2 id="mo-ta" className="mb-2 font-semibold text-slate-900">
              Mô tả
            </h2>
            <p className="leading-relaxed whitespace-pre-line text-slate-700">
              {deadline.description || "Chưa có mô tả."}
            </p>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <CompleteButton deadlineId={deadline.id} />
            <Link href="/deadlines" className="text-sm font-medium text-brand-700 hover:underline">
              ← Tất cả deadline
            </Link>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-slate-600">
        Trang tạo lúc{" "}
        <time dateTime={generatedAt.toISOString()}>
          {generatedAt.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
        </time>{" "}
        · ISR, làm mới ngay khi lớp trưởng thêm/xoá deadline
      </p>
    </article>
  );
}
