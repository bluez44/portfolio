export type CopyOverrides = Partial<Record<string, string>>;

export function setOverride(overrides: CopyOverrides | undefined, key: string, value: string): CopyOverrides {
  const next = { ...overrides };
  if (value === "") delete next[key];
  else next[key] = value;
  return next;
}
