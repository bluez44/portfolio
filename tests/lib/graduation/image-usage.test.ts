import { describe, expect, it } from "vitest";
import { matchImageUrl, computeImageUsages } from "@/lib/graduation/image-usage";
import type { StoredBlobItem } from "@/lib/blob/manage";

describe("matchImageUrl", () => {
  const item: StoredBlobItem = {
    pathname: "graduation/1731934800000-photo.jpg",
    url: "/api/graduation/image?pathname=graduation%2F1731934800000-photo.jpg",
    rawUrl: "https://blob.vercel-storage.com/graduation/1731934800000-photo.jpg",
    size: 1024,
    uploadedAt: "2026-11-18T10:00:00.000Z",
    filename: "photo.jpg",
  };

  it("matches exact url", () => {
    expect(matchImageUrl(item, "/api/graduation/image?pathname=graduation%2F1731934800000-photo.jpg")).toBe(true);
  });

  it("matches rawUrl", () => {
    expect(matchImageUrl(item, "https://blob.vercel-storage.com/graduation/1731934800000-photo.jpg")).toBe(true);
  });

  it("matches pathname", () => {
    expect(matchImageUrl(item, "graduation/1731934800000-photo.jpg")).toBe(true);
  });

  it("matches decoded pathname in query string", () => {
    expect(matchImageUrl(item, "/api/graduation/image?pathname=graduation/1731934800000-photo.jpg")).toBe(true);
  });

  it("matches full external url ending with pathname", () => {
    expect(matchImageUrl(item, "https://cdn.example.com/graduation/1731934800000-photo.jpg")).toBe(true);
  });

  it("returns false for non-matching url or empty input", () => {
    expect(matchImageUrl(item, "/other/image.jpg")).toBe(false);
    expect(matchImageUrl(item, "")).toBe(false);
    expect(matchImageUrl(item, null)).toBe(false);
    expect(matchImageUrl(item, undefined)).toBe(false);
  });
});

describe("computeImageUsages", () => {
  const img1: StoredBlobItem = {
    pathname: "graduation/cover.jpg",
    url: "/api/graduation/image?pathname=graduation%2Fcover.jpg",
    rawUrl: "https://blob.vercel-storage.com/graduation/cover.jpg",
    size: 2048,
    uploadedAt: "2026-11-18T10:00:00.000Z",
    filename: "cover.jpg",
  };

  const img2: StoredBlobItem = {
    pathname: "graduation/together.jpg",
    url: "/api/graduation/image?pathname=graduation%2Ftogether.jpg",
    rawUrl: "https://blob.vercel-storage.com/graduation/together.jpg",
    size: 4096,
    uploadedAt: "2026-11-18T10:05:00.000Z",
    filename: "together.jpg",
  };

  const img3: StoredBlobItem = {
    pathname: "graduation/unused.jpg",
    url: "/api/graduation/image?pathname=graduation%2Funused.jpg",
    rawUrl: "https://blob.vercel-storage.com/graduation/unused.jpg",
    size: 1024,
    uploadedAt: "2026-11-18T10:10:00.000Z",
    filename: "unused.jpg",
  };

  it("computes usages correctly for settings and guests", () => {
    const guests = [
      {
        id: "g1",
        name: "Nguyễn Văn A",
        slug: "nguyen-van-a",
        customContent: {
          images: {
            coverImage: "/api/graduation/image?pathname=graduation%2Fcover.jpg",
            togetherPhoto: "/api/graduation/image?pathname=graduation%2Ftogether.jpg",
          },
          moments: [
            {
              year: "2024",
              image: "/api/graduation/image?pathname=graduation%2Fcover.jpg",
              vi: { title: "Ngày khai giảng" },
            },
          ],
        },
      },
      {
        id: "g2",
        name: "Trần Thị B",
        slug: "tran-thi-b",
        customContent: {
          images: {
            togetherPhoto: "/api/graduation/image?pathname=graduation%2Ftogether.jpg",
          },
        },
      },
    ];

    const settings = {
      images: {
        coverImage: "/api/graduation/image?pathname=graduation%2Fcover.jpg",
      },
    };

    const result = computeImageUsages([img1, img2, img3], guests, settings);

    // img1 is used in: settings cover, g1 cover, g1 moment #1
    expect(result[0].usageCount).toBe(3);
    expect(result[0].usages).toEqual([
      { type: "settings", section: "Cài đặt chung: Ảnh bìa thiệp", sectionKey: "coverImage" },
      { type: "guest", guestId: "g1", guestName: "Nguyễn Văn A", guestSlug: "nguyen-van-a", section: "Ảnh bìa thiệp", sectionKey: "coverImage" },
      { type: "guest", guestId: "g1", guestName: "Nguyễn Văn A", guestSlug: "nguyen-van-a", section: "Kỷ niệm #1 (Ngày khai giảng)", sectionKey: "moment" },
    ]);

    // img2 is used in: g1 together, g2 together
    expect(result[1].usageCount).toBe(2);
    expect(result[1].usages).toEqual([
      { type: "guest", guestId: "g1", guestName: "Nguyễn Văn A", guestSlug: "nguyen-van-a", section: "Ảnh chụp chung với khách", sectionKey: "togetherPhoto" },
      { type: "guest", guestId: "g2", guestName: "Trần Thị B", guestSlug: "tran-thi-b", section: "Ảnh chụp chung với khách", sectionKey: "togetherPhoto" },
    ]);

    // img3 is unused
    expect(result[2].usageCount).toBe(0);
    expect(result[2].usages).toEqual([]);
  });
});
