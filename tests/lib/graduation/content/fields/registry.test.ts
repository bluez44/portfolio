import { describe, expect, it } from "vitest";
import { COPY_FIELDS, COPY_FIELD_BY_KEY } from "@/lib/graduation/content/fields";
import { GUEST_COPY_FIELDS, GUEST_COPY_KEYS, GUEST_COPY_TABS } from "@/lib/graduation/content/fields/guest-keys";

describe("COPY_FIELDS", () => {
  it("has unique keys", () => {
    expect(COPY_FIELD_BY_KEY.size).toBe(COPY_FIELDS.length);
  });
  it("gives every field a label", () => {
    expect(COPY_FIELDS.every((field) => field.label.trim().length > 0)).toBe(true);
  });
  it("only marks free-text fields as optional", () => {
    expect(COPY_FIELDS.filter((field) => field.optional).map((field) => field.key)).toEqual(["ends.specialMessage"]);
  });
});

describe("guest keys", () => {
  it("only reference registered fields", () => {
    expect(GUEST_COPY_KEYS.filter((key) => !COPY_FIELD_BY_KEY.has(key))).toEqual([]);
  });
  it("flattens the guest tabs in order", () => {
    expect(GUEST_COPY_KEYS).toEqual([...GUEST_COPY_TABS.envelope, ...GUEST_COPY_TABS.met, ...GUEST_COPY_TABS.ends, ...GUEST_COPY_TABS.rsvp]);
    expect(GUEST_COPY_FIELDS.map((field) => field.key).sort()).toEqual([...GUEST_COPY_KEYS].sort());
  });
});
