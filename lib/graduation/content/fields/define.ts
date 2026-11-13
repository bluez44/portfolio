import type { CopyField, CopySection } from "./types";

type FieldOptions = Partial<Pick<CopyField, "kind" | "call" | "optional">>;

export const defineFields =
  (section: CopySection, group?: string) =>
  (key: string, label: string, options: FieldOptions = {}): CopyField => ({
    key,
    section,
    label,
    kind: "text",
    ...(group ? { group } : {}),
    ...options,
  });
