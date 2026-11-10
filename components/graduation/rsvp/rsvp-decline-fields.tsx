import type { RsvpFieldErrors } from "@/lib/graduation/rsvp-schema";
import type { RsvpAnswer } from "@/lib/graduation/types";
import { useCopy } from "../i18n/lang-context";
import { RsvpField } from "./rsvp-field";

type Decline = Extract<RsvpAnswer, { status: "no" }>;

export function RsvpDeclineFields({ saved, errors }: { saved: Decline | null; errors: RsvpFieldErrors }) {
  const { rsvp: t } = useCopy();
  return (
    <>
      <RsvpField name="reason" field={t.reason} multiline defaultValue={saved?.reason} error={errors.reason && t.fieldErrors[errors.reason]} />
      <RsvpField name="wish" field={t.wish} optionalLabel={t.optional} multiline defaultValue={saved?.wish} error={errors.wish && t.fieldErrors[errors.wish]} />
    </>
  );
}
