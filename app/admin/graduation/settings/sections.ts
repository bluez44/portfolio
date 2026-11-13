import type { CopySection } from "@/lib/graduation/content/fields";

export type SettingsTab = "owner" | "event" | CopySection;

export const SETTINGS_TABS: readonly { key: SettingsTab; label: string }[] = [
  { key: "owner", label: "Chủ thiệp" },
  { key: "event", label: "Sự kiện" },
  { key: "gate", label: "Mở thiệp" },
  { key: "header", label: "Header & Rails" },
  { key: "envelope", label: "Phong bì & Thiệp" },
  { key: "met", label: "Met & Kỷ niệm" },
  { key: "ends", label: "Ends & Bản đồ" },
  { key: "rsvp", label: "RSVP" },
  { key: "wishes", label: "Wishes" },
  { key: "finale", label: "Finale" },
  { key: "narrator", label: "Nhân vật" },
  { key: "misc", label: "Footer, Meta & 404" },
  { key: "png", label: "Ảnh thiệp PNG" },
];
