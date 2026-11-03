import { ImageResponse } from "next/og";
import { getDeadline, getDeadlines, getSubject } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { loadOgFonts, OG_SIZE } from "@/lib/og";
import { SITE_NAME } from "@/lib/site";
import { DEADLINE_TYPE_LABELS } from "@/lib/types";

export const alt = "Ảnh xem trước deadline";
export const size = OG_SIZE;
export const contentType = "image/png";

export async function generateStaticParams() {
  const deadlines = await getDeadlines();
  return deadlines.map((d) => ({ id: d.id }));
}

/** Ảnh chia sẻ riêng cho từng deadline: màu theo môn, tiêu đề, loại và hạn nộp. */
export default async function OgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deadline = await getDeadline(id);
  const subject = deadline ? await getSubject(deadline.subjectSlug) : undefined;
  const color = subject?.color ?? "#4f46e5";
  const fonts = await loadOgFonts();

  const title = deadline?.title ?? "Deadline không tồn tại";
  const titleSize = title.length > 60 ? 54 : title.length > 36 ? 64 : 76;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          fontFamily: "BeVietnam",
          color: "#ffffff",
          backgroundColor: "#0f172a",
          backgroundImage: `linear-gradient(135deg, ${color} 0%, #0f172a 85%)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                display: "flex",
                width: 56,
                height: 56,
                borderRadius: 14,
                backgroundColor: "#ffffff",
                color,
                fontSize: 26,
                fontWeight: 700,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              DH
            </div>
            <div style={{ display: "flex", fontSize: 28, fontWeight: 700, opacity: 0.95 }}>{SITE_NAME}</div>
          </div>
          {deadline && (
            <div
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.18)",
                fontSize: 26,
              }}
            >
              {DEADLINE_TYPE_LABELS[deadline.type]} · #{deadline.id}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {subject && (
            <div style={{ display: "flex", fontSize: 30, opacity: 0.9 }}>
              {subject.code} · {subject.name}
            </div>
          )}
          <div style={{ display: "flex", fontSize: titleSize, fontWeight: 700, lineHeight: 1.15 }}>{title}</div>
        </div>

        {deadline ? (
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "18px 28px",
                borderRadius: 20,
                backgroundColor: "#ffffff",
                color: "#0f172a",
              }}
            >
              <div style={{ display: "flex", fontSize: 22, color: "#475569" }}>HẠN NỘP</div>
              <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>{formatDateTime(deadline.dueAt)}</div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", fontSize: 30 }}>Deadline đã bị xoá hoặc không tồn tại.</div>
        )}
      </div>
    ),
    { ...size, fonts },
  );
}
