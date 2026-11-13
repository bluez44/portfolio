"use client";

import type { Dispatch } from "react";
import type { CopyField } from "@/lib/graduation/content/fields";
import type { GraduationSettingsContent } from "@/lib/graduation/content/settings-types";
import type { Lang } from "@/lib/graduation/i18n/types";
import { BilingualRow } from "../../components/fields/bilingual-row";
import { GROUP_TITLE_CLASS, PANEL_CLASS } from "../../components/fields/field-classes";
import { toRowField } from "../../components/fields/row-field";
import type { SettingsDraftAction } from "../draft/settings-draft";
import { groupFields } from "../fields/group-fields";

type CopySectionPanelProps = {
  fields: readonly CopyField[];
  copy: GraduationSettingsContent["copy"];
  defaults: Record<Lang, Record<string, string>>;
  errors: Record<string, string>;
  dispatch: Dispatch<SettingsDraftAction>;
};

export function CopySectionPanel({ fields, copy, defaults, errors, dispatch }: CopySectionPanelProps) {
  if (fields.length === 0) return <p className="text-xs text-zinc-500">Không có trường nào khớp.</p>;

  return (
    <div className="flex flex-col gap-4">
      {groupFields(fields).map((group, index) => (
        <section key={`${group.title}-${index}`} className={PANEL_CLASS}>
          {group.title && <h4 className={GROUP_TITLE_CLASS}>{group.title}</h4>}
          {group.fields.map((field) => (
            <BilingualRow
              key={field.key}
              field={toRowField(field)}
              values={{ vi: copy?.vi?.[field.key] ?? "", en: copy?.en?.[field.key] ?? "" }}
              placeholders={{ vi: defaults.vi[field.key] ?? "", en: defaults.en[field.key] ?? "" }}
              errors={{ vi: errors[`copy.vi.${field.key}`], en: errors[`copy.en.${field.key}`] }}
              onChange={(lang, value) => dispatch({ type: "copy", lang, key: field.key, value })}
              onReset={() => dispatch({ type: "resetCopy", key: field.key })}
            />
          ))}
        </section>
      ))}
    </div>
  );
}
