/**
 * Up to `max` items spread evenly across `list`, in order, always keeping the first and the last,
 * so a sample of a long timeline still spans it from start to end.
 */
export function pickMemories<T>(list: readonly T[], max: number): T[] {
  if (list.length <= max) return [...list];
  if (max <= 0) return [];
  if (max === 1) return [list[0]];
  const step = (list.length - 1) / (max - 1);
  return Array.from({ length: max }, (_, i) => list[Math.round(i * step)]);
}
