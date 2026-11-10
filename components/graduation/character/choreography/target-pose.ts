import { smoothstep } from "@/lib/math/smoothstep";
import { ACTIONS, type Beat, type PoseTarget } from "../types";
import { FADE, WALK_FROM, WALK_SPAN } from "./constants";

const rest = (): PoseTarget => {
  const pose = { walk: 0, dir: 0, x: 0, ry: 0 } as PoseTarget;
  for (const a of ACTIONS) pose[a] = 0;
  return pose;
};

const holding = (b: Beat): PoseTarget => ({ ...rest(), x: b.x, ry: b.ry, [b.act]: 1 });

/** Pose the character should be in at scroll `y`, blending between the surrounding beats. */
export function targetPose(beats: Beat[], y: number): PoseTarget | null {
  if (beats.length === 0) return null;
  if (y <= beats[0].s) return holding(beats[0]);
  const last = beats[beats.length - 1];
  if (y >= last.s) return holding(last);

  let i = 0;
  while (y > beats[i + 1].s) i++;
  const a = beats[i];
  const b = beats[i + 1];
  if (a.act === b.act && a.x === b.x) return holding(a);

  const t = (y - a.s) / (b.s - a.s);
  const pose = rest();
  pose[a.act] += 1 - smoothstep(t / FADE);
  pose[b.act] += smoothstep((t - (1 - FADE)) / FADE);
  const move = smoothstep((t - FADE) / (1 - 2 * FADE));
  pose.x = a.x + (b.x - a.x) * move;
  pose.ry = a.ry + (b.ry - a.ry) * move;
  pose.walk = a.x !== b.x ? Math.sin(Math.PI * Math.min(1, Math.max(0, (t - WALK_FROM) / WALK_SPAN))) : 0;
  pose.dir = Math.sign(b.x - a.x);
  return pose;
}
