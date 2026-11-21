import type { RsvpAnswer, RsvpStatus } from "./types";

export type RsvpRow = { status: RsvpStatus; contact: string | null; reason: string | null; wish: string | null };

/** Columns for an answer; fields that belong to the other status are cleared. */
export function toRsvpRow(answer: RsvpAnswer): RsvpRow {
  return answer.status === "yes"
    ? { status: "yes", contact: answer.contact || null, reason: null, wish: answer.wish }
    : { status: "no", contact: null, reason: answer.reason || null, wish: answer.wish };
}

/** Rows without a contact/reason (older rows, or answers that skipped them) read back as empty. */
export function fromRsvpRow(row: RsvpRow): RsvpAnswer {
  return row.status === "yes"
    ? { status: "yes", contact: row.contact ?? "", wish: row.wish }
    : { status: "no", reason: row.reason ?? "", wish: row.wish };
}
