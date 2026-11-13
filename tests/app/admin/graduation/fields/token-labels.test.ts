import { describe, expect, it } from "vitest";
import { TOKEN_LABELS } from "@/app/admin/graduation/components/fields/token-labels";
import { COPY_FIELDS } from "@/lib/graduation/content/fields";
import { allowedTokens } from "@/lib/graduation/content/fields/tokens";

describe("TOKEN_LABELS", () => {
  it("labels every token a field can use", () => {
    const tokens = new Set(COPY_FIELDS.flatMap((field) => allowedTokens(field)));
    expect([...tokens].filter((token) => !TOKEN_LABELS[token])).toEqual([]);
  });
});
