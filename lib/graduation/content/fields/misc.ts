import { defineFields } from "./define";

const marks = defineFields("misc", "Dấu & ký hiệu");
const footer = defineFields("misc", "Footer");
const notFound = defineFields("misc", "Trang 404");

export const MISC_FIELDS = [
  marks("marks.school", "Tên trường viết tắt (dấu bưu điện)"),
  marks("marks.city", "Thành phố (dấu bưu điện)"),
  marks("marks.signature", "Ký hiệu chủ thiệp"),
  footer("footer", "Lời cảm ơn cuối trang", { kind: "textarea" }),
  notFound("notFound.kicker", "Dòng nhỏ"),
  notFound("notFound.heading.lead", "Tiêu đề (phần đầu)"),
  notFound("notFound.heading.accent", "Tiêu đề (phần nhấn)"),
  notFound("notFound.body", "Nội dung", { kind: "textarea" }),
];
