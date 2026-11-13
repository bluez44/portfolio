import { describe, expect, it } from "vitest";
import { groupFields } from "@/app/admin/graduation/settings/fields/group-fields";
import type { CopyField } from "@/lib/graduation/content/fields";

const field = (key: string, group?: string): CopyField => ({ key, section: "misc", label: key, kind: "text", ...(group ? { group } : {}) });

describe("groupFields", () => {
  it("groups consecutive fields that share a group", () => {
    const groups = groupFields([field("a", "G1"), field("b", "G1"), field("c"), field("d", "G1")]);
    expect(groups.map((g) => [g.title, g.fields.map((f) => f.key)])).toEqual([
      ["G1", ["a", "b"]],
      [null, ["c"]],
      ["G1", ["d"]],
    ]);
  });
});
