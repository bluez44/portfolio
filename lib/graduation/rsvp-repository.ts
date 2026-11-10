import prisma from "@/lib/prisma";
import { toRsvpRow } from "./rsvp-mapper";
import type { RsvpAnswer, RsvpStatus } from "./types";

export const rsvpRepository = {
  /** Upserts the guest's answer and reports the status it replaced. */
  async save(guestId: string, answer: RsvpAnswer): Promise<{ previous: RsvpStatus | null }> {
    const row = toRsvpRow(answer);
    return prisma.$transaction(async (tx) => {
      const existing = await tx.rsvp.findUnique({ where: { guestId }, select: { status: true } });
      await tx.rsvp.upsert({ where: { guestId }, create: { guestId, ...row }, update: row });
      return { previous: existing?.status ?? null };
    });
  },
};
