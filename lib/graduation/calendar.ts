import { eventLocation, type GraduationEvent } from "./event";
import { toIcsDate } from "./ics";

export type CalendarTarget = "apple" | "google";

export const ICS_PATH = "/graduation/calendar.ics";

export function calendarLinks(event: GraduationEvent): Record<CalendarTarget, string> {
  const dates = `${toIcsDate(new Date(event.startUtc))}/${toIcsDate(new Date(event.endUtc))}`;
  const google =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(event.title)}` +
    `&dates=${dates}` +
    `&location=${encodeURIComponent(eventLocation(event))}`;
  return { google, apple: ICS_PATH };
}
