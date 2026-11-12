import { GRADUATION_EVENT } from "@/lib/graduation/event";
import { buildIcs } from "@/lib/graduation/ics";

export function GET() {
  return new Response(buildIcs(GRADUATION_EVENT, new Date()), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="tot-nghiep-quang-vinh.ics"',
    },
  });
}
