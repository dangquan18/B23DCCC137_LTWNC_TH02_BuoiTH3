import { ImageResponse } from "next/og";
import { loadOgFonts, OG_SIZE } from "@/lib/og";
import { SITE_NAME } from "@/lib/site";

export const alt = `${SITE_NAME} — Cổng deadline của lớp`;
export const size = OG_SIZE;
export const contentType = "image/png";

/** Ảnh chia sẻ mặc định cho toàn site (trang chủ, /deadlines, ...). */
export default async function OgImage() {
  const fonts = await loadOgFonts();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          gap: 28,
          fontFamily: "BeVietnam",
          color: "#ffffff",
          backgroundImage: "linear-gradient(135deg, #4f46e5 0%, #db2777 100%)",
        }}
      >
        <div style={{ display: "flex", fontSize: 32, opacity: 0.9 }}>Cổng deadline của lớp</div>
        <div style={{ display: "flex", fontSize: 92, fontWeight: 700, lineHeight: 1.05 }}>{SITE_NAME}</div>
        <div style={{ display: "flex", fontSize: 36, maxWidth: 900, lineHeight: 1.35 }}>
          Đếm ngược từng hạn nộp · Đánh dấu đã xong · 4 môn học
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
