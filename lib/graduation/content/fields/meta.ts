import { defineFields } from "./define";

const field = defineFields("misc", "Meta & tab trình duyệt");

export const META_FIELDS = [
  field("meta.title", "Tiêu đề trang (khi không có khách)"),
  field("meta.guestTitle", "Tiêu đề trang theo khách", { call: "name" }),
  field("meta.description", "Mô tả khi chia sẻ link", { kind: "textarea" }),
  field("meta.eventTitle", "Tên sự kiện trong lịch"),
];
