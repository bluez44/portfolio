import type { CopyField } from "./types";

export const STATIC_VARS = ["owner", "initials", "date", "year", "weekday", "weekdayShort", "time"] as const;
export type StaticVar = (typeof STATIC_VARS)[number];

export const allowedTokens = (field: Pick<CopyField, "call">): string[] =>
  field.call ? [...STATIC_VARS, field.call] : [...STATIC_VARS];
