export type RsvpStatus = "yes" | "no";

/** A guest's RSVP: attending guests leave a contact, declining guests a reason; both may add a wish. */
export type RsvpAnswer =
  | { status: "yes"; contact: string; wish: string | null }
  | { status: "no"; reason: string; wish: string | null };

export type CustomMoment = {
  n?: string;
  year: string;
  title: string;
  body: string;
  image: string;
  color?: "tomato" | "blue" | "jade" | "canary";
  rot?: number;
};

export type EnvelopeCustomization = {
  coverLead?: string;
  coverAccent?: string;
  cardGreeting?: string;
  cardBody?: string;
  cardAuthor?: string;
  coverImage?: string;
};

export type MetCustomization = {
  headingLead?: string;
  headingAccent?: string;
  intro?: string;
  moments?: CustomMoment[];
  note?: string;
};

export type EndsCustomization = {
  headingLead?: string;
  headingAccent?: string;
  intro?: string;
  dateShort?: string;
  timeRange?: string;
  venue?: string;
  address?: string;
  notes?: string[];
  specialMessage?: string;
};

export type MusicCustomization = {
  youtubeId?: string;
};

export type GuestCustomContent = {
  envelope?: EnvelopeCustomization;
  met?: MetCustomization;
  ends?: EndsCustomization;
  music?: MusicCustomization;
};

export type GuestRecord = {
  id: string;
  slug: string;
  name: string;
  note: string | null;
  customContent: GuestCustomContent | null;
};

/** What the public invitation page needs about a guest. */
export type InvitationGuest = GuestRecord;

/** Serializable row for the admin table. */
export type GuestListItem = GuestRecord & {
  rsvpStatus: RsvpStatus | null;
  rsvpUpdatedAt: string | null;
  rsvpWish: string | null;
};

/** Validated data written by admin create/update. */
export type GuestData = {
  slug: string;
  name: string;
  note: string | null;
  customContent?: GuestCustomContent | null;
};
