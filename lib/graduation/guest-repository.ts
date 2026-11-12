import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { SlugTakenError } from "./slug-taken-error";
import { fromRsvpRow } from "./rsvp-mapper";
import type { GuestCustomContent, GuestData, GuestListItem, GuestRecord, InvitationGuest, RsvpAnswer } from "./types";

const recordSelect = {
  id: true,
  slug: true,
  name: true,
  note: true,
  customContent: true,
} as const;

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

function parseRecord(row: {
  id: string;
  slug: string;
  name: string;
  note: string | null;
  customContent: unknown;
}): GuestRecord {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    note: row.note,
    customContent: (row.customContent as GuestCustomContent) ?? null,
  };
}

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const guestRepository = {
  async findById(id: string): Promise<GuestRecord | null> {
    const row = await prisma.guest.findUnique({ where: { id }, select: recordSelect });
    return row ? parseRecord(row) : null;
  },

  async findBySlug(slug: string): Promise<GuestRecord | null> {
    const row = await prisma.guest.findUnique({ where: { slug }, select: recordSelect });
    return row ? parseRecord(row) : null;
  },

  async findInvitation(
    identifier: string,
  ): Promise<{ guest: InvitationGuest; rsvp: RsvpAnswer | null } | null> {
    const isUuid = UUID_REGEX.test(identifier);
    let row = isUuid
      ? await prisma.guest.findUnique({
          where: { id: identifier },
          select: { ...recordSelect, rsvp: { select: { status: true, contact: true, reason: true, wish: true } } },
        })
      : null;

    if (!row) {
      row = await prisma.guest.findUnique({
        where: { slug: identifier },
        select: { ...recordSelect, rsvp: { select: { status: true, contact: true, reason: true, wish: true } } },
      });
    }

    if (!row) return null;
    const { rsvp, ...guestRow } = row;
    return {
      guest: parseRecord(guestRow),
      rsvp: rsvp ? fromRsvpRow(rsvp) : null,
    };
  },

  async list(): Promise<GuestListItem[]> {
    const rows = await prisma.guest.findMany({
      orderBy: { createdAt: "desc" },
      select: { ...recordSelect, rsvp: { select: { status: true, updatedAt: true, wish: true } } },
    });
    return rows.map(({ rsvp, ...guestRow }) => ({
      ...parseRecord(guestRow),
      rsvpStatus: rsvp?.status ?? null,
      rsvpUpdatedAt: rsvp?.updatedAt.toISOString() ?? null,
      rsvpWish: rsvp?.wish ?? null,
    }));
  },

  async create(data: GuestData): Promise<GuestRecord> {
    const row = await write(() =>
      prisma.guest.create({
        data: {
          name: data.name,
          slug: data.slug,
          note: data.note,
          customContent: data.customContent
            ? (data.customContent as unknown as Prisma.InputJsonValue)
            : Prisma.DbNull,
        },
        select: recordSelect,
      }),
    );
    return parseRecord(row);
  },

  async update(id: string, data: GuestData): Promise<GuestRecord> {
    const row = await write(() =>
      prisma.guest.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          note: data.note,
          customContent:
            data.customContent !== undefined
              ? data.customContent
                ? (data.customContent as unknown as Prisma.InputJsonValue)
                : Prisma.DbNull
              : undefined,
        },
        select: recordSelect,
      }),
    );
    return parseRecord(row);
  },

  async remove(id: string): Promise<void> {
    await prisma.guest.delete({ where: { id } });
  },
};

export type GuestWriter = Pick<typeof guestRepository, "create" | "update">;
