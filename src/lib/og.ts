import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };

/** Font Be Vietnam Pro (TTF) để ảnh OG hiển thị đúng dấu tiếng Việt. */
export async function loadOgFonts() {
  const dir = path.join(process.cwd(), "assets/fonts");
  const [regular, bold] = await Promise.all([
    readFile(path.join(dir, "BeVietnamPro-Regular.ttf")),
    readFile(path.join(dir, "BeVietnamPro-Bold.ttf")),
  ]);
  return [
    { name: "BeVietnam", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "BeVietnam", data: bold, weight: 700 as const, style: "normal" as const },
  ];
}
