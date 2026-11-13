"use client";

import type { GuestContent } from "@/lib/graduation/content/settings-types";
import { INPUT_CLASS, LABEL_CLASS, PANEL_CLASS } from "../fields/field-classes";

type MusicCustomization = NonNullable<GuestContent["music"]>;

interface MusicTabProps {
  music: MusicCustomization;
  onChange: (updated: MusicCustomization) => void;
}

export function MusicTab({ music, onChange }: MusicTabProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className={PANEL_CLASS}>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
          Nhạc nền YouTube tùy chỉnh
        </h4>
        <div>
          <label className={LABEL_CLASS}>YouTube Video ID</label>
          <input
            type="text"
            value={music.youtubeId || ""}
            onChange={(e) => onChange({ ...music, youtubeId: e.target.value })}
            placeholder="Ví dụ: dQw4w9WgXcQ (bỏ trống để dùng nhạc mặc định)"
            className={INPUT_CLASS}
          />
          <p className="mt-1 text-[11px] text-zinc-500">
            Dán ID của video YouTube (phần sau ?v= trên link YouTube). Nhạc sẽ phát khi khách nhấn nút bật nhạc trên thiệp.
          </p>
        </div>
      </div>
    </div>
  );
}
