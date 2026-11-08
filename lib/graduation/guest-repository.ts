import prisma from "@/lib/prisma";
import { SlugTakenError } from "./slug-taken-error";
import type { GuestData, GuestListItem, GuestRecord, InvitationGuest, RsvpStatus } from "./types";

const recordSelect = { id: true, slug: true, name: true, note: true } as const;

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "P2002";
}

async function write<T>(op: () => Promise<T>): Promise<T> {
  try {
    return await op();
  } catch (error) {
    if (isUniqueViolation(error)) throw new SlugTakenError();
    throw error;
  }
}

export const guestRepository = {
  findBySlug(slug: string): Promise<GuestRecord | null> {
    return prisma.guest.findUnique({ where: { slug }, select: recordSelect });
  },

  async findInvitation(
    slug: string,
  ): Promise<{ guest: InvitationGuest; rsvp: RsvpStatus | null } | null> {
    const row = await prisma.guest.findUnique({
      where: { slug },
      select: { slug: true, name: true, note: true, rsvp: { select: { status: true } } },
    });
    if (!row) return null;
    const { rsvp, ...guest } = row;
    return { guest, rsvp: rsvp?.status ?? null };
  },

  async list(): Promise<GuestListItem[]> {
    const rows = await prisma.guest.findMany({
      orderBy: { createdAt: "desc" },
      select: { ...recordSelect, rsvp: { select: { status: true, updatedAt: true } } },
    });
    return rows.map(({ rsvp, ...guest }) => ({
      ...guest,
      rsvpStatus: rsvp?.status ?? null,
      rsvpUpdatedAt: rsvp?.updatedAt.toISOString() ?? null,
    }));
  },

  create(data: GuestData): Promise<GuestRecord> {
    return write(() => prisma.guest.create({ data, select: recordSelect }));
  },

  update(id: string, data: GuestData): Promise<GuestRecord> {
    return write(() => prisma.guest.update({ where: { id }, data, select: recordSelect }));
  },

  async remove(id: string): Promise<void> {
    await prisma.guest.delete({ where: { id } });
  },
};

export type GuestWriter = Pick<typeof guestRepository, "create" | "update">;
