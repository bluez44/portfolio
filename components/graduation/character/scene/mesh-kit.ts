import * as THREE from "three";
import type { GeometryCache } from "../../shared/three/geometry-cache";
import { createPrimitives, type Primitives } from "../../shared/three/primitives";

type Vec3 = [number, number, number];

export type MeshKit = {
  add(parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, pos?: Vec3 | null, rot?: Vec3 | null, line?: number): THREE.Mesh;
  group(parent: THREE.Object3D, pos?: Vec3): THREE.Group;
  down(rt: number, rb: number, h: number, segments?: number): THREE.CylinderGeometry;
  up(rt: number, rb: number, h: number, segments?: number): THREE.CylinderGeometry;
  geo: Primitives;
  cache: GeometryCache;
};

export function createMeshKit(outline: THREE.Material, cache: GeometryCache): MeshKit {
  const shifted = (name: string, rt: number, rb: number, h: number, s: number, dy: number) =>
    cache.get(`${name}:${rt},${rb},${h},${s}`, () => new THREE.CylinderGeometry(rt, rb, h, s).translate(0, dy, 0));

  return {
    add(parent, geo, mat, pos, rot, line = 0.022) {
      const mesh = new THREE.Mesh(geo, mat);
      if (line) mesh.add(new THREE.Mesh(cache.outline(geo, line), outline));
      if (pos) mesh.position.set(...pos);
      if (rot) mesh.rotation.set(...rot);
      parent.add(mesh);
      return mesh;
    },
    group(parent, pos) {
      const g = new THREE.Group();
      if (pos) g.position.set(...pos);
      parent.add(g);
      return g;
    },
    down: (rt, rb, h, s = 18) => shifted("down", rt, rb, h, s, -h / 2),
    up: (rt, rb, h, s = 20) => shifted("up", rt, rb, h, s, h / 2),
    geo: createPrimitives(cache),
    cache,
  };
}
