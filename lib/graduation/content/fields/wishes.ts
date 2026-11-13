import { defineFields } from "./define";

const content = defineFields("wishes", "Nội dung");
const card = defineFields("wishes", "Bưu thiếp");
const controls = defineFields("wishes", "Điều khiển");

export const WISHES_FIELDS = [
  content("wishes.heading.lead", "Tiêu đề (phần đầu)"),
  content("wishes.heading.accent", "Tiêu đề (phần nhấn)"),
  content("wishes.intro", "Đoạn giới thiệu", { kind: "textarea" }),
  content("wishes.count", "Chú thích số lời chúc"),
  content("wishes.mine", "Nhãn lời chúc của bạn"),
  content("wishes.loading", "Chữ đang tải"),
  content("wishes.error", "Lỗi kết nối"),
  content("wishes.empty", "Khi chưa có lời chúc"),
  card("wishes.airMail", "Dòng đầu bưu thiếp", { call: "n" }),
  card("wishes.to", "Nhãn người nhận"),
  card("wishes.from", "Nhãn người gửi"),
  card("wishes.wishFrom", "Tên ô lời chúc (trình đọc màn hình)", { call: "name" }),
  controls("wishes.close", "Nút đóng"),
  controls("wishes.zoomIn", "Nút phóng to"),
  controls("wishes.zoomOut", "Nút thu nhỏ"),
  controls("wishes.recenter", "Nút về giữa"),
];
