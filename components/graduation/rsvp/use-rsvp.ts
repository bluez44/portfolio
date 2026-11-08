"use client";

import { useState, useTransition } from "react";
import { submitRsvpAction } from "@/app/graduation/actions";
import type { RsvpStatus } from "@/lib/graduation/types";

export function useRsvp(slug: string, initial: RsvpStatus | null) {
  const [status, setStatus] = useState<RsvpStatus | null>(initial);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  const choose = (next: RsvpStatus) =>
    startTransition(async () => {
      setError(false);
      try {
        const result = await submitRsvpAction(slug, next);
        if (result.ok) setStatus(result.status);
        else setError(true);
      } catch {
        setError(true);
      }
    });

  const reset = () => {
    setError(false);
    setStatus(null);
  };

  return { status, pending, error, choose, reset };
}
