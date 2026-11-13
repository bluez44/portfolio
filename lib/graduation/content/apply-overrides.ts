import type { CopyTexts } from "./copy-texts";
import { COPY_FIELDS, type CopyField } from "./fields";
import { splitList } from "./list-format";
import type { CopyOverrides } from "./overrides";
import { setPath, type Tree } from "./paths";

function overrideValue(field: CopyField, raw: string | undefined): string | string[] | undefined {
  const text = raw?.trim();
  if (!text) return undefined;
  if (field.kind !== "list") return text;
  const items = splitList(text);
  return items.length > 0 ? items : undefined;
}

export function applyOverrides(texts: CopyTexts, overrides: CopyOverrides | undefined, fields: readonly CopyField[] = COPY_FIELDS): CopyTexts {
  if (!overrides) return texts;
  const tree = fields.reduce<Tree>((acc, field) => {
    const value = overrideValue(field, overrides[field.key]);
    return value === undefined ? acc : setPath(acc, field.key, value);
  }, texts as unknown as Tree);
  return tree as unknown as CopyTexts;
}
