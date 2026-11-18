import type { StoredBlobItem } from "@/lib/blob/manage";
import type { GraduationSettingsContent, GuestContent } from "./content/settings-types";

export type ImageUsageSectionKey = "coverImage" | "togetherPhoto" | "badgeLogo" | "moment";

export interface ImageUsage {
  type: "guest" | "settings";
  guestId?: string;
  guestName?: string;
  guestSlug?: string;
  section: string;
  sectionKey: ImageUsageSectionKey;
}

export interface EnrichedStoredBlobItem extends StoredBlobItem {
  usages: ImageUsage[];
  usageCount: number;
}

/**
 * Checks if targetUrl points to the given stored blob item.
 * Supports exact URL match, raw blob URL match, proxy URL with pathname query param,
 * and direct pathname matching.
 */
export function matchImageUrl(
  item: { pathname: string; url: string; rawUrl?: string },
  targetUrl?: string | null
): boolean {
  if (!targetUrl || typeof targetUrl !== "string") return false;
  const trimmed = targetUrl.trim();
  if (!trimmed) return false;

  if (trimmed === item.url || trimmed === item.rawUrl || trimmed === item.pathname) {
    return true;
  }

  // Check if pathname matches in query param ?pathname=...
  if (trimmed.includes("pathname=")) {
    try {
      const urlObj = new URL(trimmed, "http://localhost");
      const p = urlObj.searchParams.get("pathname");
      if (p) {
        if (p === item.pathname || decodeURIComponent(p) === item.pathname) {
          return true;
        }
      }
    } catch {
      const match = trimmed.match(/pathname=([^&]+)/);
      if (match && match[1]) {
        const decoded = decodeURIComponent(match[1]);
        if (decoded === item.pathname || match[1] === item.pathname) return true;
      }
    }
  }

  // Check if pathname is at the end of the URL path
  if (trimmed.endsWith(item.pathname)) {
    return true;
  }

  return false;
}

/**
 * Computes where each uploaded image is used across all guests and global settings.
 */
export function computeImageUsages(
  images: StoredBlobItem[],
  guests: Array<{ id: string; name: string; slug: string; customContent?: unknown }>,
  settings?: GraduationSettingsContent | null
): EnrichedStoredBlobItem[] {
  return images.map((img) => {
    const usages: ImageUsage[] = [];

    // 1. Check in Settings (Cài đặt chung)
    if (settings) {
      if (matchImageUrl(img, settings.images?.coverImage)) {
        usages.push({
          type: "settings",
          section: "Cài đặt chung: Ảnh bìa thiệp",
          sectionKey: "coverImage",
        });
      }
      if (matchImageUrl(img, settings.images?.togetherPhoto)) {
        usages.push({
          type: "settings",
          section: "Cài đặt chung: Ảnh chụp chung",
          sectionKey: "togetherPhoto",
        });
      }
      if (matchImageUrl(img, settings.images?.badgeLogo)) {
        usages.push({
          type: "settings",
          section: "Cài đặt chung: Logo huy hiệu",
          sectionKey: "badgeLogo",
        });
      }
      if (Array.isArray(settings.moments)) {
        settings.moments.forEach((m, idx) => {
          if (matchImageUrl(img, m?.image)) {
            const title = m.vi?.title || m.en?.title;
            usages.push({
              type: "settings",
              section: title
                ? `Cài đặt chung: Kỷ niệm #${idx + 1} (${title})`
                : `Cài đặt chung: Kỷ niệm #${idx + 1}`,
              sectionKey: "moment",
            });
          }
        });
      }
    }

    // 2. Check in Guests
    for (const g of guests) {
      const content = (g.customContent as GuestContent) || {};

      // Cover image (current or legacy)
      const coverImage =
        content.images?.coverImage ||
        (content as Record<string, unknown> | undefined)?.["envelope"] &&
          ((content as Record<string, Record<string, unknown>>)["envelope"]["coverImage"] as string);
      if (typeof coverImage === "string" && matchImageUrl(img, coverImage)) {
        usages.push({
          type: "guest",
          guestId: g.id,
          guestName: g.name,
          guestSlug: g.slug,
          section: "Ảnh bìa thiệp",
          sectionKey: "coverImage",
        });
      }

      // Together photo (current or legacy)
      const togetherPhoto =
        content.images?.togetherPhoto ||
        (content as Record<string, unknown> | undefined)?.["met"] &&
          ((content as Record<string, Record<string, unknown>>)["met"]["togetherPhoto"] as string);
      if (typeof togetherPhoto === "string" && matchImageUrl(img, togetherPhoto)) {
        usages.push({
          type: "guest",
          guestId: g.id,
          guestName: g.name,
          guestSlug: g.slug,
          section: "Ảnh chụp chung với khách",
          sectionKey: "togetherPhoto",
        });
      }

      // Moments
      if (Array.isArray(content.moments)) {
        content.moments.forEach((m, idx) => {
          if (matchImageUrl(img, m?.image)) {
            const title = m.vi?.title || m.en?.title;
            usages.push({
              type: "guest",
              guestId: g.id,
              guestName: g.name,
              guestSlug: g.slug,
              section: title ? `Kỷ niệm #${idx + 1} (${title})` : `Kỷ niệm #${idx + 1}`,
              sectionKey: "moment",
            });
          }
        });
      }
    }

    return {
      ...img,
      usages,
      usageCount: usages.length,
    };
  });
}
