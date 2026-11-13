import { composeCopy } from "../content/compose-copy";
import type { CopyTexts } from "../content/copy-texts";
import { copyVars } from "../content/copy-vars";
import { DEFAULT_OWNER } from "../content/defaults";
import { GRADUATION_EVENT } from "../event";
import { enMomentTexts, enTexts } from "./copy/en";
import { viMomentTexts, viTexts } from "./copy/vi";
import { withMomentStyle } from "./moments";
import type { GraduationCopy, Lang, Moment, MomentText } from "./types";

export const DEFAULT_TEXTS: Record<Lang, CopyTexts> = { vi: viTexts, en: enTexts };
export const DEFAULT_MOMENT_TEXTS: Record<Lang, MomentText[]> = { vi: viMomentTexts, en: enMomentTexts };
export const DEFAULT_MOMENTS: Record<Lang, Moment[]> = { vi: withMomentStyle(viMomentTexts), en: withMomentStyle(enMomentTexts) };

const defaultCopy = (lang: Lang): GraduationCopy =>
  composeCopy(DEFAULT_TEXTS[lang], DEFAULT_MOMENTS[lang], copyVars(lang, GRADUATION_EVENT, DEFAULT_OWNER));

export const GRADUATION_COPY: Record<Lang, GraduationCopy> = { vi: defaultCopy("vi"), en: defaultCopy("en") };

export { DEFAULT_LANG, LANG_COOKIE, LANGS, parseLang } from "./config";
export type { Credit, Field, GraduationCopy, GuideTab, Heading, Lang, Moment, MomentText, VenueGuideCopy } from "./types";
