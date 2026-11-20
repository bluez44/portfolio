import { openedCardScale } from "../../envelope/opened-card";
import type { BeatSlots } from "./beats";
import { measureEnvelopeWidth } from "./measure-sections";
import { besideX, envelopeSideX } from "./placement";
import type { CharacterProfile } from "./profile";

/**
 * Where the character stands beside the opened envelope (`sx`) and the grown note (`cheerX`),
 * measured from the page, or the profile's fixed slots on phones.
 */
export function beatSlots(profile: CharacterProfile, view: { halfW: number; scale: number }, noteW: number | undefined): BeatSlots {
  if (profile.slots) return { sx: profile.slots.side, cheerX: profile.slots.cheer, farewellX: profile.slots.farewell };
  const viewportW = window.innerWidth;
  const sx = envelopeSideX({ viewportW, envelopeW: measureEnvelopeWidth(), cardScale: openedCardScale(), ...view });
  return { sx, cheerX: noteW ? besideX({ viewportW, objectW: noteW, ...view }) : undefined };
}
