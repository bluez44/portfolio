import { defineFields } from "./define";

const content = defineFields("finale", "Nội dung");
const countdown = defineFields("finale", "Đếm ngược");
const reply = defineFields("finale", "Thẻ hồi âm");

export const FINALE_FIELDS = [
  content("finale.heading.lead", "Tiêu đề (phần đầu)"),
  content("finale.heading.accent", "Tiêu đề (phần nhấn)"),
  content("finale.downloadCard", "Nút tải ảnh thiệp"),
  content("finale.backToTop", "Nút lên đầu trang"),
  countdown("finale.countdown.days", "Ngày"),
  countdown("finale.countdown.hours", "Giờ"),
  countdown("finale.countdown.minutes", "Phút"),
  countdown("finale.countdown.seconds", "Giây"),
  countdown("finale.countdown.during", "Khi đang diễn ra"),
  countdown("finale.countdown.after", "Khi đã kết thúc"),
  reply("finale.replyOf", "Tiêu đề thẻ hồi âm", { call: "name" }),
  reply("finale.status.yes", "Trạng thái sẽ đến"),
  reply("finale.status.no", "Trạng thái không đến"),
  reply("finale.noReply", "Khi chưa hồi âm"),
  reply("finale.replyNow", "Nút hồi âm ngay"),
  reply("finale.dateMark", "Ngày ở chân thẻ"),
];
