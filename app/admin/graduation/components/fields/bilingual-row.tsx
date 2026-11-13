"use client";

import { RotateCcw } from "lucide-react";
import { LANGS } from "@/lib/graduation/i18n/config";
import type { Lang } from "@/lib/graduation/i18n/types";
import { LocalizedInput } from "./localized-input";
import type { RowField } from "./row-field";

type BilingualRowProps = {
  field: RowField;
  values: Record<Lang, string>;
  placeholders: Record<Lang, string>;
  errors?: Partial<Record<Lang, string>>;
  onChange: (lang: Lang, value: string) => void;
  onReset: () => void;
};

export function BilingualRow({ field, values, placeholders, errors, onChange, onReset }: BilingualRowProps) {
  const edited = LANGS.some((lang) => values[lang] !== "");
  return (
    <div className="flex flex-col gap-2 border-b border-zinc-800/70 py-3 last:border-b-0">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
          {edited && <span title="Đã sửa" className="h-1.5 w-1.5 rounded-full bg-sky-400" />}
          {field.label}
        </span>
        {edited && (
          <button type="button" onClick={onReset} className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-200">
            <RotateCcw className="h-3 w-3" /> Về mặc định
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 min-[760px]:grid-cols-2">
        {LANGS.map((lang) => (
          <LocalizedInput
            key={lang}
            lang={lang}
            value={values[lang]}
            placeholder={placeholders[lang]}
            multiline={field.multiline}
            tokens={field.tokens}
            error={errors?.[lang]}
            onChange={(value) => onChange(lang, value)}
          />
        ))}
      </div>
    </div>
  );
}
