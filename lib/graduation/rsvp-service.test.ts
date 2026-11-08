import { describe, expect, it, vi } from "vitest";
import { buildRsvpEmail } from "./rsvp-email";
import { submitRsvp, type RsvpDeps } from "./rsvp-service";

const AT = new Date("2026-11-20T03:04:00Z");

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
  it("describes a first answer", () => {
    const mail = buildRsvpEmail({ name: "Minh Anh", slug: "minh-anh", status: "yes", previous: null, at: AT });
    expect(mail.subject).toBe("RSVP: Minh Anh — Sẽ đến");
    expect(mail.text).toContain("minh-anh");
    expect(mail.text).toContain("20/11/26");
    expect(mail.text).toContain("Lần đầu trả lời");
  });
  it("describes a change of answer", () => {
    const mail = buildRsvpEmail({ name: "A", slug: "a", status: "no", previous: "yes", at: AT });
    expect(mail.subject).toBe("RSVP: A — Không đến");
    expect(mail.text).toContain("Đổi từ: Sẽ đến");
  });
});

describe("submitRsvp", () => {
  it("saves, notifies and returns the status", async () => {
    const d = deps();
    await expect(submitRsvp({ slug: "minh-anh", status: "yes" }, d)).resolves.toEqual({ ok: true, status: "yes" });
    expect(d.saveRsvp).toHaveBeenCalledWith("g1", "yes");
    expect(d.notify).toHaveBeenCalledOnce();
  });

  it("rejects invalid input without touching deps", async () => {
    const d = deps();
    await expect(submitRsvp({ slug: "minh-anh", status: "maybe" }, d)).resolves.toEqual({ ok: false, error: "invalid" });
    expect(d.findGuest).not.toHaveBeenCalled();
  });

  it("returns not_found when the guest was deleted", async () => {
    const d = deps({ findGuest: vi.fn(async () => null) });
    await expect(submitRsvp({ slug: "minh-anh", status: "yes" }, d)).resolves.toEqual({ ok: false, error: "not_found" });
    expect(d.saveRsvp).not.toHaveBeenCalled();
  });

  it("still succeeds when the email is not configured or fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const notConfigured = deps({ notify: vi.fn(async () => ({ ok: false as const, reason: "not_configured" as const })) });
    await expect(submitRsvp({ slug: "minh-anh", status: "no" }, notConfigured)).resolves.toEqual({ ok: true, status: "no" });
    const throwing = deps({ notify: vi.fn(async () => { throw new Error("boom"); }) });
    await expect(submitRsvp({ slug: "minh-anh", status: "no" }, throwing)).resolves.toEqual({ ok: true, status: "no" });
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
