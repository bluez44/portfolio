import { describe, expect, it } from "vitest";
import { toStreamResponse } from "@/lib/blob/stream-response";

const emptyStream = () => new ReadableStream<Uint8Array>();

describe("toStreamResponse", () => {
  it("preserves 206 status and range headers for partial content", () => {
    const response = toStreamResponse({
      statusCode: 206,
      stream: emptyStream(),
      headers: new Headers({
        "content-range": "bytes 0-99/1000",
        "content-length": "100",
      }),
      blob: { contentType: "audio/mpeg" },
    });

    expect(response.status).toBe(206);
    expect(response.headers.get("content-range")).toBe("bytes 0-99/1000");
    expect(response.headers.get("content-length")).toBe("100");
    expect(response.headers.get("accept-ranges")).toBe("bytes");
    expect(response.headers.get("content-type")).toBe("audio/mpeg");
    expect(response.headers.get("cache-control")).toBe("public, max-age=31536000, immutable");
  });

  it("responds with 206 when content-range is present even if sdk reports 200", () => {
    const response = toStreamResponse({
      statusCode: 200,
      stream: emptyStream(),
      headers: new Headers({
        "content-range": "bytes 0-99/1000",
        "content-length": "100",
      }),
      blob: { contentType: "audio/mpeg" },
    });

    expect(response.status).toBe(206);
    expect(response.headers.get("content-range")).toBe("bytes 0-99/1000");
  });

  it("returns 200 without content-range for full responses", () => {
    const response = toStreamResponse({
      statusCode: 200,
      stream: emptyStream(),
      headers: new Headers({ "content-length": "1000" }),
      blob: { contentType: "audio/mp4" },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-range")).toBeNull();
    expect(response.headers.get("content-length")).toBe("1000");
    expect(response.headers.get("accept-ranges")).toBe("bytes");
    expect(response.headers.get("content-type")).toBe("audio/mp4");
  });

  it("defaults content-type to audio/mpeg when missing", () => {
    const response = toStreamResponse({
      statusCode: 200,
      stream: emptyStream(),
      headers: new Headers(),
      blob: {},
    });

    expect(response.headers.get("content-type")).toBe("audio/mpeg");
  });
});
