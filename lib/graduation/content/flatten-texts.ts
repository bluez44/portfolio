import type { CopyTexts } from "./copy-texts";
import { COPY_FIELDS, type CopyField } from "./fields";
import { joinList } from "./list-format";
import { getPath, type Tree } from "./paths";

const asText = (value: unknown): string => (Array.isArray(value) ? joinList(value.map(String)) : typeof value === "string" ? value : "");

export const flattenTexts = (texts: CopyTexts, fields: readonly CopyField[] = COPY_FIELDS): Record<string, string> =>
  Object.fromEntries(fields.map((field) => [field.key, asText(getPath(texts as unknown as Tree, field.key))]));
