"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import type { SettingsMoment } from "@/lib/graduation/content/settings-types";
import type { RisoColor } from "@/lib/graduation/event";
import type { Lang, Moment, MomentText } from "@/lib/graduation/i18n";
import { ImageUploader } from "../image-uploader";
import { BilingualRow } from "./bilingual-row";
import { INPUT_CLASS, LABEL_CLASS, SMALL_BUTTON_CLASS } from "./field-classes";
import { setMomentText } from "./moment-list";
import { PlainField } from "./plain-field";
import { RISO_COLOR_OPTIONS } from "./riso-color-options";

const TEXT_PARTS: readonly { part: keyof MomentText; label: string; multiline: boolean }[] = [
  { part: "title", label: "Tiêu đề", multiline: false },
  { part: "body", label: "Nội dung", multiline: true },
];

type MomentEditorCardProps = {
  index: number;
  count: number;
  moment: SettingsMoment;
  fallback: Record<Lang, Moment | undefined>;
  onChange: (patch: Partial<SettingsMoment>) => void;
  onMove: (offset: -1 | 1) => void;
  onRemove: () => void;
};

export function MomentEditorCard({ index, count, moment, fallback, onChange, onMove, onRemove }: MomentEditorCardProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3.5">
      <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-2">
        <span className="font-mono text-xs font-bold text-sky-400">Thẻ #{index + 1}</span>
        <div className="flex items-center gap-1.5">
          <button type="button" aria-label="Lên" disabled={index === 0} onClick={() => onMove(-1)} className={SMALL_BUTTON_CLASS}>
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button type="button" aria-label="Xuống" disabled={index === count - 1} onClick={() => onMove(1)} className={SMALL_BUTTON_CLASS}>
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={onRemove} className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-red-400">
            <Trash2 className="h-3.5 w-3.5" /> Xóa
          </button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <PlainField label="Năm" value={moment.year} placeholder={fallback.vi?.year} onChange={(year) => onChange({ year })} />
        <label className="block">
          <span className={LABEL_CLASS}>Màu nhấn</span>
          <select
            value={moment.color ?? ""}
            onChange={(event) => onChange({ color: (event.target.value || undefined) as RisoColor | undefined })}
            className={INPUT_CLASS}
          >
            <option value="">Tự động</option>
            {RISO_COLOR_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ImageUploader label="Ảnh thẻ kỷ niệm" value={moment.image} onChange={(image) => onChange({ image })} helperText="Bỏ trống để dùng ảnh mặc định của thẻ này" />

      {TEXT_PARTS.map(({ part, label, multiline }) => (
        <BilingualRow
          key={part}
          field={{ key: `moment-${index}-${part}`, label, multiline, tokens: [] }}
          values={{ vi: moment.vi?.[part] ?? "", en: moment.en?.[part] ?? "" }}
          placeholders={{ vi: fallback.vi?.[part] ?? "", en: fallback.en?.[part] ?? "" }}
          onChange={(lang, value) => onChange(setMomentText(moment, lang, part, value))}
          onReset={() => onChange(setMomentText(setMomentText(moment, "vi", part, ""), "en", part, ""))}
        />
      ))}
    </div>
  );
}
