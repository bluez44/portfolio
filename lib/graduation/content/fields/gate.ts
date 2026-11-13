import { defineFields } from "./define";

const field = defineFields("gate");

export const GATE_FIELDS = [
  field("gate.tapBee", "Gợi ý dưới chú ong"),
  field("gate.silent", "Nút vào không nhạc"),
  field("gate.soundHint", "Gợi ý bật âm thanh"),
  field("gate.desktopHint", "Gợi ý xem trên máy tính (chỉ hiện trên điện thoại)"),
  field("gate.nowPlaying", "Nhãn đang phát nhạc"),
  field("gate.beePreparing", "Ong nói khi đang tải"),
  field("gate.beeNotice", "Ong nói khi sẵn sàng", { call: "name" }),
  field("gate.dialogLabel", "Tên hộp thoại (trình đọc màn hình)"),
  field("gate.wake", "Tên nút đánh thức ong (trình đọc màn hình)"),
];
