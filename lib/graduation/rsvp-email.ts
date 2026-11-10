import type { EmailMessage } from "@/lib/email/send-email";
import { isEmail } from "./rsvp-contact";
import type { RsvpAnswer, RsvpStatus } from "./types";

export type RsvpNotice = {
  name: string;
  slug: string;
  answer: RsvpAnswer;
  previous: RsvpStatus | null;
  at: Date;
};

const LABEL: Record<RsvpStatus, string> = { yes: "Sẽ đến", no: "Không đến" };

const formatAt = (at: Date) =>
  new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    dateStyle: "short",
    timeStyle: "short",
  }).format(at);

function history(status: RsvpStatus, previous: RsvpStatus | null): string {
  if (!previous) return "Lần đầu trả lời";
  return previous === status ? "Cập nhật câu trả lời" : `Đổi từ: ${LABEL[previous]}`;
}

function details(answer: RsvpAnswer): string[] {
  const main = answer.status === "yes" ? `Liên hệ: ${answer.contact}` : `Lý do: ${answer.reason}`;
  return [main, `Lời chúc: ${answer.wish ?? "(không có)"}`];
}

export function buildRsvpEmail({ name, slug, answer, previous, at }: RsvpNotice): EmailMessage {
  const replyTo = answer.status === "yes" && isEmail(answer.contact) ? answer.contact : undefined;
  return {
    subject: `RSVP: ${name} — ${LABEL[answer.status]}`,
    text: [
      `Khách: ${name} (${slug})`,
      `Trả lời: ${LABEL[answer.status]}`,
      ...details(answer),
      history(answer.status, previous),
      `Lúc: ${formatAt(at)}`,
    ].join("\n"),
    replyTo,
  };
}
