import type { CopyField } from "@/lib/graduation/content/fields";

export type FieldGroup = { title: string | null; fields: CopyField[] };

export function groupFields(fields: readonly CopyField[]): FieldGroup[] {
  const groups: FieldGroup[] = [];
  for (const field of fields) {
    const title = field.group ?? null;
    const last = groups.at(-1);
    if (last && last.title === title) last.fields.push(field);
    else groups.push({ title, fields: [field] });
  }
  return groups;
}
