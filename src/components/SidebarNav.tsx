"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Tổng quan", icon: "▦" },
  { href: "/dashboard/deadlines", label: "Deadline của tôi", icon: "☑" },
  { href: "/dashboard/profile", label: "Hồ sơ & quyền", icon: "◉" },
];

/** Client Component vì cần usePathname() để tô sáng mục đang mở. */
export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Menu dashboard">
      <ul className="flex gap-1 overflow-x-auto md:flex-col">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition ${
                  active
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
