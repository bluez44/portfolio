"use client";

import { Plus, Trash2 } from "lucide-react";
import type { EndsCustomization } from "@/lib/graduation/types";

interface EndsTabProps {
  ends: EndsCustomization;
  onChange: (updated: EndsCustomization) => void;
}

const DEFAULT_NOTES = [
  "Trang phục · Lịch sự",
  "Gửi xe · Cổng Lý Thường Kiệt",
  "Chụp ảnh sau lễ",
];

export function EndsTab({ ends, onChange }: EndsTabProps) {
  const inputClass =
    "w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500";

  const notes = ends.notes && ends.notes.length > 0 ? ends.notes : DEFAULT_NOTES;

  const update = (key: keyof EndsCustomization, val: unknown) => {
    onChange({ ...ends, [key]: val });
  };

  const updateNote = (idx: number, val: string) => {
    const next = [...notes];
    next[idx] = val;
    update("notes", next);
  };

  const removeNote = (idx: number) => {
    const next = notes.filter((_, i) => i !== idx);
    update("notes", next);
  };

  const addNote = () => {
    update("notes", [...notes, ""]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
          1. Tiêu đề mục Buổi lễ (Heading & Intro)
        </h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-3">
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Tiêu đề trước (Lead)</label>
            <input
              type="text"
              value={ends.headingLead || ""}
              onChange={(e) => update("headingLead", e.target.value)}
              placeholder="Mặc định: Và rồi,"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Điểm nhấn (Accent)</label>
            <input
              type="text"
              value={ends.headingAccent || ""}
              onChange={(e) => update("headingAccent", e.target.value)}
              placeholder="Mặc định: tốt nghiệp."
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-400">Đoạn mở đầu (Intro)</label>
          <textarea
            rows={2}
            value={ends.intro || ""}
            onChange={(e) => update("intro", e.target.value)}
            placeholder="Mặc định: Chương này khép lại bằng một buổi lễ..."
            className={inputClass}
          />
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
          2. Thông tin thời gian & địa điểm riêng
        </h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-3">
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Ngày (Date short)</label>
            <input
              type="text"
              value={ends.dateShort || ""}
              onChange={(e) => update("dateShort", e.target.value)}
              placeholder="Mặc định: 19.12"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Khung giờ (Time range)</label>
            <input
              type="text"
              value={ends.timeRange || ""}
              onChange={(e) => update("timeRange", e.target.value)}
              placeholder="Mặc định: 09:00 — 11:30"
              className={inputClass}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-3">
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Địa điểm (Venue)</label>
            <input
              type="text"
              value={ends.venue || ""}
              onChange={(e) => update("venue", e.target.value)}
              placeholder="Mặc định: Hội trường A4, ĐH Bách Khoa"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Địa chỉ cụ thể (Address)</label>
            <input
              type="text"
              value={ends.address || ""}
              onChange={(e) => update("address", e.target.value)}
              placeholder="Mặc định: 268 Lý Thường Kiệt, Phường 14, Quận 10..."
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
          3. Lời dặn / Thông điệp đặc biệt cho khách này
        </h4>
        <div>
          <label className="mb-1 block text-xs text-zinc-400">Thông điệp nổi bật trên vé</label>
          <input
            type="text"
            value={ends.specialMessage || ""}
            onChange={(e) => update("specialMessage", e.target.value)}
            placeholder="Ví dụ: Khi đến cổng hãy gọi cho mình hoặc đi lối cửa phụ số 2 nhé!"
            className={inputClass}
          />
          <p className="mt-1 text-[11px] text-zinc-500">
            Xuất hiện nổi bật như một nhãn thông báo đặc biệt trên vé mời (Ticket Card).
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            4. Các lưu ý đón tiếp (Notes)
          </h4>
          <button
            type="button"
            onClick={addNote}
            className="inline-flex items-center gap-1 rounded bg-zinc-800 px-2 py-0.5 text-xs text-sky-400 hover:bg-zinc-700"
          >
            <Plus className="h-3 w-3" /> Thêm lưu ý
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {notes.map((note, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={note}
                onChange={(e) => updateNote(idx, e.target.value)}
                placeholder="Nội dung lưu ý..."
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => removeNote(idx)}
                className="rounded p-1 text-zinc-500 hover:text-red-400"
                title="Xoá lưu ý"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
