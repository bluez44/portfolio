export type RisoColor = "tomato" | "blue" | "jade" | "canary";

export type Moment = {
  n: string;
  year: string;
  vi: string;
  en: string;
  body: string;
  color: RisoColor;
  rot: number;
};

export type GraduationEvent = {
  title: string;
  startUtc: string; // ISO
  endUtc: string;
  dateShort: string;
  dayVi: string;
  timeRange: string;
  railWhen: string;
  railWhenEn: string;
  venue: string;
  venueShort: string;
  address: string;
  addressShort: string;
  venueEn: string;
  mapsUrl: string;
  notes: string[];
  moments: Moment[];
  defaultNote: { vi: string; en: string };
  personalNoteEn: string;
  musicYoutubeId: string;
};

export const GRADUATION_EVENT: GraduationEvent = {
  title: "Lễ tốt nghiệp — Võ Lê Quang Vinh",
  startUtc: "2026-12-19T02:00:00Z",
  endUtc: "2026-12-19T04:30:00Z",
  dateShort: "19.12",
  dayVi: "Thứ Bảy · Saturday, 2026",
  timeRange: "09:00 — 11:30",
  railWhen: "09:00 · Thứ Bảy 19.12.2026",
  railWhenEn: "Sat · Dec 19",
  venue: "Hội trường A4, ĐH Bách Khoa",
  venueShort: "Hội trường A4 · ĐH Bách Khoa",
  address: "268 Lý Thường Kiệt, Phường 14, Quận 10, TP. Hồ Chí Minh",
  addressShort: "268 Lý Thường Kiệt · Q.10",
  venueEn: "Ho Chi Minh City University of Technology",
  mapsUrl: "https://maps.google.com/?q=268+Ly+Thuong+Kiet+Quan+10+Ho+Chi+Minh",
  notes: ["Trang phục · Smart casual", "Gửi xe · Cổng Lý Thường Kiệt", "Chụp ảnh sau lễ · Photos after"],
  moments: [
    { n: "01", year: "2022", vi: "Nhập học Bách Khoa", en: "Freshman at HCMUT", body: "Bước chân vào Khoa học Máy tính — ĐHQG-HCM, Trường ĐH Bách Khoa.", color: "tomato", rot: -1.6 },
    { n: "02", year: "2023", vi: "Những đêm deadline", en: "Late-night deadlines", body: "Bài lab, đồ án và những dòng code đầu tiên chạy được lúc hai giờ sáng.", color: "blue", rot: 1.4 },
    { n: "03", year: "2025", vi: "Thực tập đầu tiên", en: "First internship · TMA Solutions", body: "Viết React thật cho khách hàng thật, học cách làm việc trong một đội Agile.", color: "jade", rot: -1.2 },
    { n: "04", year: "2026", vi: "Đi làm & luận văn", en: "Work meets thesis", body: "Front-end Developer ban ngày, TrackNest ban đêm — và chặng cuối của tấm bằng.", color: "canary", rot: 1.8 },
  ],
  defaultNote: {
    vi: "Ở đâu đó trên hành trình ấy, mình đã gặp bạn. Cảm ơn vì đã là một phần của câu chuyện.",
    en: "Somewhere along the way, I met you — thank you for being part of the story.",
  },
  personalNoteEn: "A note just for you.",
  musicYoutubeId: "", // owner fills in the YouTube video ID
};
