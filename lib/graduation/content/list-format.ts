export const splitList = (value: string): string[] =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

export const joinList = (items: readonly string[]): string => items.join("\n");
