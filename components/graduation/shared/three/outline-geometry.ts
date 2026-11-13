import * as THREE from "three";

/** Inflates a geometry along its normals for the inverted-hull outline. */
export function outlineGeometry(geo: THREE.BufferGeometry, t: number): THREE.BufferGeometry {
  const o = geo.clone();
  const p = o.attributes.position;
  const n = o.attributes.normal;
  for (let i = 0; i < p.count; i++) {
    p.setXYZ(i, p.getX(i) + n.getX(i) * t, p.getY(i) + n.getY(i) * t, p.getZ(i) + n.getZ(i) * t);
  }
  return o;
}
