import * as THREE from "three";
import type { GeometryCache } from "./geometry-cache";
import { inkAndPaperByDepth, type RisoPalette } from "./palette";
import { createPrimitives } from "./primitives";

type Vec3 = [number, number, number];

/** Head sphere radius in model units. */
export const BEE_HEAD_RADIUS = 9.5;

export type BeeModel = {
  group: THREE.Group;
  head: THREE.Mesh;
  wings: { pivot: THREE.Group; side: 1 | -1 }[];
  eyes: THREE.Mesh[];
  applyPalette(p: RisoPalette): void;
  /** Releases the bee's materials; its geometry belongs to the cache passed in. */
  dispose(): void;
};

/** The design's toon bee in its own units (body radius 14, facing +x); callers scale and pose it. */
export function createBeeModel(gradient: THREE.DataTexture, outline: THREE.Material, palette: RisoPalette, geometries: GeometryCache): BeeModel {
  const geo = createPrimitives(geometries);
  const toon = (extra?: THREE.MeshToonMaterialParameters) => new THREE.MeshToonMaterial({ gradientMap: gradient, ...extra });
  const yellow = toon();
  const ink = toon();
  const eye = toon();
  const wing = toon({ transparent: true, opacity: 0.82 });
  // The bee keeps its identity in both themes: a canary body with dark stripes and pale eyes and wings.
  const applyPalette = (p: RisoPalette) => {
    const { deep, pale } = inkAndPaperByDepth(p);
    yellow.color.set(p.canary);
    ink.color.set(deep);
    eye.color.set(pale);
    wing.color.set(pale);
  };
  applyPalette(palette);

  const add = (parent: THREE.Object3D, geometry: THREE.BufferGeometry, mat: THREE.Material, pos?: Vec3 | null, rot?: Vec3 | null, scale?: Vec3 | null, line = 1.3) => {
    const mesh = new THREE.Mesh(geometry, mat);
    if (line) mesh.add(new THREE.Mesh(geometries.outline(geometry, line), outline));
    if (pos) mesh.position.set(...pos);
    if (rot) mesh.rotation.set(...rot);
    if (scale) mesh.scale.set(...scale);
    parent.add(mesh);
    return mesh;
  };

  const group = new THREE.Group();
  add(group, geo.sphere(14, 24, 18), yellow, null, null, [1.35, 1, 1]);
  for (const [x, r] of [[-1, 14.3], [-9.5, 12.4]] as const) {
    const band = geometries.get(`bee-band:${r}`, () => new THREE.CylinderGeometry(r, r, 5, 24).rotateZ(Math.PI / 2));
    add(group, band, ink, [x, 0, 0], null, null, 0);
  }
  const head = add(group, geo.sphere(BEE_HEAD_RADIUS, 20, 16), ink, [19, 1, 0]);
  const eyes = [5, -5].map((z) => add(group, geo.sphere(2.4, 10, 8), eye, [25.5, 3.5, z], null, null, 0));
  const stinger = geometries.get("bee-stinger", () => new THREE.ConeGeometry(3, 8, 10).rotateZ(Math.PI / 2));
  add(group, stinger, ink, [-21.5, 0, 0], null, null, 0.8);
  const stalk = geometries.get("bee-stalk", () => new THREE.CylinderGeometry(0.7, 0.7, 11, 6).translate(0, 5.5, 0));
  for (const z of [4, -4]) {
    const antenna = add(group, stalk, ink, [22, 8, z], [z > 0 ? 0.35 : -0.35, 0, -0.45], null, 0);
    add(antenna, geo.sphere(1.8, 8, 6), ink, [0, 11, 0], null, null, 0);
  }
  const wings = ([1, -1] as const).map((side) => {
    const pivot = new THREE.Group();
    pivot.position.set(3, 11, side * 4);
    group.add(pivot);
    add(pivot, geo.sphere(10, 16, 12), wing, [-2, 0, side * 9], null, [0.75, 0.14, 1], 1);
    return { pivot, side };
  });

  return {
    group,
    head,
    wings,
    eyes,
    applyPalette,
    dispose() {
      [yellow, ink, eye, wing].forEach((m) => m.dispose());
    },
  };
}
