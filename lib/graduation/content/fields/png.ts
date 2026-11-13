import { defineFields } from "./define";

const field = defineFields("png");

export const PNG_FIELDS = [
  field("png.attend", "Dòng mời tham dự"),
  field("png.faculty", "Khoa / trường"),
  field("png.guestFallback", "Tên thay thế khi không có khách"),
  field("png.qrWebTitle", "Tiêu đề mã QR thiệp"),
  field("png.qrWebBody", "Mô tả mã QR thiệp"),
  field("png.qrWebAlt", "Mô tả ảnh mã QR thiệp"),
  field("png.qrMapTitle", "Tiêu đề mã QR chỉ đường"),
  field("png.qrMapBody", "Mô tả mã QR chỉ đường"),
  field("png.qrMapAlt", "Mô tả ảnh mã QR chỉ đường"),
  field("png.footer", "Dòng cuối thiệp"),
];
