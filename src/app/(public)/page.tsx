import Image from "next/image";
import Link from "next/link";
import heroImage from "../../../public/images/hero.png";
import { getSubjects } from "@/lib/db";
import { ACTION_LABELS, ACTIONS, can, ROLE_LABELS, ROLES } from "@/lib/permissions";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

// SSG: render một lần lúc build, phục vụ HTML tĩnh từ CDN.
export const dynamic = "force-static";

export default async function HomePage() {
  const subjects = await getSubjects();

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "vi-VN",
  };

  return (
    <div className="space-y-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c") }}
      />

      <section className="grid items-center gap-10 md:grid-cols-2">
        <div className="space-y-5">
          <p className="inline-block rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-700">
            Cổng deadline của lớp
          </p>
          <h1 className="text-4xl leading-tight font-bold text-slate-900 md:text-5xl">
            Không bao giờ lỡ <span className="text-brand-600">deadline</span> nào nữa.
          </h1>
          <p className="text-lg text-slate-700">
            Toàn bộ bài tập, bài kiểm tra, lịch thi và đồ án của {subjects.length} môn học ở cùng một nơi. Đếm
            ngược từng hạn nộp, đánh dấu việc đã xong và theo dõi tiến độ của bạn.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/deadlines" className="btn-primary px-5 py-3 text-base">
              Xem tất cả deadline
            </Link>
            <Link href="/login?callbackUrl=%2Fdashboard" className="btn-secondary px-5 py-3 text-base">
              Đăng nhập sinh viên
            </Link>
          </div>
        </div>
        <Image
          src={heroImage}
          alt="Minh hoạ lịch deadline với các ngày đã hoàn thành và sắp đến hạn"
          preload
          placeholder="blur"
          sizes="(min-width: 768px) 50vw, 100vw"
          className="h-auto w-full rounded-3xl"
        />
      </section>

      <section id="mon-hoc" aria-labelledby="mon-hoc-title" className="scroll-mt-20 space-y-6">
        <div>
          <h2 id="mon-hoc-title" className="text-2xl font-bold text-slate-900">
            Môn học
          </h2>
          <p className="text-slate-600">Chọn môn để xem thông tin và các deadline liên quan.</p>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {subjects.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/subjects/${s.slug}`}
                className="card group block h-full overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <Image
                  src={s.image}
                  alt=""
                  width={800}
                  height={450}
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="aspect-video w-full object-cover"
                />
                <div className="space-y-1 p-4">
                  <p className="text-xs font-semibold tracking-wide text-slate-600 uppercase">{s.code}</p>
                  <h3 className="font-semibold text-slate-900 group-hover:text-brand-700">{s.name}</h3>
                  <p className="text-sm text-slate-600">{s.lecturer}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="quyen-title" className="card overflow-hidden">
        <div className="border-b border-slate-200 p-5">
          <h2 id="quyen-title" className="text-xl font-bold text-slate-900">
            Ai được làm gì?
          </h2>
          <p className="text-sm text-slate-600">
            Bảng này được sinh trực tiếp từ hàm <code>can(role, action)</code>, cũng là hàm mà Middleware và
            Server Action dùng để kiểm tra quyền.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th scope="col" className="px-5 py-3">
                  Hành động
                </th>
                {ROLES.map((r) => (
                  <th key={r} scope="col" className="px-5 py-3 text-center">
                    {ROLE_LABELS[r]} <span className="font-normal text-slate-600">({r})</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ACTIONS.map((a) => (
                <tr key={a} className="border-t border-slate-100">
                  <th scope="row" className="px-5 py-3 font-medium text-slate-800">
                    {ACTION_LABELS[a]}
                  </th>
                  {ROLES.map((r) => (
                    <td key={r} className="px-5 py-3 text-center text-lg">
                      {can(r, a) ? (
                        <span className="text-emerald-700" aria-label="Được phép">
                          ✓
                        </span>
                      ) : (
                        <span className="text-rose-700" aria-label="Không được phép">
                          ✗
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
