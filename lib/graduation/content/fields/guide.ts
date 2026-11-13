import { defineFields } from "./define";

const field = defineFields("ends", "Bản đồ & tour 360°");

export const GUIDE_FIELDS = [
  field("ends.guide.map.tab", "Tab bản đồ"),
  field("ends.guide.map.hint", "Gợi ý dùng bản đồ (máy tính)"),
  field("ends.guide.map.touchHint", "Gợi ý dùng bản đồ (cảm ứng)"),
  field("ends.guide.tour.tab", "Tab tour"),
  field("ends.guide.tour.load", "Nút bắt đầu tour"),
  field("ends.guide.tour.open", "Nút mở toàn màn hình"),
  field("ends.guide.tour.credit.label", "Nhãn nguồn"),
  field("ends.guide.tour.credit.owner", "Tên đơn vị nguồn"),
  field("ends.guide.loading", "Chữ đang tải"),
  field("ends.guide.tabsLabel", "Tên nhóm tab (trình đọc màn hình)"),
  field("ends.guide.map.frameTitle", "Tên khung bản đồ (trình đọc màn hình)"),
  field("ends.guide.tour.frameTitle", "Tên khung tour (trình đọc màn hình)"),
];
