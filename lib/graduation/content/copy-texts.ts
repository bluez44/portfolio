import type { GraduationCopy } from "../i18n/types";

type Templated<T> = T extends (...args: never[]) => string
  ? string
  : T extends readonly string[]
    ? string[]
    : T extends object
      ? { [K in keyof T]-?: Templated<NonNullable<T[K]>> }
      : T;

type CopyShape = Omit<GraduationCopy, "met" | "card"> & {
  met: Omit<GraduationCopy["met"], "moments">;
  card: Omit<GraduationCopy["card"], "coverImage">;
};

export type CopyTexts = Templated<CopyShape>;
