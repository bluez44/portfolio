import * as THREE from "three";
import { outlineGeometry } from "../../shared/three/outline-geometry";

type Vec3 = [number, number, number];

export type MeshKit = {
  add(parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, pos?: Vec3 | null, rot?: Vec3 | null, line?: number): THREE.Mesh;
  group(parent: THREE.Object3D, pos?: Vec3): THREE.Group;
  down(rt: number, rb: number, h: number, segments?: number): THREE.CylinderGeometry;
  up(rt: number, rb: number, h: number, segments?: number): THREE.CylinderGeometry;
};

export function createMeshKit(outline: THREE.Material): MeshKit {
  return {
    add(parent, geo, mat, pos, rot, line = 0.022) {
      const mesh = new THREE.Mesh(geo, mat);
      if (line) mesh.add(new THREE.Mesh(outlineGeometry(geo, line), outline));
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
    down(rt, rb, h, s = 18) {
      const g = new THREE.CylinderGeometry(rt, rb, h, s);
      g.translate(0, -h / 2, 0);
      return g;
    },
    up(rt, rb, h, s = 20) {
      const g = new THREE.CylinderGeometry(rt, rb, h, s);
      g.translate(0, h / 2, 0);
      return g;
    },
  };
}
