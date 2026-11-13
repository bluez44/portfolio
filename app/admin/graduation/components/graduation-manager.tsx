"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Filter } from "lucide-react";
import type { GuestPlaceholders } from "@/lib/graduation/content/guest-placeholders";
import type { GuestListItem } from "@/lib/graduation/types";
import { GuestStatsCards } from "./guest-stats-cards";
import { GuestTable } from "./guest-table";
import { GuestEditorDialog } from "./guest-editor-dialog";

export function GraduationManager({ initialGuests, placeholders }: { initialGuests: GuestListItem[]; placeholders: GuestPlaceholders }) {
  const [search, setSearch] = useState("");
  const [filterRsvp, setFilterRsvp] = useState<"all" | "yes" | "no" | "pending">("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    return initialGuests.filter((g) => {
      const matchSearch =
        search === "" ||
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.slug.toLowerCase().includes(search.toLowerCase()) ||
        g.id.toLowerCase().includes(search.toLowerCase());

      const matchRsvp =
        filterRsvp === "all" ||
        (filterRsvp === "yes" && g.rsvpStatus === "yes") ||
        (filterRsvp === "no" && g.rsvpStatus === "no") ||
        (filterRsvp === "pending" && !g.rsvpStatus);

      return matchSearch && matchRsvp;
    });
  }, [initialGuests, search, filterRsvp]);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Stats */}
      <GuestStatsCards guests={initialGuests} />

      {/* Control Bar: Search, Filter, Add */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, slug, ID..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-zinc-600"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-zinc-500 hidden sm:block" />
            <select
              value={filterRsvp}
              onChange={(e) =>
                setFilterRsvp(e.target.value as "all" | "yes" | "no" | "pending")
              }
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-2 text-xs text-zinc-300 outline-none focus:border-zinc-600"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="yes">Sẽ tham dự</option>
              <option value="no">Không tham dự</option>
              <option value="pending">Chưa phản hồi</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-zinc-950 shadow hover:bg-zinc-200 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Thêm khách mời mới
        </button>
      </div>

      {/* Guest Table */}
      <GuestTable guests={filtered} placeholders={placeholders} />

      {/* Create Dialog */}
      {isCreateOpen && (
        <GuestEditorDialog
          isOpen={isCreateOpen}
          placeholders={placeholders}
          onClose={() => setIsCreateOpen(false)}
        />
      )}
    </div>
  );
}
