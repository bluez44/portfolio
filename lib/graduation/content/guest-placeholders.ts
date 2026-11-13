import { DEFAULT_MOMENTS } from "../i18n";
import type { Lang, Moment } from "../i18n/types";
import type { EventTimes } from "./event-vars";
import { flattenTexts } from "./flatten-texts";
import { layerTexts } from "./layer-texts";
import { resolveEventTimes } from "./resolve-event";
import { resolveMoments } from "./resolve-moments";
import type { GraduationSettingsContent } from "./settings-types";

export type GuestPlaceholders = { texts: Record<Lang, Record<string, string>>; moments: Record<Lang, Moment[]>; times: EventTimes };

const byLang = <T>(make: (lang: Lang) => T): Record<Lang, T> => ({ vi: make("vi"), en: make("en") });

export const guestPlaceholders = (settings: GraduationSettingsContent): GuestPlaceholders => ({
  texts: byLang((lang) => flattenTexts(layerTexts(lang, settings))),
  moments: byLang((lang) => resolveMoments({ lang, defaults: DEFAULT_MOMENTS[lang], settings: settings.moments })),
  times: resolveEventTimes(settings.event, undefined),
});
