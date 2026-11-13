import type { CopyField } from "@/lib/graduation/content/fields";

const fold = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase();

export function filterFields(fields: readonly CopyField[], query: string, extraText: (field: CopyField) => readonly string[]): CopyField[] {
  const needle = fold(query.trim());
  if (!needle) return [...fields];
  return fields.filter((field) => [field.label, field.key, ...extraText(field)].some((text) => fold(text).includes(needle)));
}
