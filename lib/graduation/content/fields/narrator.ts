import { defineFields } from "./define";

const field = defineFields("narrator");

export const NARRATOR_FIELDS = [
  field("narrator.wave", "Khi vẫy chào", { call: "name" }),
  field("narrator.bow", "Khi cúi chào", { call: "name" }),
  field("narrator.desk", "Phần bốn năm", { call: "name" }),
  field("narrator.cheer", "Phần dành cho bạn", { call: "name" }),
  field("narrator.point", "Phần địa điểm", { call: "name" }),
  field("narrator.toss", "Phần hồi âm", { call: "name" }),
  field("narrator.play", "Phần lời chúc", { call: "name" }),
  field("narrator.farewell", "Tạm biệt", { call: "name" }),
];
