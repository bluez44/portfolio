"use client";

import { Users, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { GuestListItem } from "@/lib/graduation/types";

export function GuestStatsCards({ guests }: { guests: GuestListItem[] }) {
  const total = guests.length;
  const yes = guests.filter((g) => g.rsvpStatus === "yes").length;
  const no = guests.filter((g) => g.rsvpStatus === "no").length;
  const pending = total - yes - no;

  const cards = [
    {
      label: "Tổng khách mời",
      value: total,
      icon: <Users className="h-5 w-5 text-zinc-400" />,
      color: "border-zinc-800 bg-zinc-900/60",
    },
    {
      label: "Sẽ tham dự",
      value: yes,
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
      color: "border-emerald-900/40 bg-emerald-950/20 text-emerald-400",
    },
    {
      label: "Không tham dự",
      value: no,
      icon: <XCircle className="h-5 w-5 text-red-400" />,
      color: "border-red-900/40 bg-red-950/20 text-red-400",
    },
    {
      label: "Chưa phản hồi",
      value: pending,
      icon: <Clock className="h-5 w-5 text-amber-400" />,
      color: "border-amber-900/40 bg-amber-950/20 text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`flex items-center justify-between rounded-xl border p-4 shadow-sm ${card.color}`}
        >
          <div>
            <p className="text-xs font-medium text-zinc-400">{card.label}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-white">{card.value}</p>
          </div>
          <div className="rounded-lg bg-zinc-800/80 p-2.5">{card.icon}</div>
        </div>
      ))}
    </div>
  );
}
