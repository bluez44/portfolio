import * as THREE from "three";

/** Three-band ramp for MeshToonMaterial; each value is a band's lightness (0–255). */
export function toonGradient([a, b, c]: [number, number, number]): THREE.DataTexture {
  const tex = new THREE.DataTexture(new Uint8Array([a, a, a, 255, b, b, b, 255, c, c, c, 255]), 3, 1, THREE.RGBAFormat);
  tex.minFilter = tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}
