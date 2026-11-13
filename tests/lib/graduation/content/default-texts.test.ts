import { describe, expect, it } from "vitest";
import { COPY_FIELDS } from "@/lib/graduation/content/fields";
import { allowedTokens } from "@/lib/graduation/content/fields/tokens";
import { getPath, leafKeys, type Tree } from "@/lib/graduation/content/paths";
import { templateTokens } from "@/lib/graduation/content/template";
import { DEFAULT_TEXTS, LANGS } from "@/lib/graduation/i18n";

describe.each(LANGS)("default %s texts", (lang) => {
  const texts = DEFAULT_TEXTS[lang] as unknown as Tree;

  it("cover exactly the registered fields", () => {
    expect(leafKeys(texts).sort()).toEqual(COPY_FIELDS.map((field) => field.key).sort());
  });

  it("only use tokens their field allows", () => {
    const misuses = COPY_FIELDS.flatMap((field) => {
      const value = getPath(texts, field.key);
      const items = Array.isArray(value) ? value : [value];
      return items.flatMap((item) =>
        templateTokens(String(item))
          .filter((token) => !allowedTokens(field).includes(token))
          .map((token) => `${field.key}: {${token}}`),
      );
    });
    expect(misuses).toEqual([]);
  });
});
