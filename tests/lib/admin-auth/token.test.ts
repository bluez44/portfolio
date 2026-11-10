import { describe, expect, it } from "vitest";
import { ADMIN_SESSION_MAX_AGE_MS, signAdminToken, verifyAdminToken } from "@/lib/admin-auth/token";

const SECRET = "test-secret";
const NOW = 1_800_000_000_000;

describe("admin token", () => {
  it("round-trips", () => {
    expect(verifyAdminToken(signAdminToken(SECRET, NOW), SECRET, NOW)).toBe(true);
  });
  it("rejects the legacy 'true' cookie, empty and undefined", () => {
    expect(verifyAdminToken("true", SECRET, NOW)).toBe(false);
    expect(verifyAdminToken("", SECRET, NOW)).toBe(false);
    expect(verifyAdminToken(undefined, SECRET, NOW)).toBe(false);
  });
  it("rejects a tampered signature or timestamp", () => {
    const [issued, sig] = signAdminToken(SECRET, NOW).split(".");
    const flipped = sig.slice(0, -1) + (sig.endsWith("0") ? "1" : "0");
    expect(verifyAdminToken(`${issued}.${flipped}`, SECRET, NOW)).toBe(false);
    expect(verifyAdminToken(`${Number(issued) + 1}.${sig}`, SECRET, NOW)).toBe(false);
  });
  it("rejects a token signed with another secret", () => {
    expect(verifyAdminToken(signAdminToken("other", NOW), SECRET, NOW)).toBe(false);
  });
  it("rejects expired and future tokens", () => {
    const token = signAdminToken(SECRET, NOW);
    expect(verifyAdminToken(token, SECRET, NOW + ADMIN_SESSION_MAX_AGE_MS + 1)).toBe(false);
    expect(verifyAdminToken(token, SECRET, NOW - 60_000)).toBe(false);
  });
});
