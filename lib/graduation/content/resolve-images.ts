import { DEFAULT_IMAGES } from "./defaults";
import type { GuestContent, ImageSettings } from "./settings-types";

export type ResolvedImages = { coverImage?: string; togetherPhoto?: string; badgeLogo: string };

export const resolveImages = (settings: ImageSettings | undefined, guest: GuestContent["images"]): ResolvedImages => ({
  coverImage: guest?.coverImage || settings?.coverImage,
  togetherPhoto: guest?.togetherPhoto || settings?.togetherPhoto,
  badgeLogo: settings?.badgeLogo || DEFAULT_IMAGES.badgeLogo,
});
