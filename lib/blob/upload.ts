import { put } from "@vercel/blob";

export interface BlobUploadResult {
  url: string;
  pathname: string;
}

export async function uploadImageToBlob(
  file: File | Blob,
  filename: string,
): Promise<BlobUploadResult> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN chưa được thiết lập. Hãy thêm token này vào biến môi trường (.env)."
    );
  }

  const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const blob = await put(`graduation/${Date.now()}-${safeName}`, file, {
    access: "public",
    token,
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
  };
}
