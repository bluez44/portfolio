import type { MomentFocus } from "../image-focus";
import { DEFAULT_IMAGES } from "./defaults";
import type { GuestContent, ImageSettings } from "./settings-types";

export type ResolvedImages = { coverImage?: string; togetherPhoto?: string; togetherFocus?: MomentFocus; badgeLogo: string };

/** The together photo's focus comes from wherever the photo itself does: the guest's own, or the shared one. */
export const resolveImages = (settings: ImageSettings | undefined, guest: GuestContent["images"]): ResolvedImages => ({
  coverImage: guest?.coverImage || settings?.coverImage,
  togetherPhoto: guest?.togetherPhoto || settings?.togetherPhoto,
  togetherFocus: guest?.togetherPhoto ? guest.togetherFocus : settings?.togetherFocus,
  badgeLogo: settings?.badgeLogo || DEFAULT_IMAGES.badgeLogo,
});
