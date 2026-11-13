"use client";

import { Plus } from "lucide-react";
import type { SettingsMoment } from "@/lib/graduation/content/settings-types";
import type { Lang, Moment } from "@/lib/graduation/i18n";
import { PANEL_CLASS, SMALL_BUTTON_CLASS } from "./field-classes";
import { MomentEditorCard } from "./moment-editor-card";
import { addMoment, momentsFromResolved, moveMoment, removeMoment, updateMoment } from "./moment-list";

type MomentsEditorProps = {
  moments: readonly SettingsMoment[];
  fallback: Record<Lang, readonly Moment[]>;
  onChange: (next: SettingsMoment[]) => void;
};

export function MomentsEditor({ moments, fallback, onChange }: MomentsEditorProps) {
  if (moments.length === 0) {
    return (
      <div className={`${PANEL_CLASS} flex flex-wrap items-center justify-between gap-2`}>
        <p className="text-xs text-zinc-400">Đang dùng {fallback.vi.length} kỷ niệm có sẵn.</p>
        <button type="button" onClick={() => onChange(momentsFromResolved(fallback))} className={SMALL_BUTTON_CLASS}>
          Tùy chỉnh danh sách kỷ niệm
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {moments.map((moment, index) => (
        <MomentEditorCard
          key={index}
          index={index}
          count={moments.length}
          moment={moment}
          fallback={{ vi: fallback.vi[index], en: fallback.en[index] }}
          onChange={(patch) => onChange(updateMoment(moments, index, patch))}
          onMove={(offset) => onChange(moveMoment(moments, index, offset))}
          onRemove={() => onChange(removeMoment(moments, index))}
        />
      ))}
      <button type="button" onClick={() => onChange(addMoment(moments))} className={`${SMALL_BUTTON_CLASS} self-start`}>
        <Plus className="h-3.5 w-3.5" /> Thêm thẻ kỷ niệm
      </button>
    </div>
  );
}
