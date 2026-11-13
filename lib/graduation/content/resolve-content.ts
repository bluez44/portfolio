import type { GraduationEvent } from "../event";
import { DEFAULT_MOMENTS } from "../i18n";
import type { GraduationCopy, Lang } from "../i18n/types";
import { composeCopy } from "./compose-copy";
import { copyVars } from "./copy-vars";
import { layerTexts } from "./layer-texts";
import { resolveEvent, resolveEventTimes } from "./resolve-event";
import { resolveImages, type ResolvedImages } from "./resolve-images";
import { resolveMoments } from "./resolve-moments";
import { resolveOwner, type ResolvedOwner } from "./resolve-owner";
import type { GraduationSettingsContent, GuestContent } from "./settings-types";

export type ResolveInput = {
  lang: Lang;
  settings?: GraduationSettingsContent | null;
  guest?: GuestContent | null;
  envPhone?: string | null;
};

export type ResolvedContent = { copy: GraduationCopy; event: GraduationEvent; owner: ResolvedOwner; images: ResolvedImages };

export function resolveGraduationContent({ lang, settings, guest, envPhone = null }: ResolveInput): ResolvedContent {
  const owner = resolveOwner(settings?.owner, envPhone);
  const images = resolveImages(settings?.images, guest?.images);
  const times = resolveEventTimes(settings?.event, guest?.event);
  const vars = copyVars(lang, times, owner);
  const moments = resolveMoments({ lang, defaults: DEFAULT_MOMENTS[lang], settings: settings?.moments, guest: guest?.moments });
  const copy = composeCopy(layerTexts(lang, settings, guest), moments, vars, images.coverImage);
  const event = resolveEvent({ times, vars, copy, settings: settings?.event, musicOverride: guest?.music?.youtubeId });
  return { copy, event, owner, images };
}
