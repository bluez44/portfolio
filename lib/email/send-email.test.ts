import { describe, expect, it } from "vitest";
import { readEmailConfig, sendEmail } from "./send-email";

describe("readEmailConfig", () => {
  it("returns null when any variable is missing", () => {
    expect(readEmailConfig({ RESEND_API_KEY: "k", CONTACT_FROM_EMAIL: "f" })).toBeNull();
  });
  it("maps env to config", () => {
    expect(
      readEmailConfig({ RESEND_API_KEY: "k", CONTACT_FROM_EMAIL: "f", CONTACT_TO_EMAIL: "t" }),
    ).toEqual({ apiKey: "k", from: "f", to: "t" });
  });
});

describe("sendEmail", () => {
  it("reports not_configured without calling Resend", async () => {
    await expect(sendEmail({ subject: "s", text: "t" }, null)).resolves.toEqual({
      ok: false,
      reason: "not_configured",
    });
  });
});
