// Sinh ảnh minh hoạ (PNG) cho trang chủ và từng môn học từ SVG bằng sharp.
// Chạy: node scripts/generate-images.mjs
import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const subjects = JSON.parse(await readFile(path.join(root, "data/subjects.json"), "utf8"));

const icons = {
  "lap-trinh-web": `<path d="M300 210 l-70 70 l70 70" /><path d="M500 210 l70 70 l-70 70" /><path d="M430 190 l-60 180" />`,
  "co-so-du-lieu": `<ellipse cx="400" cy="200" rx="120" ry="38" /><path d="M280 200 v160 a120 38 0 0 0 240 0 v-160" /><path d="M280 280 a120 38 0 0 0 240 0" />`,
  "lap-trinh-huong-doi-tuong": `<rect x="330" y="150" width="140" height="80" rx="12" /><rect x="220" y="310" width="140" height="80" rx="12" /><rect x="440" y="310" width="140" height="80" rx="12" /><path d="M400 230 v40 h-110 v40 M400 270 h110 v40" />`,
  "cong-nghe-phan-mem": `<circle cx="400" cy="270" r="90" /><path d="M400 180 v-30 M400 390 v-30 M310 270 h-30 M520 270 h-30 M336 206 l-21 -21 M485 355 l-21 -21 M336 334 l-21 21 M485 185 l-21 21" /><circle cx="400" cy="270" r="34" />`,
};

function subjectSvg(s) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${s.color}" />
      <stop offset="1" stop-color="#0f172a" />
    </linearGradient>
    <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="2" fill="#ffffff" fill-opacity="0.12" />
    </pattern>
  </defs>
  <rect width="800" height="450" fill="url(#g)" />
  <rect width="800" height="450" fill="url(#dots)" />
  <circle cx="690" cy="70" r="150" fill="#ffffff" fill-opacity="0.08" />
  <circle cx="90" cy="420" r="120" fill="#ffffff" fill-opacity="0.06" />
  <g fill="none" stroke="#ffffff" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="0.92">
    ${icons[s.slug] ?? ""}
  </g>
</svg>`;
}

const heroSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="0 0 960 720">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e0e7ff" /><stop offset="1" stop-color="#fce7f3" />
    </linearGradient>
  </defs>
  <rect width="960" height="720" rx="48" fill="url(#bg)" />
  <circle cx="820" cy="120" r="90" fill="#c7d2fe" />
  <circle cx="140" cy="620" r="70" fill="#fbcfe8" />
  <g transform="translate(170 130)">
    <rect width="620" height="470" rx="32" fill="#ffffff" stroke="#c7d2fe" stroke-width="4" />
    <rect width="620" height="110" rx="32" fill="#4f46e5" />
    <rect y="70" width="620" height="40" fill="#4f46e5" />
    <rect x="120" y="-30" width="22" height="70" rx="11" fill="#312e81" />
    <rect x="478" y="-30" width="22" height="70" rx="11" fill="#312e81" />
    ${Array.from({ length: 4 }, (_, r) =>
      Array.from({ length: 6 }, (_, c) => {
        const x = 40 + c * 92;
        const y = 140 + r * 80;
        const hot = (r === 1 && c === 3) || (r === 2 && c === 1) || (r === 3 && c === 4);
        const done = (r === 0 && c === 2) || (r === 1 && c === 0);
        const fill = hot ? "#fb7185" : done ? "#34d399" : "#eef2ff";
        return `<rect x="${x}" y="${y}" width="72" height="60" rx="12" fill="${fill}" />${
          done ? `<path d="M${x + 20} ${y + 31} l12 12 l22 -24" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>` : ""
        }`;
      }).join(""),
    ).join("")}
  </g>
  <g transform="translate(720 520)">
    <circle r="110" fill="#ffffff" stroke="#4f46e5" stroke-width="12" />
    <path d="M0 -70 V0 L48 30" fill="none" stroke="#4f46e5" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" />
    <circle r="12" fill="#4f46e5" />
  </g>
</svg>`;

await mkdir(path.join(root, "public/images/subjects"), { recursive: true });
await sharp(Buffer.from(heroSvg)).png({ compressionLevel: 9 }).toFile(path.join(root, "public/images/hero.png"));
for (const s of subjects) {
  await sharp(Buffer.from(subjectSvg(s)))
    .png({ compressionLevel: 9 })
    .toFile(path.join(root, `public/images/subjects/${s.slug}.png`));
}
console.log("Đã sinh", subjects.length + 1, "ảnh");
