import type { RisoColor } from "../event";
import type { MomentFocus } from "../image-focus";
import type { Lang, MomentText } from "../i18n/types";
import type { CopyOverrides } from "./overrides";

export type LocalizedMomentText = Partial<MomentText>;

export type SettingsMoment = {
  year: string;
  image: string;
  color?: RisoColor;
  /** Where the photo is anchored when cropped, per layout. */
  focus?: MomentFocus;
  vi?: LocalizedMomentText;
  en?: LocalizedMomentText;
};

export type OwnerSettings = { name?: string; initials?: string; website?: string; phone?: string };

export type EventSettings = {
  start?: string;
  end?: string;
  mapEmbedUrl?: string;
  mapLinkUrl?: string;
  virtualTourUrl?: string;
  virtualTourOwnerUrl?: string;
  musicTrack?: string;
};

export type ImageSettings = {
  coverImage?: string;
  togetherPhoto?: string;
  /** Where the together photo is anchored when cropped; it belongs to the photo set beside it. */
  togetherFocus?: MomentFocus;
  badgeLogo?: string;
};

export type GraduationSettingsContent = {
  owner?: OwnerSettings;
  event?: EventSettings;
  images?: ImageSettings;
  moments?: SettingsMoment[];
  copy?: Partial<Record<Lang, CopyOverrides>>;
};

export type GuestContent = {
  vi?: CopyOverrides;
  en?: CopyOverrides;
  images?: Pick<ImageSettings, "coverImage" | "togetherPhoto" | "togetherFocus">;
  moments?: SettingsMoment[];
  event?: Pick<EventSettings, "start" | "end">;
  music?: { track?: string };
};
