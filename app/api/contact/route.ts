import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/schemas/contact";
import { sendEmail } from "@/lib/email/send-email";
import { z } from "zod";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid form data.", issues: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  const { name, email, message } = parsed.data;

  const result = await sendEmail({
    subject: `New message from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
    replyTo: email,
  });

  if (!result.ok) {
    return result.reason === "not_configured"
      ? NextResponse.json({ error: "Email service is not configured." }, { status: 500 })
      : NextResponse.json({ error: "Failed to send message." }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
