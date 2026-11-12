import * as THREE from "three";
import { createBeeModel, type BeeModel } from "../../shared/three/bee-model";
import type { RisoPalette } from "../../shared/three/palette";
import type { Materials } from "./materials";
import type { MeshKit } from "./mesh-kit";

/** Bee model units (body radius 14) to rig units: about half a head long. */
const BEE_SCALE = 0.016;

export type Arm = { sh: THREE.Group; el: THREE.Group };
export type Rig = {
  root: THREE.Group; hips: THREE.Group; legs: { leg: THREE.Group; knee: THREE.Group }[];
  skirt: THREE.Mesh; spine: THREE.Group; headG: THREE.Group; capG: THREE.Group; tassel: THREE.Group;
  A: Arm; B: Arm; cardProp: THREE.Group; books: THREE.Group; laptop: THREE.Group;
  /** Bee the character plays with on the wishes wall: `bee` is posed in rig space, `beeModel` sits inside it. */
  bee: THREE.Group; beeModel: BeeModel; shadow: THREE.Mesh;
};

function buildHead(k: MeshKit, M: Materials, spine: THREE.Group) {
  const headG = k.group(spine, [0, 1.13, 0]);
  k.add(headG, new THREE.SphereGeometry(0.3, 28, 20), M.skin);
  k.add(headG, new THREE.SphereGeometry(0.318, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.52), M.hair, [0, 0.03, -0.025], [-0.28, 0, 0], 0.018);
  [0.105, -0.105].forEach((x) => {
    k.add(headG, new THREE.SphereGeometry(0.036, 12, 10), M.hair, [x, 0, 0.275], null, 0);
    k.add(headG, new THREE.SphereGeometry(0.05, 12, 10), M.blush, [x * 1.5, -0.09, 0.24], null, 0).scale.set(1, 0.6, 0.4);
  });
  k.add(headG, new THREE.TorusGeometry(0.06, 0.014, 6, 14, Math.PI), M.hair, [0, -0.09, 0.285], [0, 0, Math.PI], 0);
  const capG = k.group(headG, [0, 0.2, 0]);
  k.add(capG, new THREE.CylinderGeometry(0.29, 0.31, 0.16, 24), M.cap, [0, 0, 0]);
  k.add(capG, new THREE.BoxGeometry(0.84, 0.045, 0.84), M.cap, [0, 0.1, 0], [0.06, Math.PI / 4, 0], 0.018);
  k.add(capG, new THREE.SphereGeometry(0.04, 10, 8), M.tassel, [0, 0.135, 0], null, 0);
  const tassel = k.group(capG, [0.4, 0.12, 0.12]);
  k.add(tassel, k.down(0.013, 0.013, 0.3, 6), M.tassel, null, null, 0.008);
  k.add(tassel, k.down(0.025, 0.055, 0.12, 10), M.tassel, [0, -0.3, 0], null, 0.012);
  return { headG, capG, tassel };
}

function buildArm(k: MeshKit, M: Materials, spine: THREE.Group, side: 1 | -1): Arm {
  const sh = k.group(spine, [side * 0.37, 0.7, 0]);
  k.add(sh, k.down(0.1, 0.125, 0.42), M.gown);
  const el = k.group(sh, [0, -0.42, 0]);
  k.add(el, k.down(0.09, 0.14, 0.34), M.gown);
  k.add(el, new THREE.SphereGeometry(0.075, 14, 10), M.skin, [0, -0.41, 0]);
  return { sh, el };
}

function buildProps(k: MeshKit, M: Materials, root: THREE.Group, hips: THREE.Group, spine: THREE.Group, hand: THREE.Group) {
  const cardProp = k.group(hand, [0, -0.46, 0.08]);
  k.add(cardProp, new THREE.BoxGeometry(0.42, 0.28, 0.015), M.paper, [0, -0.06, 0.04], [0.2, 0, 0.1], 0.015);
  k.add(cardProp, new THREE.CircleGeometry(0.045, 14), M.stole, [0, -0.06, 0.06], [0.2, 0, 0], 0);
  const books = k.group(root, [0, 0, -0.05]);
  ([[0.86, M.b1, 0.05], [0.78, M.b2, -0.08], [0.82, M.b3, 0.12]] as const).forEach(([w, m, r], i) =>
    k.add(books, new THREE.BoxGeometry(w, 0.19, 0.58), m, [0, 0.095 + i * 0.19, 0], [0, r, 0], 0.018),
  );
  const laptop = k.group(hips, [0, 0.2, 0.58]);
  k.add(laptop, new THREE.BoxGeometry(0.62, 0.035, 0.42), M.laptop, null, null, 0.015);
  const lid = k.group(laptop, [0, 0.02, -0.2]);
  lid.rotation.x = -1.85;
  k.add(lid, new THREE.BoxGeometry(0.62, 0.03, 0.42), M.laptop, [0, 0, 0.21], null, 0.015);
  k.add(lid, new THREE.PlaneGeometry(0.54, 0.34), M.screen, [0, 0.017, 0.21], [-Math.PI / 2, 0, 0], 0);
  return { cardProp, books, laptop };
}

export function buildRig(scene: THREE.Scene, k: MeshKit, M: Materials, palette: RisoPalette): Rig {
  const root = k.group(scene);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.62, 32), M.shadow);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  root.add(shadow);

  const hips = k.group(root, [0, 1.0, 0]);
  const legs = [0.15, -0.15].map((x) => {
    const leg = k.group(hips, [x, 0, 0]);
    k.add(leg, k.down(0.1, 0.09, 0.5), M.pants);
    const knee = k.group(leg, [0, -0.5, 0]);
    k.add(knee, k.down(0.09, 0.08, 0.42), M.pants);
    k.add(knee, new THREE.BoxGeometry(0.2, 0.12, 0.32), M.shoe, [0, -0.46, 0.06]);
    return { leg, knee };
  });
  const skirt = k.add(hips, k.down(0.37, 0.52, 0.62, 22), M.gown, [0, 0.03, 0]);
  const spine = k.group(hips);
  k.add(spine, k.up(0.3, 0.38, 0.8), M.gown);
  k.add(spine, new THREE.BoxGeometry(0.1, 0.72, 0.04), M.stole, [0.13, 0.38, 0.335], [-0.1, 0, 0.06], 0.015);
  k.add(spine, new THREE.BoxGeometry(0.1, 0.72, 0.04), M.stole, [-0.13, 0.38, 0.335], [-0.1, 0, -0.06], 0.015);
  k.add(spine, k.up(0.11, 0.12, 0.18, 14), M.skin, [0, 0.78, 0]);

  const head = buildHead(k, M, spine);
  const A = buildArm(k, M, spine, 1);
  const B = buildArm(k, M, spine, -1);
  const props = buildProps(k, M, root, hips, spine, B.el);
  const bee = k.group(root);
  const beeModel = createBeeModel(M.gradient, M.outline, palette);
  beeModel.group.scale.setScalar(BEE_SCALE);
  bee.add(beeModel.group);
  return { root, hips, legs, skirt, spine, ...head, A, B, ...props, bee, beeModel, shadow };
}
