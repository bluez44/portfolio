"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav() {
  const pathname = usePathname();

  const isVisitorsActive = pathname === "/admin";

  const graduationItems = [
    {
      href: "/admin/graduation/guest",
      label: "Khách mời (Guests)",
      active: pathname === "/admin/graduation" || pathname.startsWith("/admin/graduation/guest"),
    },
    {
      href: "/admin/graduation/settings",
      label: "Cài đặt thiệp (Settings)",
      active: pathname.startsWith("/admin/graduation/settings"),
    },
    {
      href: "/admin/graduation/images",
      label: "Quản lý ảnh (Images)",
      active: pathname.startsWith("/admin/graduation/images") || pathname.startsWith("/admin/graduation/media"),
    },
  ];

  return (
    <nav className="mb-8 flex flex-wrap items-center gap-2.5 border-b border-zinc-800 pb-4">
      <Link
        href="/admin"
        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          isVisitorsActive
            ? "bg-white text-zinc-900 shadow-sm"
            : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
        }`}
      >
        Lượt truy cập (Visitors)
      </Link>

      <div className="h-5 w-px bg-zinc-800 mx-1 hidden sm:block" />

      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider px-2 hidden md:inline">
          Lễ tốt nghiệp:
        </span>
        {graduationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
              item.active
                ? "bg-sky-500 text-white shadow-sm font-semibold"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
