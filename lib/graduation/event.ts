export type RisoColor = "tomato" | "blue" | "jade" | "canary";

/** Language-neutral event data. UI copy lives in `./i18n`. */
export type GraduationEvent = {
  title: string;
  startUtc: string; // ISO
  endUtc: string;
  year: string;
  dateShort: string;
  timeRange: string;
  venue: string;
  address: string;
  /** Google Maps "Share → Embed a map" URL. */
  mapEmbedUrl: string;
  /** Google Maps link the printable card's QR code opens. */
  mapLinkUrl: string;
  /** The university's 3DVista campus tour; it allows framing. */
  virtualTourUrl: string;
  /** The tour's owner, credited under it. */
  virtualTourOwnerUrl: string;
  musicYoutubeId: string;
};

export const eventLocation = (event: GraduationEvent) => `${event.venue}, ${event.address}`;

export const GRADUATION_EVENT: GraduationEvent = {
  title: "Lễ tốt nghiệp — Võ Lê Quang Vinh",
  startUtc: "2026-11-28T09:30:00Z",
  endUtc: "2026-11-28T11:30:00Z",
  year: "2026",
  dateShort: "28.11",
  timeRange: "16:30 — 18:30",
  venue: "Hội trường A5, ĐH Bách Khoa",
  address: "268 Lý Thường Kiệt, Phường 14, Quận 10, TP. Hồ Chí Minh",
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6655.516643428146!2d106.65938094806978!3d10.774598740997988!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f265219560b%3A0x5c5dd04dfb3977cd!2zxJDhuqFpIGjhu41jIELDoWNoIEtob2EgVFAuSENNIC0gSOG7mWkgVHLGsOG7nW5nIEE1!5e0!3m2!1svi!2s!4v1794283859470!5m2!1svi!2s",
  mapLinkUrl: "https://www.google.com/maps?cid=6655704857669367757",
  virtualTourUrl: "https://hcmut.edu.vn/virtual-tour/",
  virtualTourOwnerUrl: "https://hcmut.edu.vn/",
  musicYoutubeId: "hfavqkBrwXI", // owner fills in the YouTube video ID
};
