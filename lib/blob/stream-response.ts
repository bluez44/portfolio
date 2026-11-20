export interface BlobStreamResult {
  statusCode: number;
  stream: ReadableStream<Uint8Array> | null;
  headers: Pick<Headers, "get">;
  blob: {
    contentType?: string | null;
  };
}

const CACHE_CONTROL = "public, max-age=31536000, immutable";
const DEFAULT_CONTENT_TYPE = "audio/mpeg";

export function toStreamResponse(result: BlobStreamResult): Response {
  const contentRange = result.headers.get("content-range");
  const contentLength = result.headers.get("content-length");

  const headers = new Headers({
    "Accept-Ranges": "bytes",
    "Cache-Control": CACHE_CONTROL,
    "Content-Type": result.blob.contentType || DEFAULT_CONTENT_TYPE,
  });

  if (contentRange) {
    headers.set("Content-Range", contentRange);
  }
  if (contentLength) {
    headers.set("Content-Length", contentLength);
  }

  // @vercel/blob hardcodes statusCode: 200 for all 2xx responses, so derive 206 from Content-Range.
  const status = contentRange ? 206 : result.statusCode;

  return new Response(result.stream, { status, headers });
}
