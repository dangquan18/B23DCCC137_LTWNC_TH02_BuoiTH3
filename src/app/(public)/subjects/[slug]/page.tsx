import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubject, getSubjects } from "@/lib/db";

// SSG: sinh sẵn 4 trang môn học lúc build. Slug lạ → 404 (không render thêm lúc runtime).
export const dynamicParams = false;

export async function generateStaticParams() {
  const subjects = await getSubjects();
  return subjects.map((s) => ({ slug: s.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const subject = await getSubject(slug);
  if (!subject) return {};
  return {
    title: `${subject.name} (${subject.code})`,
    description: subject.description,
    alternates: { canonical: `/subjects/${subject.slug}` },
    openGraph: {
      title: `${subject.name} (${subject.code})`,
      description: subject.description,
      url: `/subjects/${subject.slug}`,
      images: [{ url: subject.image, width: 800, height: 450, alt: subject.name }],
    },
  };
}

export default async function SubjectPage({ params }: Props) {
  const { slug } = await params;
  const subject = await getSubject(slug);
  if (!subject) notFound();

  return (
    <article className="space-y-8">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
        <Link href="/" className="hover:underline">
          Trang chủ
        </Link>{" "}
        / <Link href="/#mon-hoc" className="hover:underline">Môn học</Link> /{" "}
        <span className="text-slate-900">{subject.name}</span>
      </nav>

      <header className="card overflow-hidden md:grid md:grid-cols-2">
        <Image
          src={subject.image}
          alt={`Ảnh bìa môn ${subject.name}`}
          width={800}
          height={450}
          preload
          sizes="(min-width: 768px) 50vw, 100vw"
          className="aspect-video h-full w-full object-cover"
        />
        <div className="space-y-3 p-6">
          <p className="text-sm font-semibold tracking-wide uppercase" style={{ color: subject.color }}>
            {subject.code} · {subject.credits} tín chỉ
          </p>
          <h1 className="text-3xl font-bold text-slate-900">{subject.name}</h1>
          <p className="text-slate-700">{subject.description}</p>
          <Link href={`/deadlines?mon=${subject.slug}`} className="btn-primary">
            Xem deadline môn này →
          </Link>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <section aria-labelledby="info" className="card p-6">
          <h2 id="info" className="mb-4 text-lg font-semibold text-slate-900">
            Thông tin lớp học
          </h2>
          <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-3 text-sm">
            <dt className="text-slate-600">Giảng viên</dt>
            <dd className="font-medium text-slate-900">{subject.lecturer}</dd>
            <dt className="text-slate-600">Lịch học</dt>
            <dd className="font-medium text-slate-900">{subject.schedule}</dd>
            <dt className="text-slate-600">Phòng</dt>
            <dd className="font-medium text-slate-900">{subject.room}</dd>
            <dt className="text-slate-600">Số tín chỉ</dt>
            <dd className="font-medium text-slate-900">{subject.credits}</dd>
          </dl>
        </section>

        <section aria-labelledby="grading" className="card p-6">
          <h2 id="grading" className="mb-4 text-lg font-semibold text-slate-900">
            Cách tính điểm
          </h2>
          <ul className="space-y-3">
            {subject.grading.map((g) => (
              <li key={g.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-700">{g.label}</span>
                  <span className="font-semibold text-slate-900">{g.weight}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${g.weight}%`, backgroundColor: subject.color }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  );
}
