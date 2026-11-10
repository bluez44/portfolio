import type { GraduationCopy } from "./i18n/types";
import type { GuestCustomContent } from "./types";
import type { GraduationEvent, RisoColor } from "./event";

const DEFAULT_COLORS: RisoColor[] = ["tomato", "blue", "jade", "canary"];
const DEFAULT_ROTS = [-1.6, 1.4, -1.2, 1.8];

export function resolveInvitationCopy(
  baseCopy: GraduationCopy,
  event: GraduationEvent,
  custom: GuestCustomContent | null | undefined,
): { copy: GraduationCopy; event: GraduationEvent } {
  if (!custom) return { copy: baseCopy, event };

  const copy: GraduationCopy = {
    ...baseCopy,
    card: {
      ...baseCopy.card,
      greeting: custom.envelope?.cardGreeting || baseCopy.card.greeting,
      body: custom.envelope?.cardBody || baseCopy.card.body,
      author: custom.envelope?.cardAuthor,
      coverImage: custom.envelope?.coverImage,
    },
    stage: {
      ...baseCopy.stage,
      cover: {
        lead: custom.envelope?.coverLead || baseCopy.stage.cover.lead,
        accent: custom.envelope?.coverAccent || baseCopy.stage.cover.accent,
      },
    },
    met: {
      ...baseCopy.met,
      heading: {
        lead: custom.met?.headingLead || baseCopy.met.heading.lead,
        accent: custom.met?.headingAccent || baseCopy.met.heading.accent,
      },
      intro: custom.met?.intro || baseCopy.met.intro,
      defaultNote: custom.met?.note || baseCopy.met.defaultNote,
      moments:
        custom.met?.moments && custom.met.moments.length > 0
          ? custom.met.moments.map((m, idx) => ({
              n: m.n || String(idx + 1).padStart(2, "0"),
              year: m.year,
              title: m.title,
              body: m.body,
              image: m.image,
              color: m.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
              rot: m.rot ?? DEFAULT_ROTS[idx % DEFAULT_ROTS.length],
            }))
          : baseCopy.met.moments,
    },
    ends: {
      ...baseCopy.ends,
      heading: {
        lead: custom.ends?.headingLead || baseCopy.ends.heading.lead,
        accent: custom.ends?.headingAccent || baseCopy.ends.heading.accent,
      },
      intro: custom.ends?.intro || baseCopy.ends.intro,
      day: custom.ends?.dateShort
        ? `${custom.ends.dateShort} · ${custom.ends.timeRange || ""}`
        : baseCopy.ends.day,
      venue: custom.ends?.venue || baseCopy.ends.venue,
      venueSub: custom.ends?.address || baseCopy.ends.venueSub,
      notes:
        custom.ends?.notes && custom.ends.notes.length > 0
          ? custom.ends.notes
          : baseCopy.ends.notes,
      specialMessage: custom.ends?.specialMessage,
    },
  };

  const resolvedEvent: GraduationEvent = {
    ...event,
    dateShort: custom.ends?.dateShort || event.dateShort,
    timeRange: custom.ends?.timeRange || event.timeRange,
    venue: custom.ends?.venue || event.venue,
    address: custom.ends?.address || event.address,
    musicYoutubeId: custom.music?.youtubeId || event.musicYoutubeId,
  };

  return { copy, event: resolvedEvent };
}
