import type { GraduationEvent } from "./event";

const toIcsDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const escapeText = (s: string) => s.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");

export function buildIcs(event: GraduationEvent, stamp: Date): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//QV//Graduation//VI",
    "BEGIN:VEVENT",
    "UID:qv-graduation-2026@vinhvolequang.io.vn",
    `DTSTAMP:${toIcsDate(stamp)}`,
    `DTSTART:${toIcsDate(new Date(event.startUtc))}`,
    `DTEND:${toIcsDate(new Date(event.endUtc))}`,
    `SUMMARY:${escapeText(event.title)}`,
    `LOCATION:${escapeText(`${event.venue}, ${event.address}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
