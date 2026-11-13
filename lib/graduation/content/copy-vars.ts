import type { Lang } from "../i18n/types";
import { eventVars, type EventTimes, type EventVars } from "./event-vars";

export type OwnerVars = { name: string; initials: string };
export type CopyVars = EventVars & { owner: string; initials: string };

export const copyVars = (lang: Lang, times: EventTimes, owner: OwnerVars): CopyVars => ({
  ...eventVars(times, lang),
  owner: owner.name,
  initials: owner.initials,
});
