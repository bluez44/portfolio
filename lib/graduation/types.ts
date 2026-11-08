export type RsvpStatus = "yes" | "no";

export type GuestRecord = { id: string; slug: string; name: string; note: string | null };

/** What the public invitation page needs about a guest. */
export type InvitationGuest = Pick<GuestRecord, "slug" | "name" | "note">;

/** Serializable row for the admin table. */
export type GuestListItem = GuestRecord & {
  rsvpStatus: RsvpStatus | null;
  rsvpUpdatedAt: string | null;
};

/** Validated data written by admin create/update. */
export type GuestData = { slug: string; name: string; note: string | null };
