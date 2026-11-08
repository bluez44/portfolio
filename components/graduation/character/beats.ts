import { ACTIONS, type Action, type Beat, type PoseTarget, type SectionMetrics } from "./types";

const MIN_GAP = 40;

/** Horizontal slot (−1..1) that keeps the character just outside the opened card. */
export function envelopeSideX({ viewportW, envelopeW, halfW, scale }: { viewportW: number; envelopeW: number; halfW: number; scale: number }): number {
  const envPx = (envelopeW * 1.32) / 2;
  const usable = Math.max(0.1, halfW - 1.3 * scale);
  return Math.min(1, ((envPx / (viewportW / 2)) * halfW + 0.7 * scale) / usable);
}

export function buildBeats(m: SectionMetrics, sx: number): Beat[] {
  const { vh, stageTop: s0, stageScroll: sl } = m;
  const raw: [number, number, number, Action][] = [
    [s0, sx, -0.5, "wave"],
    [s0 + sl * 0.3, sx, -0.5, "wave"],
    [s0 + sl * 0.6, -sx, 0.5, "bow"],
    [s0 + sl, -sx, 0.5, "bow"],
    [m.metTop - vh * 0.1, 0.66, -0.35, "sit"],
    [m.metTop + m.metHeight - vh * 0.9, 0.66, -0.35, "sit"],
    [m.endsTop - vh * 0.05, -0.66, 0.1, "point"],
    [m.endsTop + m.endsHeight - vh * 0.9, -0.66, 0.1, "point"],
    [m.rsvpTop - vh * 0.25, 0.62, 0, "toss"],
  ];
  let prev = -Infinity;
  return raw.map(([s, x, ry, act]) => {
    const at = Math.max(s, prev + MIN_GAP);
    prev = at;
    return { s: at, x, ry, act };
  });
}

const smooth = (v: number) => {
  const t = Math.min(1, Math.max(0, v));
  return t * t * (3 - 2 * t);
};

const rest = (): PoseTarget => {
  const pose = { walk: 0, dir: 0, x: 0, ry: 0 } as PoseTarget;
  for (const a of ACTIONS) pose[a] = 0;
  return pose;
};

const holding = (b: Beat): PoseTarget => ({ ...rest(), x: b.x, ry: b.ry, [b.act]: 1 });

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
  pose[a.act] += 1 - smooth(t / 0.25);
  pose[b.act] += smooth((t - 0.75) / 0.25);
  const move = smooth((t - 0.25) / 0.5);
  pose.x = a.x + (b.x - a.x) * move;
  pose.ry = a.ry + (b.ry - a.ry) * move;
  pose.walk = a.x !== b.x ? Math.sin(Math.PI * Math.min(1, Math.max(0, (t - 0.18) / 0.64))) : 0;
  pose.dir = Math.sign(b.x - a.x);
  return pose;
}
