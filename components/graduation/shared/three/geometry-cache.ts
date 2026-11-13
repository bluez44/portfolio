import * as THREE from "three";
import { outlineGeometry } from "./outline-geometry";

/** One instance per distinct shape in a scene; the owner disposes them all at once. */
export type GeometryCache = {
  get<T extends THREE.BufferGeometry>(key: string, build: () => T): T;
  outline(geo: THREE.BufferGeometry, thickness: number): THREE.BufferGeometry;
  dispose(): void;
};

export function createGeometryCache(): GeometryCache {
  const byKey = new Map<string, THREE.BufferGeometry>();
  const outlines = new Map<THREE.BufferGeometry, Map<number, THREE.BufferGeometry>>();

  return {
    get<T extends THREE.BufferGeometry>(key: string, build: () => T): T {
      let geo = byKey.get(key);
      if (!geo) {
        geo = build();
        byKey.set(key, geo);
      }
      return geo as T;
    },
    outline(geo, thickness) {
      let byThickness = outlines.get(geo);
      if (!byThickness) {
        byThickness = new Map();
        outlines.set(geo, byThickness);
      }
      let hull = byThickness.get(thickness);
      if (!hull) {
        hull = outlineGeometry(geo, thickness);
        byThickness.set(thickness, hull);
      }
      return hull;
    },
    dispose() {
      byKey.forEach((geo) => geo.dispose());
      outlines.forEach((byThickness) => byThickness.forEach((hull) => hull.dispose()));
      byKey.clear();
      outlines.clear();
    },
  };
}
