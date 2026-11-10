"use client";

import type { MusicCustomization } from "@/lib/graduation/types";

interface MusicTabProps {
  music: MusicCustomization;
  onChange: (updated: MusicCustomization) => void;
}

export function MusicTab({ music, onChange }: MusicTabProps) {
  const inputClass =
    "w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500";

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
          Nhạc nền YouTube tùy chỉnh
        </h4>
        <div>
          <label className="mb-1 block text-xs text-zinc-400">YouTube Video ID</label>
          <input
            type="text"
            value={music.youtubeId || ""}
            onChange={(e) => onChange({ ...music, youtubeId: e.target.value })}
            placeholder="Ví dụ: dQw4w9WgXcQ (bỏ trống để dùng nhạc mặc định)"
            className={inputClass}
          />
          <p className="mt-1 text-[11px] text-zinc-500">
            Dán ID của video YouTube (phần sau ?v= trên link YouTube). Nhạc sẽ phát khi khách nhấn nút bật nhạc trên thiệp.
          </p>
        </div>
      </div>
    </div>
  );
}
