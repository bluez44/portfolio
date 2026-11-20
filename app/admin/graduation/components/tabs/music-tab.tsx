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
          Nhạc nền tuỳ chỉnh
        </h4>
        <div>
          <label className={LABEL_CLASS}>Đường dẫn file nhạc</label>
          <input
            type="text"
            value={music.track || ""}
            onChange={(e) => onChange({ ...music, track: e.target.value })}
            placeholder="audio/ten-file.mp3 (bỏ trống để dùng nhạc mặc định)"
            className={INPUT_CLASS}
          />
          <p className="mt-1 text-[11px] text-zinc-500">
            Đường dẫn file mp3/m4a trong Vercel Blob. Nhạc sẽ phát khi khách nhấn nút bật nhạc trên thiệp.
          </p>
        </div>
      </div>
    </div>
  );
}
