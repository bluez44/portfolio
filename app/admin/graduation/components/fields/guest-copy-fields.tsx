"use client";

import { COPY_FIELD_BY_KEY } from "@/lib/graduation/content/fields";
import { setOverride } from "@/lib/graduation/content/overrides";
import type { GuestContent } from "@/lib/graduation/content/settings-types";
import type { Lang } from "@/lib/graduation/i18n/types";
import { BilingualRow } from "./bilingual-row";
import { PANEL_CLASS } from "./field-classes";
import { toRowField } from "./row-field";

type GuestCopyFieldsProps = {
  keys: readonly string[];
  content: GuestContent;
  placeholders: Record<Lang, Record<string, string>>;
  onChange: (next: GuestContent) => void;
};

export function GuestCopyFields({ keys, content, placeholders, onChange }: GuestCopyFieldsProps) {
  const fields = keys.flatMap((key) => {
    const field = COPY_FIELD_BY_KEY.get(key);
    return field ? [field] : [];
  });

  return (
    <div className={PANEL_CLASS}>
      {fields.map((field) => (
        <BilingualRow
          key={field.key}
          field={toRowField(field)}
          values={{ vi: content.vi?.[field.key] ?? "", en: content.en?.[field.key] ?? "" }}
          placeholders={{ vi: placeholders.vi[field.key] ?? "", en: placeholders.en[field.key] ?? "" }}
          onChange={(lang, value) => onChange({ ...content, [lang]: setOverride(content[lang], field.key, value) })}
          onReset={() => onChange({ ...content, vi: setOverride(content.vi, field.key, ""), en: setOverride(content.en, field.key, "") })}
        />
      ))}
    </div>
  );
}
