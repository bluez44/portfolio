import { defineFields } from "./define";

const field = defineFields("met");

export const MET_FIELDS = [
  field("met.heading.lead", "Tiêu đề (phần đầu)"),
  field("met.heading.accent", "Tiêu đề (phần nhấn)"),
  field("met.intro", "Đoạn giới thiệu", { kind: "textarea" }),
  field("met.andYou", "Nhãn trên lời nhắn cá nhân", { call: "name" }),
  field("met.defaultNote", "Lời nhắn cá nhân", { kind: "textarea" }),
  field("met.togetherCaption", "Chú thích ảnh chụp chung", { call: "name" }),
  field("met.polaroidCaption", "Chú thích khung polaroid", { call: "name" }),
];
