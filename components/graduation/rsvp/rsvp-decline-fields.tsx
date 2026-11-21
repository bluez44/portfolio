import type { RsvpFieldErrors } from "@/lib/graduation/rsvp-schema";
import type { RsvpAnswer } from "@/lib/graduation/types";
import { useCopy } from "../i18n/lang-context";
import { RsvpField } from "./rsvp-field";

type Decline = Extract<RsvpAnswer, { status: "no" }>;

export function RsvpDeclineFields({ saved, errors }: { saved: Decline | null; errors: RsvpFieldErrors }) {
  const { rsvp: t } = useCopy();
  return (
    <>
      <RsvpField name="wish" field={t.wish} multiline defaultValue={saved?.wish} error={errors.wish && t.fieldErrors[errors.wish]} />
    </>
  );
}
