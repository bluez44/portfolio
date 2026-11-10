import { NextRequest, NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth/session";
import { uploadImageToBlob } from "@/lib/blob/upload";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "Không tìm thấy file tải lên" }, { status: 400 });
    }

    const filename = (file as File).name || "uploaded-image.jpg";
    const result = await uploadImageToBlob(file, filename);

    return NextResponse.json({ url: result.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tải ảnh thất bại";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
