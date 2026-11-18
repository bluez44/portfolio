import { list, del } from "@vercel/blob";

export interface StoredBlobItem {
  url: string;
  rawUrl: string;
  pathname: string;
  size: number;
  uploadedAt: string;
  filename: string;
}

/**
 * Extracts a clean display filename from a blob pathname.
 * e.g. "graduation/1731934800000-my_photo.jpg" -> "my_photo.jpg"
 */
export function formatBlobName(pathname: string): string {
  const base = pathname.split("/").pop() || pathname;
  // Remove timestamp prefix like "1731934800000-" if present
  return base.replace(/^\d{10,14}-/, "");
}

/**
 * Format bytes into human-readable string (KB / MB).
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Lists all uploaded graduation images from Vercel Blob storage, sorted by newest first.
 */
export async function listUploadedImages(prefix = "graduation/"): Promise<StoredBlobItem[]> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN chưa được thiết lập. Hãy thêm token này vào biến môi trường (.env)."
    );
  }

  const access = (process.env.BLOB_ACCESS as "public" | "private") || "private";

  const { blobs } = await list({
    prefix,
    token,
  });

  return blobs
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .map((blob) => {
      const isPrivate = access === "private" || blob.url.includes("private");
      const url = isPrivate
        ? `/api/graduation/image?pathname=${encodeURIComponent(blob.pathname)}`
        : blob.url;

      return {
        url,
        rawUrl: blob.url,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt.toISOString(),
        filename: formatBlobName(blob.pathname),
      };
    });
}

/**
 * Deletes an uploaded image from Vercel Blob by its pathname or URL.
 */
export async function deleteUploadedImage(target: string): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN chưa được thiết lập. Hãy thêm token này vào biến môi trường (.env)."
    );
  }

  let pathnameOrUrl = target;
  // If target is proxy URL (/api/graduation/image?pathname=...), extract pathname
  if (pathnameOrUrl.includes("/api/graduation/image?pathname=")) {
    try {
      const parsed = new URL(pathnameOrUrl, "http://localhost");
      const param = parsed.searchParams.get("pathname");
      if (param) pathnameOrUrl = param;
    } catch {
      // ignore
    }
  }

  await del(pathnameOrUrl, { token });
}
