import { defineFields } from "./define";

const content = defineFields("ends", "Nội dung");
const ticket = defineFields("ends", "Vé");
const calendar = defineFields("ends", "Lịch");

export const ENDS_FIELDS = [
  content("ends.heading.lead", "Tiêu đề (phần đầu)"),
  content("ends.heading.accent", "Tiêu đề (phần nhấn)"),
  content("ends.intro", "Đoạn giới thiệu", { kind: "textarea" }),
  content("ends.specialMessage", "Lời nhắn riêng (để trống để ẩn)", { kind: "textarea", optional: true }),
  ticket("ends.stamp", "Con dấu vé (mỗi dòng là một dòng chữ)", { kind: "list" }),
  ticket("ends.when", "Nhãn thời gian"),
  ticket("ends.day", "Dòng ngày"),
  ticket("ends.where", "Nhãn địa điểm"),
  ticket("ends.venue", "Hội trường"),
  ticket("ends.address", "Địa chỉ"),
  ticket("ends.venueSub", "Dòng phụ địa điểm"),
  ticket("ends.notes", "Ghi chú (mỗi dòng một ghi chú)", { kind: "list" }),
  ticket("ends.directions", "Nút chỉ đường"),
  calendar("ends.addToCalendar", "Nút thêm vào lịch"),
  calendar("ends.calendar.google", "Tên Google Calendar"),
  calendar("ends.calendar.apple", "Tên lịch Apple"),
  calendar("ends.calendar.orOther", "Dòng gợi ý lịch còn lại", { call: "calendar" }),
];
