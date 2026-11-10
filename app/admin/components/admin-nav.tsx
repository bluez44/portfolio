"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Lượt truy cập (Visitors)", exact: true },
    { href: "/admin/graduation", label: "Quản lý Lễ tốt nghiệp (Graduation)", exact: false },
  ];

  return (
    <nav className="mb-8 flex flex-wrap items-center gap-3 border-b border-zinc-800 pb-4">
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
