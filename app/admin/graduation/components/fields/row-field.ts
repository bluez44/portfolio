import type { CopyField } from "@/lib/graduation/content/fields";
import { allowedTokens } from "@/lib/graduation/content/fields/tokens";

export type RowField = { key: string; label: string; multiline: boolean; tokens: readonly string[] };

export const toRowField = (field: CopyField): RowField => ({
  key: field.key,
  label: field.label,
  multiline: field.kind !== "text",
  tokens: allowedTokens(field),
});
