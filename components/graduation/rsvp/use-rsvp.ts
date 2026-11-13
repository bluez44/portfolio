"use client";

import { useState, useTransition } from "react";
import { submitRsvpAction } from "@/app/graduation/actions";
import { parseRsvpInput, type RsvpFieldErrors } from "@/lib/graduation/rsvp-schema";
import type { RsvpAnswer, RsvpStatus } from "@/lib/graduation/types";

const hasErrors = (errors: RsvpFieldErrors) => Object.keys(errors).length > 0;

/**
 * RSVP flow: pick attend/decline, fill that form, submit. Validates on the client first (same
 * schema as the server) so field errors show without a round trip.
 */
export function useRsvp(guestId: string, initial: RsvpAnswer | null, opts: { onSaved?: (answer: RsvpAnswer) => void } = {}) {
  const [saved, setSaved] = useState(initial);
  const [editing, setEditing] = useState(initial === null);
  const [choice, setChoice] = useState<RsvpStatus | null>(initial?.status ?? null);
  const [fieldErrors, setFieldErrors] = useState<RsvpFieldErrors>({});
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  const choose = (status: RsvpStatus) => {
    setChoice(status);
    setFieldErrors({});
    setFailed(false);
  };

  const submit = (form: FormData) => {
    if (!choice) return;
    const input = { ...Object.fromEntries(form), guestId, status: choice };
    const local = parseRsvpInput(input);
    if (!local.ok) {
      setFieldErrors(local.fieldErrors);
      setFailed(!hasErrors(local.fieldErrors));
      return;
    }
    startTransition(async () => {
      setFailed(false);
      try {
        const result = await submitRsvpAction(input);
        if (result.ok) {
          setSaved(result.answer);
          setEditing(false);
          setFieldErrors({});
          opts.onSaved?.(result.answer);
        } else if (result.error === "invalid" && hasErrors(result.fieldErrors)) {
          setFieldErrors(result.fieldErrors);
        } else {
          setFailed(true);
        }
      } catch {
        setFailed(true);
      }
    });
  };

  const edit = () => {
    setEditing(true);
    setFailed(false);
  };

  return { saved, editing, choice, fieldErrors, failed, pending, choose, submit, edit };
}

export type RsvpState = ReturnType<typeof useRsvp>;
