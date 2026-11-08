import { Resend } from "resend";

export type EmailConfig = { apiKey: string; from: string; to: string };
export type EmailMessage = { subject: string; text: string; replyTo?: string };
export type SendEmailResult = { ok: true } | { ok: false; reason: "not_configured" | "send_failed" };

export function readEmailConfig(
  env: Record<string, string | undefined> = process.env,
): EmailConfig | null {
  const apiKey = env.RESEND_API_KEY;
  const from = env.CONTACT_FROM_EMAIL;
  const to = env.CONTACT_TO_EMAIL;
  return apiKey && from && to ? { apiKey, from, to } : null;
}

/** Sends a plain-text email to the site owner. Never throws. */
export async function sendEmail(
  message: EmailMessage,
  config: EmailConfig | null = readEmailConfig(),
): Promise<SendEmailResult> {
  if (!config) return { ok: false, reason: "not_configured" };
  try {
    const { error } = await new Resend(config.apiKey).emails.send({
      from: config.from,
      to: config.to,
      subject: message.subject,
      text: message.text,
      replyTo: message.replyTo,
    });
    return error ? { ok: false, reason: "send_failed" } : { ok: true };
  } catch {
    return { ok: false, reason: "send_failed" };
  }
}
