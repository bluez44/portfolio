import type { CopyField } from "./fields";
import { getPath, setPath, type Tree } from "./paths";
import { fillTemplate, type TemplateVars } from "./template";

function renderField(field: CopyField, raw: unknown, vars: TemplateVars): unknown {
  if (Array.isArray(raw)) return raw.map((item) => fillTemplate(String(item), vars));
  const text = typeof raw === "string" ? raw : "";
  const { call } = field;
  if (call) return (value: string) => fillTemplate(text, { ...vars, [call]: value });
  if (field.optional && text.trim() === "") return undefined;
  return fillTemplate(text, vars);
}

export function buildCopy(texts: Tree, fields: readonly CopyField[], vars: TemplateVars): Tree {
  return fields.reduce((tree, field) => setPath(tree, field.key, renderField(field, getPath(texts, field.key), vars)), texts);
}
