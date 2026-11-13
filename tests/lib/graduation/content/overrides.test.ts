import { describe, expect, it } from "vitest";
import { setOverride } from "@/lib/graduation/content/overrides";

describe("setOverride", () => {
  it("adds a value", () => {
    expect(setOverride(undefined, "met.intro", "Hi")).toEqual({ "met.intro": "Hi" });
  });
  it("removes the key when the value is empty", () => {
    expect(setOverride({ "met.intro": "Hi", "card.body": "B" }, "met.intro", "")).toEqual({ "card.body": "B" });
  });
  it("keeps whitespace while typing", () => {
    expect(setOverride({}, "card.body", "a ")).toEqual({ "card.body": "a " });
  });
});
