"use client";

import { GUEST_COPY_TABS } from "@/lib/graduation/content/fields/guest-keys";
import type { GuestTabProps } from "./guest-tab-props";
import { GuestCopyFields } from "../fields/guest-copy-fields";

export function RsvpTab({ content, placeholders, onChange }: GuestTabProps) {
  return <GuestCopyFields keys={GUEST_COPY_TABS.rsvp} content={content} placeholders={placeholders.texts} onChange={onChange} />;
}
