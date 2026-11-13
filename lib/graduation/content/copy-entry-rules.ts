import { z } from "zod";
import type { CopyField } from "./fields";
import { allowedTokens } from "./fields/tokens";
import { LIMITS } from "./settings-rules";
import { templateTokens } from "./template";

export function copyEntryError(field: CopyField | undefined, value: string): string | null {
  if (!field) return "Trường không tồn tại";
  if (value.length > LIMITS.copy) return `Tối đa ${LIMITS.copy} ký tự`;
  const allowed = allowedTokens(field);
  const unsupported = templateTokens(value).filter((token) => !allowed.includes(token));
  return unsupported.length > 0 ? `Chỗ trống không hỗ trợ: ${unsupported.map((token) => `{${token}}`).join(", ")}` : null;
}

const dropBlank = (entries: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(entries)
      .map(([key, value]) => [key, value.trim()] as const)
      .filter(([, value]) => value !== ""),
  );

export function copyOverridesSchema(fields: readonly CopyField[]) {
  const byKey = new Map(fields.map((field) => [field.key, field]));
  return z
    .record(z.string(), z.string())
    .transform(dropBlank)
    .superRefine((entries, ctx) => {
      for (const [key, value] of Object.entries(entries)) {
        const message = copyEntryError(byKey.get(key), value);
        if (message) ctx.addIssue({ code: "custom", path: [key], message });
      }
    });
}
