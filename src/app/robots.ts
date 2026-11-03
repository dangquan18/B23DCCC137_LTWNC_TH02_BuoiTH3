import type { MetadataRoute } from "next";
import { absoluteUrl, SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Khu vực riêng tư: không cho crawler thu thập.
        // /login KHÔNG chặn ở đây để Google đọc được thẻ noindex của nó.
        disallow: ["/dashboard", "/admin", "/api/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
