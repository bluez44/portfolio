import { NextRequest, NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth/session";
import { listUploadedImages, deleteUploadedImage } from "@/lib/blob/manage";
import { guestRepository } from "@/lib/graduation/guest-repository";
import { loadGraduationSettings } from "@/lib/graduation/content/load-settings";
import { computeImageUsages } from "@/lib/graduation/image-usage";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [images, guests, settings] = await Promise.all([
      listUploadedImages("graduation/"),
      guestRepository.list(),
      loadGraduationSettings(),
    ]);
    const enriched = computeImageUsages(images, guests, settings);
    return NextResponse.json({ images: enriched });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể tải danh sách ảnh";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const target = body.pathname || body.url || body.rawUrl;

    if (!target || typeof target !== "string") {
      return NextResponse.json({ error: "Thiếu thông tin ảnh cần xóa" }, { status: 400 });
    }

    await deleteUploadedImage(target);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Xóa ảnh thất bại";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
