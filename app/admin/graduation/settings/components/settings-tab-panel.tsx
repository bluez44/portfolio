"use client";

import type { Dispatch } from "react";
import { COPY_FIELDS } from "@/lib/graduation/content/fields";
import type { GraduationSettingsContent } from "@/lib/graduation/content/settings-types";
import type { Lang, Moment } from "@/lib/graduation/i18n/types";
import type { SettingsDraftAction } from "../draft/settings-draft";
import type { SettingsTab } from "../sections";
import { CopySectionPanel } from "./copy-section-panel";
import { EnvelopeExtras } from "./envelope-extras";
import { EventPanel } from "./event-panel";
import { MetExtras } from "./met-extras";
import { OwnerPanel } from "./owner-panel";

type SettingsTabPanelProps = {
  tab: SettingsTab;
  draft: GraduationSettingsContent;
  defaults: Record<Lang, Record<string, string>>;
  defaultMoments: Record<Lang, Moment[]>;
  envPhone: string | null;
  errors: Record<string, string>;
  dispatch: Dispatch<SettingsDraftAction>;
};

export function SettingsTabPanel({ tab, draft, defaults, defaultMoments, envPhone, errors, dispatch }: SettingsTabPanelProps) {
  if (tab === "owner") return <OwnerPanel owner={draft.owner} envPhone={envPhone} errors={errors} dispatch={dispatch} />;
  if (tab === "event") return <EventPanel event={draft.event} errors={errors} dispatch={dispatch} />;

  return (
    <div className="flex flex-col gap-4">
      {tab === "envelope" && <EnvelopeExtras images={draft.images} dispatch={dispatch} />}
      {tab === "met" && <MetExtras images={draft.images} moments={draft.moments} defaultMoments={defaultMoments} dispatch={dispatch} />}
      <CopySectionPanel fields={COPY_FIELDS.filter((field) => field.section === tab)} copy={draft.copy} defaults={defaults} errors={errors} dispatch={dispatch} />
    </div>
  );
}
