"use client";

/** Bắt lỗi xảy ra ngay trong root layout (thay thế cả <html>). */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="vi">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <h1>Đã xảy ra lỗi nghiêm trọng</h1>
          {error.digest && <p style={{ fontFamily: "monospace" }}>Mã lỗi: {error.digest}</p>}
          <button type="button" onClick={() => reset()} style={{ padding: "8px 16px", marginTop: 16 }}>
            Thử lại
          </button>
        </div>
      </body>
    </html>
  );
}
