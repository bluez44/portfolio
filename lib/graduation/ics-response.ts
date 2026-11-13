import type { GraduationEvent } from "./event";
import { buildIcs } from "./ics";
import { toSlug } from "./slug";

export const icsResponse = (event: GraduationEvent, ownerName: string, now = new Date()) =>
  new Response(buildIcs(event, now), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="tot-nghiep-${toSlug(ownerName)}.ics"`,
    },
  });
