import { GRADUATION_EVENT, type GraduationEvent } from "../event";
import type { GraduationCopy } from "../i18n/types";
import type { EventTimes, EventVars } from "./event-vars";
import type { EventSettings, GuestContent } from "./settings-types";

const FALLBACK_DURATION_MS = 2 * 60 * 60 * 1000;

export function resolveEventTimes(settings: EventSettings | undefined, guest: GuestContent["event"]): EventTimes {
  const startUtc = guest?.start || settings?.start || GRADUATION_EVENT.startUtc;
  const end = guest?.end || settings?.end || GRADUATION_EVENT.endUtc;
  const endUtc = Date.parse(end) > Date.parse(startUtc) ? end : new Date(Date.parse(startUtc) + FALLBACK_DURATION_MS).toISOString();
  return { startUtc, endUtc };
}

type EventInput = { times: EventTimes; vars: EventVars; copy: GraduationCopy; settings?: EventSettings; musicOverride?: string };

export const resolveEvent = ({ times, vars, copy, settings, musicOverride }: EventInput): GraduationEvent => ({
  title: copy.meta.eventTitle,
  ...times,
  dateShort: vars.dateShort,
  timeRange: vars.time,
  year: vars.year,
  venue: copy.ends.venue,
  address: copy.ends.address,
  mapEmbedUrl: settings?.mapEmbedUrl || GRADUATION_EVENT.mapEmbedUrl,
  mapLinkUrl: settings?.mapLinkUrl || GRADUATION_EVENT.mapLinkUrl,
  virtualTourUrl: settings?.virtualTourUrl || GRADUATION_EVENT.virtualTourUrl,
  virtualTourOwnerUrl: settings?.virtualTourOwnerUrl || GRADUATION_EVENT.virtualTourOwnerUrl,
  musicYoutubeId: musicOverride || settings?.musicYoutubeId || GRADUATION_EVENT.musicYoutubeId,
});
