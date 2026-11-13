import { defineFields } from "./define";

const header = defineFields("header", "Header");
const rails = defineFields("header", "Rails hai bên");

export const HEADER_FIELDS = [
  header("header.title", "Tiêu đề header"),
  header("header.back", "Nút quay về portfolio"),
  header("header.music", "Nhãn nút nhạc"),
  header("header.musicUnavailable", "Thông báo không phát được nhạc"),
  header("header.switchLang", "Nhãn chọn ngôn ngữ"),
  rails("rails.when", "Nhãn thời gian"),
  rails("rails.whenValue", "Giá trị thời gian"),
  rails("rails.where", "Nhãn địa điểm"),
  rails("rails.whereValue", "Giá trị địa điểm"),
  rails("rails.whereSub", "Dòng phụ địa điểm"),
];
