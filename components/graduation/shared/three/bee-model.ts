import * as THREE from "three";
import { outlineGeometry } from "../../character/scene/mesh-kit";

type Vec3 = [number, number, number];

export type BeeModel = {
  group: THREE.Group;
  wings: { pivot: THREE.Group; side: 1 | -1 }[];
  eyes: THREE.Mesh[];
  dispose(): void;
};

/** The design's toon bee in its own units (body radius 14, facing +x); callers scale and pose it. */
export function createBeeModel(gradient: THREE.DataTexture, outline: THREE.Material): BeeModel {
  const toon = (color: string, extra?: THREE.MeshToonMaterialParameters) =>
    new THREE.MeshToonMaterial({ color, gradientMap: gradient, ...extra });
  const yellow = toon("#f5c518");
  const ink = toon("#1c1b1f");
  const eye = toon("#fbf8f2");
  const wing = toon("#fbf8f2", { transparent: true, opacity: 0.82 });

  const add = (parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, pos?: Vec3 | null, rot?: Vec3 | null, scale?: Vec3 | null, line = 1.3) => {
    const mesh = new THREE.Mesh(geo, mat);
    if (line) mesh.add(new THREE.Mesh(outlineGeometry(geo, line), outline));
    if (pos) mesh.position.set(...pos);
    if (rot) mesh.rotation.set(...rot);
    if (scale) mesh.scale.set(...scale);
    parent.add(mesh);
    return mesh;
  };

  const group = new THREE.Group();
  add(group, new THREE.SphereGeometry(14, 24, 18), yellow, null, null, [1.35, 1, 1]);
  for (const [x, r] of [[-1, 14.3], [-9.5, 12.4]] as const) {
    const band = new THREE.CylinderGeometry(r, r, 5, 24);
    band.rotateZ(Math.PI / 2);
    add(group, band, ink, [x, 0, 0], null, null, 0);
  }
  add(group, new THREE.SphereGeometry(9.5, 20, 16), ink, [19, 1, 0]);
  const eyes = [5, -5].map((z) => add(group, new THREE.SphereGeometry(2.4, 10, 8), eye, [25.5, 3.5, z], null, null, 0));
  const stinger = new THREE.ConeGeometry(3, 8, 10);
  stinger.rotateZ(Math.PI / 2);
  add(group, stinger, ink, [-21.5, 0, 0], null, null, 0.8);
  for (const z of [4, -4]) {
    const stalk = new THREE.CylinderGeometry(0.7, 0.7, 11, 6);
    stalk.translate(0, 5.5, 0);
    const antenna = add(group, stalk, ink, [22, 8, z], [z > 0 ? 0.35 : -0.35, 0, -0.45], null, 0);
    add(antenna, new THREE.SphereGeometry(1.8, 8, 6), ink, [0, 11, 0], null, null, 0);
  }
  const wings = ([1, -1] as const).map((side) => {
    const pivot = new THREE.Group();
    pivot.position.set(3, 11, side * 4);
    group.add(pivot);
    add(pivot, new THREE.SphereGeometry(10, 16, 12), wing, [-2, 0, side * 9], null, [0.75, 0.14, 1], 1);
    return { pivot, side };
  });

  return {
    group,
    wings,
    eyes,
    dispose() {
      group.traverse((o) => {
        if (o instanceof THREE.Mesh) o.geometry.dispose();
      });
      [yellow, ink, eye, wing].forEach((m) => m.dispose());
    },
  };
}
