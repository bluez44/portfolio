import type { Rig } from "./rig";
import type { PoseTarget } from "../types";
import { smoothstep } from "@/lib/math/smoothstep";

export type PoseState = PoseTarget;

const show = (g: { visible: boolean; scale: { setScalar(v: number): void } }, v: number) => {
  g.visible = v > 0.02;
  g.scale.setScalar(Math.max(0.001, v));
};

/** Head centre in rig space while standing (hips 1.0 + neck 1.13). */
const HEAD_Y = 2.13;
/** Seconds per loop of the bee around the head; it swoops in to boop the nose near the end of each. */
const BEE_LOOP = 3.3;
const BOOP_EVERY = 2;

/** play: a bee loops around the head; the character follows it with its eyes, reaches for it, sways and hops. */
function playWithBee(R: Rig, play: number, T: number) {
  if (play < 0.001) return;
  const a = (T / BEE_LOOP) * Math.PI * 2;
  // Every BOOP_EVERY loops, the last stretch dives to the nose and back out.
  const c = (T / (BEE_LOOP * BOOP_EVERY)) % 1;
  const boop = Math.sin(Math.PI * smoothstep((c - 0.82) / 0.18)) ** 2;
  const ox = 0.95 * Math.cos(a);
  const oy = HEAD_Y + 0.15 + 0.25 * Math.sin(2 * a) + 0.03 * Math.sin(T * 13);
  // Kept in front of the face (head radius 0.3) so it never passes through the head.
  const oz = 0.65 + 0.25 * Math.sin(a);
  const bx = ox * (1 - boop);
  const by = oy + (HEAD_Y + 0.02 - oy) * boop;
  const bz = oz + (0.5 - oz) * boop;

  R.bee.position.set(bx, by, bz);
  R.bee.rotation.x = 0.3;
  // Model faces +x: head along the orbit's tangent, and turn to face the character while booping.
  const heading = Math.atan2(-0.25 * Math.cos(a), -0.95 * Math.sin(a));
  R.beeModel.group.rotation.y = heading + (Math.PI / 2 - heading) * boop;
  R.beeModel.group.rotation.z = 0.25 * Math.sin(2 * a);
  const flap = 0.55 + Math.sin(T * 55) * 0.55;
  for (const w of R.beeModel.wings) w.pivot.rotation.x = -w.side * flap;

  // Eyes on the bee, chin up; a startled lean back when it boops.
  const yaw = Math.max(-1, Math.min(1, Math.atan2(bx, bz)));
  const pitch = -Math.atan2(by - HEAD_Y, Math.hypot(bx, bz));
  R.headG.rotation.y += play * yaw * 0.8;
  R.headG.rotation.x += play * (Math.max(-0.5, pitch) * 0.8 - 0.15 * boop);
  R.spine.rotation.x -= play * 0.1 * boop;
  R.spine.rotation.z -= play * 0.1 * Math.cos(a);
  R.hips.position.y += play * 0.06 * Math.max(0, Math.sin(T * 3.8));

  // The hand on the bee's side reaches up for it, elbow soft and fingers wiggling; the other hangs low.
  const near = 0.5 + 0.5 * Math.cos(a);
  const reachA = smoothstep((near - 0.35) / 0.55);
  const reachB = smoothstep((0.65 - near) / 0.55);
  const tickle = Math.sin(T * 9) * 0.3;
  R.A.sh.rotation.z += play * (0.15 + 2.1 * reachA);
  R.A.sh.rotation.x -= play * (0.2 + 0.5 * reachA);
  R.A.el.rotation.x -= play * 0.5 * reachA;
  R.A.el.rotation.z += play * (0.35 + tickle) * reachA;
  R.B.sh.rotation.z -= play * (0.15 + 2.1 * reachB);
  R.B.sh.rotation.x -= play * (0.2 + 0.5 * reachB);
  R.B.el.rotation.x -= play * 0.5 * reachB;
  R.B.el.rotation.z -= play * (0.35 + tickle) * reachB;
  // Both hands come up to catch it when it boops.
  R.A.sh.rotation.x -= play * 0.6 * boop;
  R.B.sh.rotation.x -= play * 0.6 * boop;
}

export function applyPose(
  R: Rig,
  S: PoseState,
  { time: T, phase }: { time: number; phase: number },
  view: { halfW: number; halfH: number; scale: number },
): void {
  const { wave, bow, sit, point, toss, cheer, play, walk } = S;
  const hop = Math.abs(Math.sin(T * 5.5)) * cheer;
  const sw = Math.sin(phase) * 0.6 * walk;

  R.root.position.set(S.x * (view.halfW - 1.3 * view.scale), -view.halfH + 0.15, 0);
  R.root.scale.setScalar(view.scale);
  R.root.rotation.y = S.ry * (1 - walk) + S.dir * 1.35 * walk;
  R.hips.position.y = 1.0 - 0.4 * sit + Math.abs(Math.sin(phase)) * 0.05 * walk + 0.12 * hop;

  R.legs[0].leg.rotation.x = -1.5 * sit + sw;
  R.legs[1].leg.rotation.x = -1.5 * sit - sw;
  R.legs[0].knee.rotation.x = 1.45 * sit + Math.max(0, Math.sin(phase)) * 0.7 * walk;
  R.legs[1].knee.rotation.x = 1.45 * sit + Math.max(0, -Math.sin(phase)) * 0.7 * walk;
  R.skirt.scale.y = 1 - 0.55 * sit;

  R.spine.rotation.x = bow * (0.5 + 0.12 * Math.sin(T * 1.6)) + 0.08 * sit + Math.sin(T * 1.8) * 0.015 - 0.08 * cheer;
  R.spine.rotation.z = Math.sin(T * 2.75) * 0.07 * cheer;
  R.headG.rotation.x = 0.28 * sit + 0.1 * bow - 0.12 * toss - 0.18 * cheer;
  R.headG.rotation.y = -R.root.rotation.y * 0.45 + Math.sin(T * 0.7) * 0.05;

  const lift = toss * (2.45 + 0.25 * Math.sin(T * 2.86));
  const type = Math.sin(T * 16) * 0.08 * sit;
  // cheer: both arms up in a V, hands shaking.
  R.A.sh.rotation.z = 0.12 + wave * 2.5 + point * 1.45 + lift + cheer * 2.6;
  R.A.sh.rotation.x = -0.5 * sit - sw * 0.9 - 0.15 * point;
  R.A.el.rotation.z = wave * (0.35 + Math.sin(T * 7) * 0.45) + 0.1 * point + cheer * (0.25 + Math.sin(T * 11) * 0.3);
  R.A.el.rotation.x = -1.0 * sit + type;
  R.B.sh.rotation.z = -0.12 - lift + 0.05 * bow - cheer * 2.6;
  R.B.sh.rotation.x = -0.7 * wave - 0.5 * sit - 0.35 * bow + sw * 0.9;
  R.B.el.rotation.x = -1.0 * wave - 1.0 * sit - 1.75 * bow - type;
  R.B.el.rotation.z = 0.25 * bow - cheer * (0.25 + Math.sin(T * 11 + 1.2) * 0.3);

  playWithBee(R, play, T);

  const p = (T % 2.2) / 2.2;
  R.capG.position.y = 0.2 + toss * Math.max(0, Math.sin(Math.PI * p)) * 2.6;
  R.capG.rotation.y = toss * p * Math.PI * 4;
  R.capG.rotation.z = toss * Math.sin(p * Math.PI * 2) * 0.35;
  R.tassel.rotation.z = Math.sin(T * 2.2) * 0.12 + walk * Math.sin(phase * 2) * 0.3;

  show(R.cardProp, wave);
  show(R.books, sit);
  show(R.laptop, sit);
  show(R.bee, play);
  R.shadow.scale.set(1 + 0.4 * sit, 1, 1);
}
