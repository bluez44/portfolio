import { describe, expect, it } from "vitest";
import { toRowField } from "@/app/admin/graduation/components/fields/row-field";
import { COPY_FIELD_BY_KEY } from "@/lib/graduation/content/fields";

const field = (key: string) => {
  const found = COPY_FIELD_BY_KEY.get(key);
  if (!found) throw new Error(key);
  return found;
};

describe("toRowField", () => {
  it("keeps single-line text fields on one line and offers their call token", () => {
    expect(toRowField(field("met.andYou"))).toMatchObject({ key: "met.andYou", multiline: false });
    expect(toRowField(field("met.andYou")).tokens).toContain("name");
  });
  it("uses a textarea for long text and lists", () => {
    expect(toRowField(field("card.body")).multiline).toBe(true);
    expect(toRowField(field("ends.notes")).multiline).toBe(true);
  });
});
