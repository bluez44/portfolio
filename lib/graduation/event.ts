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
  /** Google Maps "Share → Embed a map" URL. */
  mapEmbedUrl: string;
  /** The university's 3DVista campus tour; it allows framing. */
  virtualTourUrl: string;
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
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6655.516643428146!2d106.65938094806978!3d10.774598740997988!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f265219560b%3A0x5c5dd04dfb3977cd!2zxJDhuqFpIGjhu41jIELDoWNoIEtob2EgVFAuSENNIC0gSOG7mWkgVHLGsOG7nW5nIEE1!5e0!3m2!1svi!2s!4v1794283859470!5m2!1svi!2s",
  virtualTourUrl: "https://hcmut.edu.vn/virtual-tour/",
  musicYoutubeId: "", // owner fills in the YouTube video ID
};
