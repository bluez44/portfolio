import { describe, expect, it, vi } from "vitest";
import { buildRsvpEmail } from "@/lib/graduation/rsvp-email";
import { submitRsvp, type RsvpDeps } from "@/lib/graduation/rsvp-service";

const AT = new Date("2026-11-20T03:04:00Z");
const YES = { slug: "minh-anh", status: "yes", contact: "minh@example.com", wish: "Chúc mừng!" };
const NO = { slug: "minh-anh", status: "no", reason: "Đi công tác" };

function deps(overrides: Partial<RsvpDeps> = {}): RsvpDeps {
  return {
    findGuest: vi.fn(async () => ({ id: "g1", slug: "minh-anh", name: "Minh Anh", note: null })),
    saveRsvp: vi.fn(async () => ({ previous: null })),
    notify: vi.fn(async () => ({ ok: true as const })),
    now: () => AT,
    ...overrides,
  };
}

describe("buildRsvpEmail", () => {
  it("describes a first attending answer and replies to an email contact", () => {
    const mail = buildRsvpEmail({ name: "Minh Anh", slug: "minh-anh", answer: { status: "yes", contact: "minh@example.com", wish: "Chúc mừng!" }, previous: null, at: AT });
    expect(mail.subject).toBe("RSVP: Minh Anh — Sẽ đến");
    expect(mail.text).toContain("Liên hệ: minh@example.com");
    expect(mail.text).toContain("Lời chúc: Chúc mừng!");
    expect(mail.text).toContain("Lần đầu trả lời");
    expect(mail.text).toContain("20/11/26");
    expect(mail.replyTo).toBe("minh@example.com");
  });
  it("describes a change to declining, without a reply-to", () => {
    const mail = buildRsvpEmail({ name: "A", slug: "a", answer: { status: "no", reason: "Ốm", wish: null }, previous: "yes", at: AT });
    expect(mail.subject).toBe("RSVP: A — Không đến");
    expect(mail.text).toContain("Lý do: Ốm");
    expect(mail.text).toContain("Lời chúc: (không có)");
    expect(mail.text).toContain("Đổi từ: Sẽ đến");
    expect(mail.replyTo).toBeUndefined();
  });
  it("marks a resubmitted answer as an update and does not reply to a phone", () => {
    const mail = buildRsvpEmail({ name: "A", slug: "a", answer: { status: "yes", contact: "0901234567", wish: null }, previous: "yes", at: AT });
    expect(mail.text).toContain("Cập nhật câu trả lời");
    expect(mail.replyTo).toBeUndefined();
  });
});

describe("submitRsvp", () => {
  it("saves the answer, notifies and returns it", async () => {
    const d = deps();
    const answer = { status: "yes", contact: "minh@example.com", wish: "Chúc mừng!" };
    await expect(submitRsvp(YES, d)).resolves.toEqual({ ok: true, answer });
    expect(d.saveRsvp).toHaveBeenCalledWith("g1", answer);
    expect(d.notify).toHaveBeenCalledOnce();
  });

  it("returns field errors without touching deps", async () => {
    const d = deps();
    await expect(submitRsvp({ ...NO, reason: "" }, d)).resolves.toEqual({ ok: false, error: "invalid", fieldErrors: { reason: "required" } });
    expect(d.findGuest).not.toHaveBeenCalled();
  });

  it("returns not_found when the guest was deleted", async () => {
    const d = deps({ findGuest: vi.fn(async () => null) });
    await expect(submitRsvp(YES, d)).resolves.toEqual({ ok: false, error: "not_found" });
    expect(d.saveRsvp).not.toHaveBeenCalled();
  });

  it("emails every submission, since the form content may have changed", async () => {
    const d = deps({ saveRsvp: vi.fn(async () => ({ previous: "no" as const })) });
    await submitRsvp(NO, d);
    expect(d.notify).toHaveBeenCalledOnce();
  });

  it("still succeeds when the email is not configured or fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const notConfigured = deps({ notify: vi.fn(async () => ({ ok: false as const, reason: "not_configured" as const })) });
    await expect(submitRsvp(NO, notConfigured)).resolves.toMatchObject({ ok: true });
    const throwing = deps({ notify: vi.fn(async () => { throw new Error("boom"); }) });
    await expect(submitRsvp(NO, throwing)).resolves.toMatchObject({ ok: true });
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
