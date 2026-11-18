import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { INITIAL_POSE } from "@/components/graduation/character/scene/constants";
import { createMaterials, type Materials } from "@/components/graduation/character/scene/materials";
import { createMeshKit } from "@/components/graduation/character/scene/mesh-kit";
import { applyPose } from "@/components/graduation/character/scene/pose";
import { buildRig } from "@/components/graduation/character/scene/rig";
import { createGeometryCache } from "@/components/graduation/shared/three/geometry-cache";

const PALETTE = { paper: "#f6f1e7", paper2: "#efe8da", paper3: "#e5dccb", ink: "#1c1b1f", tomato: "#e8543a", canary: "#f2c230", blue: "#2f5fb3", jade: "#2e9e7a" };
/** The gown torso is `k.up(0.3, 0.38, 0.8)` in spine space. */
const torsoRadius = (y: number) => 0.38 - 0.1 * y;

function posed(sit: number) {
  const M = createMaterials(PALETTE);
  const scene = new THREE.Scene();
  const R = buildRig(scene, createMeshKit(M.outline, createGeometryCache()), M, PALETTE);
  applyPose(R, { ...INITIAL_POSE, x: 0, ry: 0, wave: 0, sit }, { time: 0, phase: 0 }, { halfW: 5, halfH: 3, scale: 1 });
  scene.updateMatrixWorld(true);
  return { M, R };
}

/** Smallest distance of the mesh's vertices outside the gown torso (negative: inside it). */
function gownClearance(mesh: THREE.Mesh, spine: THREE.Object3D): number {
  const toSpine = spine.matrixWorld.clone().invert();
  const pos = mesh.geometry.attributes.position;
  const v = new THREE.Vector3();
  let min = Infinity;
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld).applyMatrix4(toSpine);
    if (v.y >= 0 && v.y <= 0.8) min = Math.min(min, Math.hypot(v.x, v.z) - torsoRadius(v.y));
  }
  return min;
}

const meshesWith = (root: THREE.Object3D, materials: THREE.Material[]) => {
  const found: THREE.Mesh[] = [];
  root.traverse((o) => {
    if (o instanceof THREE.Mesh && materials.includes(o.material as THREE.Material)) found.push(o);
  });
  return found;
};

const regalia = (M: Materials) => [M.cowlNavy, M.cowlCyan, M.cowlSilver, M.stolePattern, M.stolePlain];

describe("graduation regalia fit", () => {
  it("drapes the hood and stole on the gown instead of inside it", () => {
    const { M, R } = posed(0);
    const meshes = meshesWith(R.spine, regalia(M));
    expect(meshes.length).toBeGreaterThan(8);
    for (const mesh of meshes) expect(gownClearance(mesh, R.spine)).toBeGreaterThanOrEqual(0);
  });

  it("keeps the laptop clear of the gown and stole while sitting", () => {
    const { M, R } = posed(1);
    // The stole stands about 0.04 off the gown, so the laptop needs more than that.
    for (const mesh of meshesWith(R.laptop, [M.laptop])) expect(gownClearance(mesh, R.spine)).toBeGreaterThan(0.06);
  });
});
