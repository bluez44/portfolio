export type RisoColor = "tomato" | "blue" | "jade" | "canary";

/** Language-neutral event data. UI copy lives in `./i18n`. */
export type GraduationEvent = {
  title: string;
  startUtc: string; // ISO
  endUtc: string;
  dateShort: string;
  timeRange: string;
  venue: string;
  address: string;
  mapsUrl: string;
  musicYoutubeId: string;
};

export const GRADUATION_EVENT: GraduationEvent = {
  title: "Lễ tốt nghiệp — Võ Lê Quang Vinh",
  startUtc: "2026-12-19T02:00:00Z",
  endUtc: "2026-12-19T04:30:00Z",
  dateShort: "19.12",
  timeRange: "09:00 — 11:30",
  venue: "Hội trường A4, ĐH Bách Khoa",
  address: "268 Lý Thường Kiệt, Phường 14, Quận 10, TP. Hồ Chí Minh",
  mapsUrl: "https://maps.google.com/?q=268+Ly+Thuong+Kiet+Quan+10+Ho+Chi+Minh",
  musicYoutubeId: "", // owner fills in the YouTube video ID
};
