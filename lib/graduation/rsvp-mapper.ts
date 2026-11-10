import type { RsvpAnswer, RsvpStatus } from "./types";

export type RsvpRow = { status: RsvpStatus; contact: string | null; reason: string | null; wish: string | null };

/** Columns for an answer; fields that belong to the other status are cleared. */
export function toRsvpRow(answer: RsvpAnswer): RsvpRow {
  return answer.status === "yes"
    ? { status: "yes", contact: answer.contact, reason: null, wish: answer.wish }
    : { status: "no", contact: null, reason: answer.reason, wish: answer.wish };
}

/** Rows saved before the forms existed have no contact/reason; they read back as empty. */
export function fromRsvpRow(row: RsvpRow): RsvpAnswer {
  return row.status === "yes"
    ? { status: "yes", contact: row.contact ?? "", wish: row.wish }
    : { status: "no", reason: row.reason ?? "", wish: row.wish };
}
