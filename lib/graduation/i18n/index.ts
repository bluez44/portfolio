import { en } from "./copy/en";
import { vi } from "./copy/vi";
import type { GraduationCopy, Lang } from "./types";

export const GRADUATION_COPY: Record<Lang, GraduationCopy> = { vi, en };

export { DEFAULT_LANG, LANG_COOKIE, LANGS, parseLang } from "./config";
export type { Field, GraduationCopy, Heading, Lang, Moment } from "./types";
