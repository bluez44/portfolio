import { isRecord } from "./is-record";

export type Tree = Record<string, unknown>;

export function getPath(tree: Tree, key: string): unknown {
  return key.split(".").reduce<unknown>((node, part) => (isRecord(node) ? node[part] : undefined), tree);
}

export function setPath<T extends Tree>(tree: T, key: string, value: unknown): T {
  const [head, ...rest] = key.split(".");
  const child = tree[head];
  const next = rest.length === 0 ? value : setPath(isRecord(child) ? child : {}, rest.join("."), value);
  return { ...tree, [head]: next } as T;
}

export function leafKeys(tree: Tree, prefix = ""): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return isRecord(value) ? leafKeys(value, path) : [path];
  });
}
