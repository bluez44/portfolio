import { isRecord } from "@/lib/graduation/content/is-record";
import { setOverride } from "@/lib/graduation/content/overrides";
import type {
  EventSettings,
  GraduationSettingsContent,
  ImageSettings,
  OwnerSettings,
  SettingsMoment,
} from "@/lib/graduation/content/settings-types";
import { LANGS } from "@/lib/graduation/i18n/config";
import type { Lang } from "@/lib/graduation/i18n/types";

export type SettingsDraftAction =
  | { type: "copy"; lang: Lang; key: string; value: string }
  | { type: "resetCopy"; key: string }
  | { type: "owner"; key: keyof OwnerSettings; value: string }
  | { type: "event"; key: keyof EventSettings; value: string | undefined }
  | { type: "image"; key: keyof ImageSettings; value: string }
  | { type: "moments"; value: SettingsMoment[] };

const setField = <T extends object>(target: T | undefined, key: keyof T, value: string | undefined): T =>
  ({ ...target, [key]: value ? value : undefined }) as T;

export function settingsDraftReducer(state: GraduationSettingsContent, action: SettingsDraftAction): GraduationSettingsContent {
  switch (action.type) {
    case "copy":
      return { ...state, copy: { ...state.copy, [action.lang]: setOverride(state.copy?.[action.lang], action.key, action.value) } };
    case "resetCopy":
      return { ...state, copy: Object.fromEntries(LANGS.map((lang) => [lang, setOverride(state.copy?.[lang], action.key, "")])) };
    case "owner":
      return { ...state, owner: setField(state.owner, action.key, action.value) };
    case "event":
      return { ...state, event: setField(state.event, action.key, action.value) };
    case "image":
      return { ...state, images: setField(state.images, action.key, action.value) };
    case "moments":
      return { ...state, moments: action.value };
  }
}

function collect(value: unknown, path: string, out: Record<string, string>) {
  if (Array.isArray(value)) {
    if (value.length > 0) out[path] = JSON.stringify(value);
  } else if (isRecord(value)) {
    for (const [key, child] of Object.entries(value)) collect(child, path ? `${path}.${key}` : key, out);
  } else if (typeof value === "string" && value !== "") {
    out[path] = value;
  }
}

export function settingsLeaves(content: GraduationSettingsContent): Record<string, string> {
  const out: Record<string, string> = {};
  collect(content, "", out);
  return out;
}

export function countChanges(saved: GraduationSettingsContent, draft: GraduationSettingsContent): number {
  const before = settingsLeaves(saved);
  const after = settingsLeaves(draft);
  return [...new Set([...Object.keys(before), ...Object.keys(after)])].filter((key) => before[key] !== after[key]).length;
}
