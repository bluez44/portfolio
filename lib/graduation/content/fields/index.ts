import { ENDS_FIELDS } from "./ends";
import { ENVELOPE_FIELDS } from "./envelope";
import { FINALE_FIELDS } from "./finale";
import { GATE_FIELDS } from "./gate";
import { GUIDE_FIELDS } from "./guide";
import { HEADER_FIELDS } from "./header";
import { META_FIELDS } from "./meta";
import { MET_FIELDS } from "./met";
import { MISC_FIELDS } from "./misc";
import { NARRATOR_FIELDS } from "./narrator";
import { PNG_FIELDS } from "./png";
import { RSVP_FIELDS } from "./rsvp";
import type { CopyField } from "./types";
import { WISHES_FIELDS } from "./wishes";

export const COPY_FIELDS: readonly CopyField[] = [
  ...GATE_FIELDS,
  ...HEADER_FIELDS,
  ...ENVELOPE_FIELDS,
  ...MET_FIELDS,
  ...ENDS_FIELDS,
  ...GUIDE_FIELDS,
  ...RSVP_FIELDS,
  ...WISHES_FIELDS,
  ...FINALE_FIELDS,
  ...NARRATOR_FIELDS,
  ...META_FIELDS,
  ...MISC_FIELDS,
  ...PNG_FIELDS,
];

export const COPY_FIELD_BY_KEY: ReadonlyMap<string, CopyField> = new Map(COPY_FIELDS.map((field) => [field.key, field]));

export type { CopyField, CopyFieldKind, CopySection, CallVar } from "./types";
