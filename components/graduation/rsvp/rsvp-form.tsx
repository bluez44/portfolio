import type { FormEvent } from "react";
import { RisoButton } from "@/components/ui/riso/button";
import { useCopy } from "../i18n/lang-context";
import { OwnerPhoneNote } from "./owner-phone-note";
import { RsvpAttendFields } from "./rsvp-attend-fields";
import { RsvpChoices } from "./rsvp-choices";
import { RsvpDeclineFields } from "./rsvp-decline-fields";
import type { RsvpState } from "./use-rsvp";

/** Attend/decline choice, then the matching form. Fields are prefilled from a saved answer of the same kind. */
export function RsvpForm({ rsvp, ownerPhone }: { rsvp: RsvpState; ownerPhone: string | null }) {
  const { rsvp: t } = useCopy();
  const { choice, saved, fieldErrors, failed, pending } = rsvp;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    rsvp.submit(new FormData(event.currentTarget));
  };

  return (
    <div className="flex max-w-[46ch] flex-col gap-6">
      <RsvpChoices choice={choice} onChoose={rsvp.choose} />
      {choice && (
        <form key={choice} noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
          {choice === "yes" ? (
            <RsvpAttendFields saved={saved?.status === "yes" ? saved : null} errors={fieldErrors} />
          ) : (
            <RsvpDeclineFields saved={saved?.status === "no" ? saved : null} errors={fieldErrors} />
          )}
          <div>
            <RisoButton type="submit" variant="secondary" size="md" icon="→" disabled={pending}>
              {pending ? t.sending : t.submit}
            </RisoButton>
          </div>
          {failed && (
            <p role="alert" className="m-0 font-mono text-[11px] tracking-[0.14em] text-tomato uppercase">
              {t.error}
            </p>
          )}
          {choice === "yes" && ownerPhone && <OwnerPhoneNote phone={ownerPhone} />}
        </form>
      )}
    </div>
  );
}
