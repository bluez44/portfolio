import { describe, expect, it } from "vitest";
import { resolveOwner } from "@/lib/graduation/content/resolve-owner";

describe("resolveOwner", () => {
  it("falls back to the defaults and the env phone", () => {
    expect(resolveOwner(undefined, "0901")).toEqual({ name: "Võ Lê Quang Vinh", initials: "QV", website: "vinhvolequang.io.vn", phone: "0901" });
  });
  it("prefers the stored values", () => {
    expect(resolveOwner({ name: "A", initials: "AB", website: "a.dev", phone: "0123" }, "0901")).toEqual({ name: "A", initials: "AB", website: "a.dev", phone: "0123" });
  });
  it("has no phone when neither is set", () => {
    expect(resolveOwner({}, null).phone).toBeNull();
  });
});
