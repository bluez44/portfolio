import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/bee-wall
 *
 * Returns all guests who have submitted an RSVP wish.
 * Protected by a shared secret passed as a Bearer token so the data
 * isn't publicly crawlable, while still being fetchable from the
 * client-side BeeWall component.
 *
 * Required env var: BEE_WALL_SECRET
 */
export async function GET(req: NextRequest) {
  console.log("GET /api/bee-wall");
  const secret = process.env.BEE_WALL_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  // Accept the secret as a Bearer token in the Authorization header.
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.guest.findMany({
    where: { rsvp: { wish: { not: null } } },
    select: {
      id: true,
      rsvp: { select: { wish: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const bees = rows
    .map((r) => ({ id: r.id, wish: r.rsvp?.wish ?? null }))
    .filter((r): r is { id: string; wish: string } => r.wish !== null);

  return NextResponse.json(bees);
}
