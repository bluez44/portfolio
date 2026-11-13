import { describe, expect, it } from "vitest";
import { copyEntryError, copyOverridesSchema } from "@/lib/graduation/content/copy-entry-rules";
import { COPY_FIELDS, COPY_FIELD_BY_KEY } from "@/lib/graduation/content/fields";

describe("copyEntryError", () => {
  it("accepts allowed tokens", () => {
    expect(copyEntryError(COPY_FIELD_BY_KEY.get("met.andYou"), "Hi {name}, {year}")).toBeNull();
  });
  it("rejects unknown fields", () => {
    expect(copyEntryError(undefined, "x")).toBe("Trường không tồn tại");
  });
  it("names the unsupported tokens", () => {
    expect(copyEntryError(COPY_FIELD_BY_KEY.get("met.intro"), "{name} {nam}")).toBe("Chỗ trống không hỗ trợ: {name}, {nam}");
  });
  it("is case-sensitive about tokens", () => {
    expect(copyEntryError(COPY_FIELD_BY_KEY.get("met.andYou"), "{Name}")).toBe("Chỗ trống không hỗ trợ: {Name}");
  });
  it("caps the length", () => {
    expect(copyEntryError(COPY_FIELD_BY_KEY.get("met.intro"), "x".repeat(2001))).toBe("Tối đa 2000 ký tự");
  });
});

describe("copyOverridesSchema", () => {
  const schema = copyOverridesSchema(COPY_FIELDS);
  it("trims and drops blank entries", () => {
    expect(schema.parse({ "met.intro": "  A ", "card.body": "  " })).toEqual({ "met.intro": "A" });
  });
  it("reports errors under the field key", () => {
    const result = schema.safeParse({ "met.intro": "{nam}" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(["met.intro"]);
  });
});
