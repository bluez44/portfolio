import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { toStreamResponse } from "@/lib/blob/stream-response";
import { isAudioPathname } from "@/lib/graduation/audio-track";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pathname = searchParams.get("pathname");

  if (!pathname || !isAudioPathname(pathname)) {
    return new NextResponse("Invalid audio pathname", { status: 400 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return new NextResponse("BLOB_READ_WRITE_TOKEN is not configured", { status: 500 });
  }

  const range = req.headers.get("range");

  try {
    const result = await get(pathname, {
      access: "private",
      token,
      headers: range ? { range } : undefined,
    });

    if (!result || Number(result.statusCode) >= 400 || !result.stream) {
      return new NextResponse("Audio not found", { status: 404 });
    }

    return toStreamResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load audio";
    return new NextResponse(message, { status: 500 });
  }
}
