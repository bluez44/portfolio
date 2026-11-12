import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { beeAlias } from "@/lib/bee-alias";
import { UUID_REGEX } from "@/lib/graduation/guest-repository";

/** What the wall shows per wish; never the guest's id, since that id is their invitation link. */
export type BeeWallEntry = { key: string; name: string; wish: string; at: string; mine: boolean };

/** A stable, non-reversible handle for React keys, so the payload never carries a usable link. */
const opaqueKey = (id: string) => createHash("sha256").update(id).digest("hex").slice(0, 16);

/**
 * GET /api/bee-wall
 *
 * Returns every RSVP wish. Only invited guests may read it: the caller sends
 * their own guest id (the secret part of their invitation link) as a Bearer token.
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const viewerId = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const viewer = UUID_REGEX.test(viewerId) ? await prisma.guest.findUnique({ where: { id: viewerId }, select: { id: true } }) : null;
  if (!viewer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.guest.findMany({
    where: { rsvp: { wish: { not: null } } },
    select: {
      id: true,
      rsvp: { select: { wish: true, updatedAt: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const bees: BeeWallEntry[] = rows.flatMap((r) =>
    r.rsvp?.wish
      ? [{ key: opaqueKey(r.id), name: beeAlias(r.id), wish: r.rsvp.wish, at: r.rsvp.updatedAt.toISOString(), mine: r.id === viewer.id }]
      : [],
  );

  return NextResponse.json(bees, { headers: { "Cache-Control": "private, no-store" } });
}
