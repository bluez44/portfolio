import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pathname = searchParams.get("pathname");

  if (!pathname) {
    return new NextResponse("Missing pathname", { status: 400 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return new NextResponse("BLOB_READ_WRITE_TOKEN is not configured", { status: 500 });
  }

  try {
    const result = await get(pathname, {
      access: "private",
      token,
    });

    if (!result || result.statusCode !== 200 || !result.stream) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const contentType = result.blob.contentType || "image/jpeg";

    return new NextResponse(result.stream as unknown as BodyInit, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load image";
    return new NextResponse(message, { status: 500 });
  }
}
