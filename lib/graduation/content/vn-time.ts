const VN_OFFSET_MS = 7 * 60 * 60 * 1000;
const LOCAL_INPUT = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

export type VnParts = { year: number; month: number; day: number; weekday: number; hours: number; minutes: number };

export const pad = (value: number) => String(value).padStart(2, "0");

export function vnParts(iso: string): VnParts {
  const shifted = new Date(Date.parse(iso) + VN_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
    weekday: shifted.getUTCDay(),
    hours: shifted.getUTCHours(),
    minutes: shifted.getUTCMinutes(),
  };
}

export function toVnLocalInput(iso: string): string {
  const p = vnParts(iso);
  return `${p.year}-${pad(p.month + 1)}-${pad(p.day)}T${pad(p.hours)}:${pad(p.minutes)}`;
}

export function fromVnLocalInput(local: string): string | null {
  const match = LOCAL_INPUT.exec(local);
  if (!match) return null;
  const [year, month, day, hours, minutes] = match.slice(1).map(Number);
  return new Date(Date.UTC(year, month - 1, day, hours, minutes) - VN_OFFSET_MS).toISOString();
}
