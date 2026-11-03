import type { NextConfig } from "next";

const noIndex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];

const nextConfig: NextConfig = {
  // Dữ liệu JSON đọc bằng fs ở runtime (ISR, Server Action) → đưa vào bundle server khi deploy.
  outputFileTracingIncludes: {
    "/**/*": ["./data/**/*", "./assets/**/*"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Lớp bổ sung cho meta robots: các trang riêng tư không được lập chỉ mục.
  async headers() {
    return [
      { source: "/login", headers: noIndex },
      { source: "/403", headers: noIndex },
      { source: "/dashboard/:path*", headers: noIndex },
      { source: "/admin/:path*", headers: noIndex },
    ];
  },
};

export default nextConfig;
