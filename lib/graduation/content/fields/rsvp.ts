import { defineFields } from "./define";

const ask = defineFields("rsvp", "Câu hỏi");
const form = defineFields("rsvp", "Form");
const notice = defineFields("rsvp", "Thông báo");
const letter = defineFields("rsvp", "Thư hồi âm");

export const RSVP_FIELDS = [
  ask("rsvp.heading.lead", "Tiêu đề (phần đầu)"),
  ask("rsvp.heading.accent", "Tiêu đề (phần nhấn)"),
  ask("rsvp.prompt", "Câu hỏi", { call: "name" }),
  ask("rsvp.yes", "Nút sẽ đến"),
  ask("rsvp.no", "Nút không đến"),
  ask("rsvp.change", "Nút đổi ý"),
  form("rsvp.contact.label", "Nhãn ô liên hệ"),
  form("rsvp.contact.placeholder", "Gợi ý ô liên hệ"),
  form("rsvp.reason.label", "Nhãn ô lý do"),
  form("rsvp.reason.placeholder", "Gợi ý ô lý do"),
  form("rsvp.wish.label", "Nhãn ô lời chúc"),
  form("rsvp.wish.placeholder", "Gợi ý ô lời chúc"),
  form("rsvp.optional", "Chữ 'không bắt buộc'"),
  form("rsvp.submit", "Nút gửi"),
  form("rsvp.sending", "Chữ đang gửi"),
  form("rsvp.ownerPhone", "Nhãn số điện thoại chủ thiệp"),
  notice("rsvp.result.yes", "Thông báo khi sẽ đến"),
  notice("rsvp.result.no", "Thông báo khi không đến"),
  notice("rsvp.stamp", "Con dấu khi sẽ đến"),
  notice("rsvp.error", "Lỗi gửi"),
  notice("rsvp.fieldErrors.required", "Lỗi: chưa điền"),
  notice("rsvp.fieldErrors.invalid_contact", "Lỗi: liên hệ sai"),
  notice("rsvp.fieldErrors.too_long", "Lỗi: quá dài"),
  letter("rsvp.letter.to", "Người nhận"),
  letter("rsvp.letter.from", "Người gửi", { call: "name" }),
  letter("rsvp.letter.sent", "Thông báo đã gửi"),
];
