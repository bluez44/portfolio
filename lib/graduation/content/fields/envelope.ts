import { defineFields } from "./define";

const cover = defineFields("envelope", "Bìa");
const envelope = defineFields("envelope", "Phong bì");
const card = defineFields("envelope", "Thiệp");

export const ENVELOPE_FIELDS = [
  cover("stage.coverKicker", "Dòng nhỏ trên bìa"),
  cover("stage.cover.lead", "Tiêu đề bìa (phần đầu)"),
  cover("stage.cover.accent", "Tiêu đề bìa (phần nhấn)"),
  cover("stage.greetKicker", "Dòng nhỏ phần lời chào"),
  cover("stage.scrollHint", "Gợi ý cuộn để mở thư"),
  envelope("envelope.airMail", "Nhãn thư"),
  envelope("envelope.invitationNo", "Dòng dưới nhãn thư"),
  envelope("envelope.to", "Nhãn người nhận"),
  envelope("envelope.cordially", "Lời mời trên phong bì"),
  envelope("envelope.from", "Người gửi trên phong bì"),
  envelope("envelope.returnTo", "Nhãn địa chỉ người gửi"),
  envelope("envelope.faculty", "Khoa / lớp"),
  envelope("envelope.guest", "Chú thích dưới tên khách"),
  card("card.label", "Nhãn thiệp"),
  card("card.fig", "Ký hiệu góc thiệp"),
  card("card.greeting", "Lời chào"),
  card("card.body", "Nội dung thiệp", { kind: "textarea" }),
  card("card.author", "Chữ ký"),
  card("card.keepScrolling", "Gợi ý cuộn tiếp"),
  card("card.coverAlt", "Mô tả ảnh bìa (trình đọc màn hình)"),
];
