"use client";

import { useReducer, useState, useTransition } from "react";
import { COPY_FIELDS } from "@/lib/graduation/content/fields";
import type { GraduationSettingsContent } from "@/lib/graduation/content/settings-types";
import type { Lang, Moment } from "@/lib/graduation/i18n/types";
import { saveGraduationSettingsAction } from "../actions";
import { countChanges, settingsDraftReducer } from "../draft/settings-draft";
import { filterFields } from "../fields/filter-fields";
import type { SettingsTab } from "../sections";
import { CopySectionPanel } from "./copy-section-panel";
import { FieldSearch } from "./field-search";
import { SaveBar, type SaveStatus } from "./save-bar";
import { SectionNav } from "./section-nav";
import { SettingsTabPanel } from "./settings-tab-panel";
import { useUnsavedGuard } from "./use-unsaved-guard";

type SettingsEditorProps = {
  initial: GraduationSettingsContent;
  defaults: Record<Lang, Record<string, string>>;
  defaultMoments: Record<Lang, Moment[]>;
  envPhone: string | null;
  previewHref?: string;
};

export function SettingsEditor({ initial, defaults, defaultMoments, envPhone, previewHref }: SettingsEditorProps) {
  const [saved, setSaved] = useState(initial);
  const [draft, dispatch] = useReducer(settingsDraftReducer, initial);
  const [tab, setTab] = useState<SettingsTab>("owner");
  const [query, setQuery] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<SaveStatus>(null);
  const [pending, startTransition] = useTransition();

  const changes = countChanges(saved, draft);
  useUnsavedGuard(changes > 0);

  const save = () => {
    const formData = new FormData();
    formData.append("content", JSON.stringify(draft));
    startTransition(async () => {
      const result = await saveGraduationSettingsAction(formData);
      if (result.ok) {
        setSaved(draft);
        setErrors({});
        setStatus({ kind: "saved" });
      } else {
        setErrors(result.fieldErrors);
        setStatus({ kind: "error", message: result.error });
      }
    });
  };

  const searchResults = query.trim()
    ? filterFields(COPY_FIELDS, query, (field) => [defaults.vi[field.key] ?? "", defaults.en[field.key] ?? "", draft.copy?.vi?.[field.key] ?? "", draft.copy?.en?.[field.key] ?? ""])
    : null;

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 min-[760px]:grid-cols-[200px_1fr]">
        <aside className="flex flex-col gap-3 min-[760px]:sticky min-[760px]:top-6 min-[760px]:self-start">
          <FieldSearch value={query} onChange={setQuery} />
          <SectionNav
            active={tab}
            onSelect={(next) => {
              setQuery("");
              setTab(next);
            }}
          />
        </aside>
        <div className="min-w-0">
          {searchResults ? (
            <CopySectionPanel fields={searchResults} copy={draft.copy} defaults={defaults} errors={errors} dispatch={dispatch} />
          ) : (
            <SettingsTabPanel tab={tab} draft={draft} defaults={defaults} defaultMoments={defaultMoments} envPhone={envPhone} errors={errors} dispatch={dispatch} />
          )}
        </div>
      </div>
      <SaveBar changes={changes} pending={pending} status={status} errors={errors} previewHref={previewHref} onSave={save} />
    </div>
  );
}
