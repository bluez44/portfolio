import { DEFAULT_TEXTS } from "../i18n";
import type { Lang } from "../i18n/types";
import { applyOverrides } from "./apply-overrides";
import type { CopyTexts } from "./copy-texts";
import { GUEST_COPY_FIELDS } from "./fields/guest-keys";
import type { GraduationSettingsContent, GuestContent } from "./settings-types";

export function layerTexts(lang: Lang, settings?: GraduationSettingsContent | null, guest?: GuestContent | null): CopyTexts {
  const shared = applyOverrides(DEFAULT_TEXTS[lang], settings?.copy?.[lang]);
  return applyOverrides(shared, guest?.[lang], GUEST_COPY_FIELDS);
}
