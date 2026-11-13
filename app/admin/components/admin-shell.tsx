import type { ReactNode } from "react";
import { AdminNav } from "./admin-nav";

type AdminShellProps = { title: string; description: ReactNode; children: ReactNode };

export function AdminShell({ title, description, children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-zinc-950 p-6 text-white sm:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-400">Hệ thống quản trị và phân phối thiệp mời Lễ tốt nghiệp</p>
        </div>

        <AdminNav />

        <div className="mb-6 flex flex-col gap-1">
          <h2 className="text-xl font-bold text-zinc-100">{title}</h2>
          <p className="text-xs text-zinc-400">{description}</p>
        </div>

        {children}
      </div>
    </div>
  );
}
