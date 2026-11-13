import { LANGS } from "../i18n/config";
import { GUEST_COPY_TABS } from "./fields/guest-keys";
import type { GuestContent } from "./settings-types";

export type GuestContentSummary = { envelope: boolean; met: boolean; moments: number; ends: boolean; music: boolean };

const hasText = (content: GuestContent, keys: readonly string[]) => LANGS.some((lang) => keys.some((key) => Boolean(content[lang]?.[key])));

export function summarizeGuestContent(content: GuestContent | null): GuestContentSummary {
  const moments = content?.moments?.length ?? 0;
  if (!content) return { envelope: false, met: false, moments, ends: false, music: false };
  return {
    envelope: hasText(content, GUEST_COPY_TABS.envelope) || Boolean(content.images?.coverImage),
    met: hasText(content, GUEST_COPY_TABS.met) || Boolean(content.images?.togetherPhoto) || moments > 0,
    moments,
    ends: hasText(content, GUEST_COPY_TABS.ends) || Boolean(content.event?.start || content.event?.end),
    music: Boolean(content.music?.youtubeId),
  };
}
