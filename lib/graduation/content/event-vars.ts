import type { Lang } from "../i18n/types";
import { pad, vnParts } from "./vn-time";

export type EventTimes = { startUtc: string; endUtc: string };
export type EventVars = { date: string; dateShort: string; year: string; weekday: string; weekdayShort: string; time: string };

const WEEKDAYS: Record<Lang, { long: readonly string[]; short: readonly string[] }> = {
  vi: {
    long: ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"],
    short: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
  },
  en: {
    long: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    short: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  },
};
const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function eventVars({ startUtc, endUtc }: EventTimes, lang: Lang): EventVars {
  const start = vnParts(startUtc);
  const end = vnParts(endUtc);
  const dateShort = `${pad(start.day)}.${pad(start.month + 1)}`;
  return {
    date: lang === "vi" ? dateShort : `${EN_MONTHS[start.month]} ${start.day}`,
    dateShort,
    year: String(start.year),
    weekday: WEEKDAYS[lang].long[start.weekday],
    weekdayShort: WEEKDAYS[lang].short[start.weekday],
    time: `${pad(start.hours)}:${pad(start.minutes)} — ${pad(end.hours)}:${pad(end.minutes)}`,
  };
}
