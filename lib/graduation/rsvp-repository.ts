import prisma from "@/lib/prisma";
import type { RsvpStatus } from "./types";

export const rsvpRepository = {
  /** Upserts the guest's answer and reports what it was before. */
  async save(guestId: string, status: RsvpStatus): Promise<{ previous: RsvpStatus | null }> {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.rsvp.findUnique({ where: { guestId }, select: { status: true } });
      await tx.rsvp.upsert({
        where: { guestId },
        create: { guestId, status },
        update: { status },
      });
      return { previous: existing?.status ?? null };
    });
  },
};
