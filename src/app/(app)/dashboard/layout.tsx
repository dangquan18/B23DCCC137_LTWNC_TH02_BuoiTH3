import { SidebarNav } from "@/components/SidebarNav";

/** Layout lồng nhau của /dashboard: sidebar cố định + nội dung trang con. */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
      <aside className="md:sticky md:top-24 md:self-start">
        <div className="card p-3">
          <p className="mb-2 px-3 text-xs font-semibold tracking-wide text-slate-600 uppercase">Dashboard</p>
          <SidebarNav />
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
