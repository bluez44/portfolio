import { describe, expect, it } from "vitest";
import { defineFields } from "@/lib/graduation/content/fields/define";
import { STATIC_VARS, allowedTokens } from "@/lib/graduation/content/fields/tokens";

describe("allowedTokens", () => {
  it("allows every static var", () => {
    expect(allowedTokens({})).toEqual([...STATIC_VARS]);
  });
  it("adds the call var", () => {
    expect(allowedTokens({ call: "name" })).toEqual([...STATIC_VARS, "name"]);
  });
});

describe("defineFields", () => {
  it("binds section and group and defaults to a single-line text field", () => {
    const field = defineFields("met", "Tiêu đề")("met.heading.lead", "Phần đầu");
    expect(field).toEqual({ key: "met.heading.lead", section: "met", label: "Phần đầu", kind: "text", group: "Tiêu đề" });
  });
  it("omits the group when none is given and applies options", () => {
    const field = defineFields("met")("met.andYou", "Nhãn", { call: "name" });
    expect(field).toEqual({ key: "met.andYou", section: "met", label: "Nhãn", kind: "text", call: "name" });
  });
});
