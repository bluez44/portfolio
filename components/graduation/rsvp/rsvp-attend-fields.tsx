import type { RsvpFieldErrors } from "@/lib/graduation/rsvp-schema";
import type { RsvpAnswer } from "@/lib/graduation/types";
import { useCopy } from "../i18n/lang-context";
import { RsvpField } from "./rsvp-field";

type Attend = Extract<RsvpAnswer, { status: "yes" }>;

export function RsvpAttendFields({ saved, errors }: { saved: Attend | null; errors: RsvpFieldErrors }) {
  const { rsvp: t } = useCopy();
  return (
    <>
      <RsvpField name="contact" field={t.contact} defaultValue={saved?.contact} error={errors.contact && t.fieldErrors[errors.contact]} />
      <RsvpField name="wish" field={t.wish} optionalLabel={t.optional} multiline defaultValue={saved?.wish} error={errors.wish && t.fieldErrors[errors.wish]} />
    </>
  );
}
