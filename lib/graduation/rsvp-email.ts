import type { EmailMessage } from "@/lib/email/send-email";
import type { RsvpStatus } from "./types";

export type RsvpNotice = {
  name: string;
  slug: string;
  status: RsvpStatus;
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

export function buildRsvpEmail({ name, slug, status, previous, at }: RsvpNotice): EmailMessage {
  const change = previous ? `Đổi từ: ${LABEL[previous]}` : "Lần đầu trả lời";
  return {
    subject: `RSVP: ${name} — ${LABEL[status]}`,
    text: [
      `Khách: ${name} (${slug})`,
      `Trả lời: ${LABEL[status]}`,
      change,
      `Lúc: ${formatAt(at)}`,
    ].join("\n"),
  };
}
