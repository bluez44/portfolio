import * as THREE from "three";
import { createBeeModel, type BeeModel } from "../../shared/three/bee-model";
import type { RisoPalette } from "../../shared/three/palette";
import type { Materials } from "./materials";
import type { MeshKit } from "./mesh-kit";

/** Bee model units (body radius 14) to rig units: about half a head long. */
const BEE_SCALE = 0.016;

export type Arm = { sh: THREE.Group; el: THREE.Group };
export type Rig = {
  root: THREE.Group;
  hips: THREE.Group;
  legs: { leg: THREE.Group; knee: THREE.Group }[];
  skirt: THREE.Mesh;
  spine: THREE.Group;
  headG: THREE.Group;
  capG: THREE.Group;
  tassel: THREE.Group;
  A: Arm;
  B: Arm;
  cardProp: THREE.Group;
  books: THREE.Group;
  laptop: THREE.Group;
  /** Bee the character plays with on the wishes wall: `bee` is posed in rig space, `beeModel` sits inside it. */
  bee: THREE.Group;
  beeModel: BeeModel;
  shadow: THREE.Mesh;
};

function buildHead(k: MeshKit, M: Materials, spine: THREE.Group) {
  const headG = k.group(spine, [0, 1.13, 0]);
  k.add(headG, k.geo.sphere(0.3, 28, 20), M.skin);
  k.add(
    headG,
    k.geo.sphere(0.318, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.52),
    M.hair,
    [0, 0.03, -0.025],
    [-0.28, 0, 0],
    0.018,
  );
  [0.105, -0.105].forEach((x) => {
    k.add(headG, k.geo.sphere(0.036, 12, 10), M.hair, [x, 0, 0.275], null, 0);
    k.add(headG, k.geo.sphere(0.05, 12, 10), M.blush, [x * 1.5, -0.09, 0.24], null, 0).scale.set(
      1,
      0.6,
      0.4,
    );
  });
  k.add(headG, k.geo.torus(0.06, 0.014, 6, 14, Math.PI), M.hair, [0, -0.09, 0.285], [0, 0, Math.PI], 0);

  // Graduation Cap (Nón tốt nghiệp HCMUT) - raised high enough so hair never pokes through
  const capG = k.group(headG, [0, 0.28, 0]);
  // Navy skull cap (chóp nón) - deeper cylinder covering head down to forehead
  k.add(capG, k.geo.cylinder(0.3, 0.32, 0.22, 24), M.cap, [0, 0.01, 0]);

  // BK TP.HCM Logo badge on the skull cap
  const badgeGeo = k.cache.get("cap_badge", () => new THREE.PlaneGeometry(0.13, 0.13));
  k.add(capG, badgeGeo, M.capBadge, [0.16, 0.01, 0.27], [-0.05, 0.52, 0], 0);

  // Navy square board (tấm nón vuông) - thicker and higher
  k.add(capG, k.geo.box(0.86, 0.08, 0.86), M.cap, [0, 0.13, 0], [0.06, Math.PI / 4, 0], 0.018);
  // Center button (nút đỉnh nón) in navy
  k.add(capG, k.geo.sphere(0.045, 10, 8), M.cap, [0, 0.175, 0], null, 0);

  // Tassel (Tua rua xanh cyan với khuyên vàng gold)
  const tassel = k.group(capG, [0.42, 0.15, 0.12]);
  // Cyan cord
  k.add(tassel, k.down(0.013, 0.013, 0.3, 6), M.tassel, null, null, 0.008);
  // Gold ferrule ring
  const ringGeo = k.cache.get("tassel_ring", () => new THREE.CylinderGeometry(0.024, 0.024, 0.025, 10));
  k.add(tassel, ringGeo, M.tasselRing, [0, -0.3, 0], null, 0);
  // Cyan tassel brush
  k.add(tassel, k.down(0.026, 0.058, 0.13, 10), M.tassel, [0, -0.32, 0], null, 0.012);

  return { headG, capG, tassel };
}

function buildArm(k: MeshKit, M: Materials, spine: THREE.Group, side: 1 | -1): Arm {
  const sh = k.group(spine, [side * 0.37, 0.7, 0]);
  k.add(sh, k.down(0.1, 0.125, 0.42), M.gown);
  const el = k.group(sh, [0, -0.42, 0]);
  k.add(el, k.down(0.09, 0.14, 0.34), M.gown);
  k.add(el, k.geo.sphere(0.075, 14, 10), M.skin, [0, -0.41, 0]);
  return { sh, el };
}

function buildProps(
  k: MeshKit,
  M: Materials,
  root: THREE.Group,
  hips: THREE.Group,
  spine: THREE.Group,
  hand: THREE.Group,
) {
  const cardProp = k.group(hand, [0, -0.46, 0.08]);
  k.add(cardProp, k.geo.box(0.42, 0.28, 0.015), M.paper, [0, -0.06, 0.04], [0.2, 0, 0.1], 0.015);
  k.add(cardProp, k.geo.circle(0.045, 14), M.stole, [0, -0.06, 0.06], [0.2, 0, 0], 0);
  const books = k.group(root, [0, 0, -0.05]);
  (
    [
      [0.86, M.b1, 0.05],
      [0.78, M.b2, -0.08],
      [0.82, M.b3, 0.12],
    ] as const
  ).forEach(([w, m, r], i) =>
    k.add(books, k.geo.box(w, 0.19, 0.58), m, [0, 0.095 + i * 0.19, 0], [0, r, 0], 0.018),
  );
  // Laptop: position pushed forward and resting nicely on thighs, eliminating gown clipping
  const laptop = k.group(hips, [0, 0.08, 0.66]);
  k.add(laptop, k.geo.box(0.6, 0.035, 0.38), M.laptop, null, null, 0.015);
  const lid = k.group(laptop, [0, 0.02, -0.18]);
  lid.rotation.x = -1.75;
  k.add(lid, k.geo.box(0.6, 0.03, 0.38), M.laptop, [0, 0, 0.19], null, 0.015);
  k.add(lid, k.geo.plane(0.52, 0.31), M.screen, [0, 0.017, 0.19], [-Math.PI / 2, 0, 0], 0);
  return { cardProp, books, laptop };
}

/**
 * Builds the academic hood (Túi càn khôn) draped over the neck and along the back.
 * Features 3 layers: outer navy shell with crossing tails, cyan trim border, and silver lining with folded collar tips.
 */
function buildHood(k: MeshKit, M: Materials, spine: THREE.Group): THREE.Group {
  const hoodG = k.group(spine);

  // Shoulder loop connecting over the shoulders
  const loopGeo = k.cache.get("hood_loop", () => new THREE.TorusGeometry(0.21, 0.024, 6, 16, Math.PI));
  k.add(hoodG, loopGeo, M.cowlNavy, [0, 0.75, -0.06], [Math.PI * 0.42, 0, 0], 0.012);

  // Outer navy back drape
  const backGeo = k.cache.get("hood_back", () => new THREE.BoxGeometry(0.26, 0.42, 0.025));
  k.add(hoodG, backGeo, M.cowlNavy, [0, 0.52, -0.32], [0.08, 0, 0], 0.015);

  // Cyan accent trim stripes along the sides of the cowl
  const stripeGeo = k.cache.get("hood_stripe", () => new THREE.BoxGeometry(0.038, 0.4, 0.026));
  k.add(hoodG, stripeGeo, M.cowlCyan, [0.1, 0.52, -0.321], [0.08, 0, 0.04], 0.01);
  k.add(hoodG, stripeGeo, M.cowlCyan, [-0.1, 0.52, -0.321], [0.08, 0, -0.04], 0.01);

  // Inner silver lining
  const liningGeo = k.cache.get("hood_lining", () => new THREE.BoxGeometry(0.13, 0.35, 0.027));
  k.add(hoodG, liningGeo, M.cowlSilver, [0, 0.53, -0.32], [0.08, 0, 0], 0.01);

  // Folded silver collar tips at the nape
  const tipGeo = k.cache.get("hood_tip", () => new THREE.ConeGeometry(0.045, 0.12, 4));
  k.add(hoodG, tipGeo, M.cowlSilver, [0.065, 0.74, -0.29], [0.38, 0, -0.35], 0.01);
  k.add(hoodG, tipGeo, M.cowlSilver, [-0.065, 0.74, -0.29], [0.38, 0, 0.35], 0.01);

  // Tapered tails crossing each other at the lower end
  const tailGeo = k.cache.get("hood_tail", () => new THREE.BoxGeometry(0.08, 0.2, 0.022));
  k.add(hoodG, tailGeo, M.cowlNavy, [0.03, 0.27, -0.323], [0.08, 0, -0.26], 0.012);
  k.add(hoodG, tailGeo, M.cowlNavy, [-0.03, 0.25, -0.326], [0.08, 0, 0.24], 0.012);

  return hoodG;
}

export function buildRig(scene: THREE.Scene, k: MeshKit, M: Materials, palette: RisoPalette): Rig {
  const root = k.group(scene);
  const shadow = new THREE.Mesh(k.geo.circle(0.62, 32), M.shadow);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  root.add(shadow);

  const hips = k.group(root, [0, 1.0, 0]);
  const legs = [0.15, -0.15].map((x) => {
    const leg = k.group(hips, [x, 0, 0]);
    k.add(leg, k.down(0.1, 0.09, 0.5), M.pants);
    const knee = k.group(leg, [0, -0.5, 0]);
    k.add(knee, k.down(0.09, 0.08, 0.42), M.pants);
    k.add(knee, k.geo.box(0.2, 0.12, 0.32), M.shoe, [0, -0.46, 0.06]);
    return { leg, knee };
  });
  const skirt = k.add(hips, k.down(0.37, 0.52, 0.62, 22), M.gown, [0, 0.03, 0]);
  const spine = k.group(hips);
  k.add(spine, k.up(0.3, 0.38, 0.8), M.gown);

  // Graduation Stole (Khăn tốt nghiệp): Low-poly blue mosaic + BK TP.HCM logo
  const stoleG = k.group(spine);
  const stoleGeo = k.cache.get("stole_band", () => new THREE.BoxGeometry(0.12, 0.76, 0.025));
  // Left band (without logo)
  k.add(stoleG, stoleGeo, M.stolePlain, [0.13, 0.38, 0.34], [-0.08, 0, 0.06], 0.015);
  // Right band (with BK TP.HCM logo at the chest and bottom)
  k.add(stoleG, stoleGeo, M.stolePattern, [-0.13, 0.38, 0.34], [-0.08, 0, -0.06], 0.015);
  // Neck connection loop for the stole
  const stoleLoopGeo = k.cache.get("stole_loop", () => new THREE.TorusGeometry(0.18, 0.026, 6, 16, Math.PI));
  k.add(stoleG, stoleLoopGeo, M.stole, [0, 0.74, 0.14], [-Math.PI * 0.44, 0, 0], 0.012);

  // Túi càn khôn (Academic Hood)
  buildHood(k, M, spine);

  k.add(spine, k.up(0.11, 0.12, 0.18, 14), M.skin, [0, 0.78, 0]);

  const head = buildHead(k, M, spine);
  const A = buildArm(k, M, spine, 1);
  const B = buildArm(k, M, spine, -1);
  const props = buildProps(k, M, root, hips, spine, B.el);
  const bee = k.group(root);
  const beeModel = createBeeModel(M.gradient, M.outline, palette, k.cache);
  beeModel.group.scale.setScalar(BEE_SCALE);
  bee.add(beeModel.group);
  return { root, hips, legs, skirt, spine, ...head, A, B, ...props, bee, beeModel, shadow };
}
