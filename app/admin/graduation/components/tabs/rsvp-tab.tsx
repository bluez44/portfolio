"use client";

import type { RsvpCustomization } from "@/lib/graduation/types";

interface RsvpTabProps {
  rsvp: RsvpCustomization;
  onChange: (updated: RsvpCustomization) => void;
}

export function RsvpTab({ rsvp, onChange }: RsvpTabProps) {
  const inputClass =
    "w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500";

  const update = (key: keyof RsvpCustomization, val: string) => {
    onChange({ ...rsvp, [key]: val });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
          1. Tiêu đề mục RSVP
        </h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Tiêu đề trước (Lead)</label>
            <input
              type="text"
              value={rsvp.headingLead || ""}
              onChange={(e) => update("headingLead", e.target.value)}
              placeholder="Mặc định: Bạn sẽ"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Điểm nhấn (Accent)</label>
            <input
              type="text"
              value={rsvp.headingAccent || ""}
              onChange={(e) => update("headingAccent", e.target.value)}
              placeholder="Mặc định: đến chứ?"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
          2. Câu hỏi mời riêng
        </h4>
        <textarea
          rows={2}
          value={rsvp.prompt || ""}
          onChange={(e) => update("prompt", e.target.value)}
          placeholder="Mặc định dùng câu hỏi chung kèm tên khách. Nhập để thay bằng lời mời riêng cho khách này."
          className={inputClass}
        />
        <p className="mt-1 text-[11px] text-zinc-500">
          Hiển thị ngay phía trên hai nút &ldquo;Sẽ đến / Không đến&rdquo;.
        </p>
      </div>
    </div>
  );
}
