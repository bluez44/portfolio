import type { Rig } from "./rig";
import type { PoseTarget } from "./types";

export type PoseState = PoseTarget;

const show = (g: { visible: boolean; scale: { setScalar(v: number): void } }, v: number) => {
  g.visible = v > 0.02;
  g.scale.setScalar(Math.max(0.001, v));
};

export function applyPose(
  R: Rig,
  S: PoseState,
  { time: T, phase }: { time: number; phase: number },
  view: { halfW: number; halfH: number; scale: number },
): void {
  const { wave, bow, sit, point, toss, walk } = S;
  const sw = Math.sin(phase) * 0.6 * walk;

  R.root.position.set(S.x * (view.halfW - 1.3 * view.scale), -view.halfH + 0.15, 0);
  R.root.scale.setScalar(view.scale);
  R.root.rotation.y = S.ry * (1 - walk) + S.dir * 1.35 * walk;
  R.hips.position.y = 1.0 - 0.4 * sit + Math.abs(Math.sin(phase)) * 0.05 * walk;

  R.legs[0].leg.rotation.x = -1.5 * sit + sw;
  R.legs[1].leg.rotation.x = -1.5 * sit - sw;
  R.legs[0].knee.rotation.x = 1.45 * sit + Math.max(0, Math.sin(phase)) * 0.7 * walk;
  R.legs[1].knee.rotation.x = 1.45 * sit + Math.max(0, -Math.sin(phase)) * 0.7 * walk;
  R.skirt.scale.y = 1 - 0.55 * sit;

  R.spine.rotation.x = bow * (0.5 + 0.12 * Math.sin(T * 1.6)) + 0.08 * sit + Math.sin(T * 1.8) * 0.015;
  R.headG.rotation.x = 0.28 * sit + 0.1 * bow - 0.12 * toss;
  R.headG.rotation.y = -R.root.rotation.y * 0.45 + Math.sin(T * 0.7) * 0.05;

  const lift = toss * (2.45 + 0.25 * Math.sin(T * 2.86));
  const type = Math.sin(T * 16) * 0.08 * sit;
  R.A.sh.rotation.z = 0.12 + wave * 2.5 + point * 1.45 + lift;
  R.A.sh.rotation.x = -0.5 * sit - sw * 0.9 - 0.15 * point;
  R.A.el.rotation.z = wave * (0.35 + Math.sin(T * 7) * 0.45) + 0.1 * point;
  R.A.el.rotation.x = -1.0 * sit + type;
  R.B.sh.rotation.z = -0.12 - lift + 0.05 * bow;
  R.B.sh.rotation.x = -0.7 * wave - 0.5 * sit - 0.35 * bow + sw * 0.9;
  R.B.el.rotation.x = -1.0 * wave - 1.0 * sit - 1.75 * bow - type;
  R.B.el.rotation.z = 0.25 * bow;

  const p = (T % 2.2) / 2.2;
  R.capG.position.y = 0.2 + toss * Math.max(0, Math.sin(Math.PI * p)) * 2.6;
  R.capG.rotation.y = toss * p * Math.PI * 4;
  R.capG.rotation.z = toss * Math.sin(p * Math.PI * 2) * 0.35;
  R.tassel.rotation.z = Math.sin(T * 2.2) * 0.12 + walk * Math.sin(phase * 2) * 0.3;

  show(R.cardProp, wave);
  show(R.books, sit);
  show(R.laptop, sit);
  R.shadow.scale.set(1 + 0.4 * sit, 1, 1);
}
