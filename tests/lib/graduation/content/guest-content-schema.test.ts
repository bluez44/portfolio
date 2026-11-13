import { describe, expect, it } from "vitest";
import { guestContentInputSchema, guestContentSchema } from "@/lib/graduation/content/guest-content-schema";

describe("guestContentSchema", () => {
  it("accepts guest-editable keys in both languages", () => {
    const result = guestContentSchema.safeParse({ vi: { "card.greeting": "Chào" }, en: { "card.greeting": "Hi" } });
    expect(result.success).toBe(true);
  });
  it("rejects keys a guest cannot override", () => {
    const result = guestContentSchema.safeParse({ vi: { "gate.tapBee": "x" } });
    expect(result.error?.issues[0].path).toEqual(["vi", "gate.tapBee"]);
  });
  it("rejects an end before the start", () => {
    const result = guestContentSchema.safeParse({ event: { start: "2026-12-01T04:00:00.000Z", end: "2026-12-01T02:00:00.000Z" } });
    expect(result.error?.issues[0].path).toEqual(["event", "end"]);
  });
  it("accepts a lone start", () => {
    expect(guestContentSchema.safeParse({ event: { start: "2026-12-20T07:00:00.000Z" } }).success).toBe(true);
  });
});

describe("guestContentInputSchema", () => {
  it("converts the legacy shape", () => {
    expect(guestContentInputSchema.parse({ envelope: { cardGreeting: "Kính gửi," } }).vi).toEqual({ "card.greeting": "Kính gửi," });
  });
});
