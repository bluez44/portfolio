import type { GraduationCopy, Moment } from "../i18n/types";
import { buildCopy } from "./build-copy";
import type { CopyTexts } from "./copy-texts";
import { COPY_FIELDS } from "./fields";
import type { Tree } from "./paths";
import type { TemplateVars } from "./template";

export function composeCopy(texts: CopyTexts, moments: Moment[], vars: TemplateVars, coverImage?: string): GraduationCopy {
  const built = buildCopy(texts as unknown as Tree, COPY_FIELDS, vars) as unknown as GraduationCopy;
  return { ...built, met: { ...built.met, moments }, card: { ...built.card, coverImage } };
}
