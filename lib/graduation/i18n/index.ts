import type { CopyTexts } from "../content/copy-texts";
import { enMomentTexts, enTexts } from "./copy/en";
import { viMomentTexts, viTexts } from "./copy/vi";
import { withMomentStyle } from "./moments";
import type { Lang, Moment, MomentText } from "./types";

export const DEFAULT_TEXTS: Record<Lang, CopyTexts> = { vi: viTexts, en: enTexts };
export const DEFAULT_MOMENT_TEXTS: Record<Lang, MomentText[]> = { vi: viMomentTexts, en: enMomentTexts };
export const DEFAULT_MOMENTS: Record<Lang, Moment[]> = { vi: withMomentStyle(viMomentTexts), en: withMomentStyle(enMomentTexts) };

export { DEFAULT_LANG, LANG_COOKIE, LANGS, parseLang } from "./config";
export type { Credit, Field, GraduationCopy, GuideTab, Heading, Lang, Moment, MomentText, VenueGuideCopy } from "./types";
