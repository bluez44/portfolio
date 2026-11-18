import * as THREE from "three";
import { createBeeModel, type BeeModel } from "../../shared/three/bee-model";
import type { RisoPalette } from "../../shared/three/palette";
import type { Materials } from "./materials";
import type { MeshKit } from "./mesh-kit";
import { STOLE_BAND } from "./textures";

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
  // Laptop on the lap: shallow enough to sit mostly on the thighs, hinge kept clear of the gown and stole.
  const laptop = k.group(hips, [0, 0.12, 0.6]);
  k.add(laptop, k.geo.box(0.56, 0.035, 0.32), M.laptop, null, null, 0.015);
  const lid = k.group(laptop, [0, 0.02, -0.15]);
  lid.rotation.x = -1.68;
  k.add(lid, k.geo.box(0.56, 0.03, 0.32), M.laptop, [0, 0, 0.16], null, 0.015);
  k.add(lid, k.geo.plane(0.48, 0.26), M.screen, [0, 0.017, 0.16], [-Math.PI / 2, 0, 0], 0);
  return { cardProp, books, laptop };
}

/** Radius of the gown torso (`k.up(0.3, 0.38, 0.8)`) at height `y` in spine space. */
const torsoRadius = (y: number) => 0.38 - 0.1 * y;

type Pt = [number, number];

/**
 * A flat strip from `from` to `to` (spine-space x/y seen from behind), `w0` wide at the top and `w1`
 * at the bottom, `thick` deep, lifted `gap` off the gown and wrapped around the torso so it lies on
 * the cloth instead of cutting into it.
 */
function backBand(from: Pt, to: Pt, w0: number, w1: number, gap: number, thick: number, across = 4): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(1, 1, 1, across, 12, 1);
  const p = geo.attributes.position;
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy);
  const nx = -dy / len;
  const ny = dx / len;
  for (let i = 0; i < p.count; i++) {
    const s = 0.5 - p.getY(i);
    const w = w0 + (w1 - w0) * s;
    const x = from[0] + dx * s + nx * p.getX(i) * w;
    const y = from[1] + dy * s + ny * p.getX(i) * w;
    const r0 = torsoRadius(y);
    const r = r0 + gap + (p.getZ(i) + 0.5) * thick;
    const a = x / r0;
    // Behind the figure: -z is the back; x is mirrored so the strip reads left-to-right from behind.
    p.setXYZ(i, -r * Math.sin(a), y, -r * Math.cos(a));
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds the academic hood (Túi càn khôn) seen from behind, after the reference photo:
 * two navy arms forming a V whose tails cross at the bottom, a cyan trim on the inner edge of
 * each arm, a silver lining filling the V, and a folded silver collar at the nape.
 */
function buildHood(k: MeshKit, M: Materials, spine: THREE.Group): THREE.Group {
  const hoodG = k.group(spine);
  const TOP = 0.77;
  const BOTTOM = 0.3;

  // Silver lining filling the V (lowest layer).
  const lining = k.cache.get("hood_lining_v", () => backBand([0, TOP], [0, 0.4], 0.2, 0.02, 0.003, 0.006, 6));
  k.add(hoodG, lining, M.cowlSilver, null, null, 0.008);

  // Navy arms: each runs from a shoulder blade down past the centre line, so the tails cross.
  ([1, -1] as const).forEach((side, i) => {
    const from: Pt = [side * 0.15, TOP];
    const to: Pt = [-side * 0.035, BOTTOM - i * 0.03];
    const gap = 0.01 + i * 0.014;
    const arm = k.cache.get(`hood_arm_${side}`, () => backBand(from, to, 0.1, 0.075, gap, 0.012));
    k.add(hoodG, arm, M.cowlNavy, null, null, 0.01);
    // Cyan trim along the inner edge of the arm, stopping before the crossing.
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    const len = Math.hypot(dx, dy);
    const inset = side * 0.034;
    const ox = (dy / len) * inset;
    const oy = (-dx / len) * inset;
    const trim = k.cache.get(`hood_trim_${side}`, () =>
      backBand([from[0] + ox, from[1] + oy], [from[0] + dx * 0.62 + ox, from[1] + dy * 0.62 + oy], 0.03, 0.024, gap + 0.0125, 0.003, 2),
    );
    k.add(hoodG, trim, M.cowlCyan, null, null, 0);
  });

  // Collar band around the base of the neck, resting on the shoulders.
  const collar = k.cache.get("hood_collar", () => new THREE.TorusGeometry(0.19, 0.026, 6, 18, Math.PI));
  k.add(hoodG, collar, M.cowlNavy, [0, 0.83, 0], [-Math.PI / 2, 0, 0], 0.012);

  // Folded silver collar tips at the nape, pointing down.
  const tip = k.cache.get("hood_tip_flat", () => new THREE.ConeGeometry(0.04, 0.11, 4).scale(1, 1, 0.35));
  ([1, -1] as const).forEach((side) => {
    k.add(hoodG, tip, M.cowlSilver, [side * 0.055, 0.73, -(torsoRadius(0.73) + 0.035)], [Math.PI, 0, side * 0.45], 0.008);
  });

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
  const stoleGeo = k.cache.get("stole_band", () => new THREE.BoxGeometry(STOLE_BAND.width, STOLE_BAND.height, 0.025));
  // As in the reference photo, the logo is on the band on the viewer's right (the figure's left, +x).
  k.add(stoleG, stoleGeo, M.stolePattern, [0.13, 0.38, 0.347], [-0.08, 0, 0.06], 0.015);
  k.add(stoleG, stoleGeo, M.stolePlain, [-0.13, 0.38, 0.347], [-0.08, 0, -0.06], 0.015);
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
