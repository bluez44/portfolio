import * as THREE from "three";

const signature = (geo: THREE.BufferGeometry) => {
  const p = geo.attributes.position.array;
  let weighted = 0;
  for (let i = 0; i < p.length; i++) weighted += p[i] * ((i % 7) + 1);
  return `${geo.type}:${p.length}:${weighted.toFixed(4)}`;
};

/** Shapes that appear under `root` as more than one geometry instance. */
export function findDuplicateGeometries(root: THREE.Object3D): string[] {
  const bySignature = new Map<string, Set<THREE.BufferGeometry>>();
  root.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    const key = signature(o.geometry);
    bySignature.set(key, (bySignature.get(key) ?? new Set()).add(o.geometry));
  });
  return [...bySignature].filter(([, set]) => set.size > 1).map(([key, set]) => `${set.size}× ${key}`);
}
