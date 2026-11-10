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

  const access = (process.env.BLOB_ACCESS as "public" | "private") || "private";
  const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");

  // Attempt upload with configured access mode (defaulting to private as requested)
  let blob;
  try {
    blob = await put(`graduation/${Date.now()}-${safeName}`, file, {
      access,
      token,
    });
  } catch (err) {
    // If private access fails due to store mode, attempt fallback or rethrow
    const errMsg = err instanceof Error ? err.message : String(err);
    if (errMsg.includes("public") || errMsg.includes("private")) {
      const fallbackAccess = access === "private" ? "public" : "private";
      blob = await put(`graduation/${Date.now()}-${safeName}`, file, {
        access: fallbackAccess,
        token,
      });
    } else {
      throw err;
    }
  }

  // If the blob is private, route through our server-side proxy route so visitors can display it
  const isPrivate = access === "private" || blob.url.includes("private");
  const url = isPrivate
    ? `/api/graduation/image?pathname=${encodeURIComponent(blob.pathname)}`
    : blob.url;

  return {
    url,
    pathname: blob.pathname,
  };
}
