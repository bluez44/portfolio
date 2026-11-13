import * as THREE from "three";
import { createBeeModel } from "../shared/three/bee-model";
import { createGeometryCache } from "../shared/three/geometry-cache";
import type { RisoPalette } from "../shared/three/palette";
import { toonGradient } from "../shared/three/toon";

/** Screen-space position/state of the courier bee, mutated by the flight timeline. */
export type BeeState = {
  x: number;
  y: number;
  /** scale 0..1 — bee pops in/out */
  s: number;
  on: boolean;
  perched: boolean;
};

export type BeeScene = {
  resize: () => void;
  /** @param t seconds (gsap ticker time) */
  frame: (t: number, bee: BeeState | null) => void;
  applyPalette: (p: RisoPalette) => void;
  dispose: () => void;
};

/** Toon-shaded 3D courier bee rendered full-screen in an orthographic camera (1 unit = 1 css px). */
export function createBeeScene(host: HTMLElement, palette: RisoPalette): BeeScene {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, 1, 0, -1, -500, 500);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9a9488, 0.9));
  const dl = new THREE.DirectionalLight(0xffffff, 0.8);
  dl.position.set(0.4, 0.8, 1);
  scene.add(dl);

  const grad = toonGradient([120, 200, 255]);
  const outM = new THREE.MeshBasicMaterial({ color: palette.ink, side: THREE.BackSide });
  const geometries = createGeometryCache();
  const model = createBeeModel(grad, outM, palette, geometries);
  const g = model.group;
  const wings = model.wings.map((w) => w.pivot);
  scene.add(g);
  g.visible = false;

  const S = { ry: 0.45, face: 1, lx: 0, ly: 0, last: null as number | null, shown: true };

  const resize = () => {
    const w = innerWidth;
    const h = innerHeight;
    renderer.setSize(w, h);
    Object.assign(camera, { left: 0, right: w, top: 0, bottom: -h });
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };
  resize();

  const frame = (t: number, bee: BeeState | null) => {
    const dt = S.last == null ? 0.016 : Math.min(0.05, t - S.last);
    S.last = t;
    if (!bee || !bee.on) {
      if (S.shown) {
        g.visible = false;
        renderer.render(scene, camera);
        S.shown = false;
      }
      return;
    }
    S.shown = true;
    g.visible = bee.s > 0.01;
    const vx = bee.x - S.lx;
    const vy = bee.y - S.ly;
    S.lx = bee.x;
    S.ly = bee.y;
    if (Math.abs(vx) > 0.6) S.face = vx > 0 ? 1 : -1;
    const tgt = S.face > 0 ? 0.45 : Math.PI - 0.45;
    S.ry += (tgt - S.ry) * Math.min(1, dt * 9);
    const tilt = Math.max(-0.45, Math.min(0.45, -vy * 0.03)) * S.face;
    const bob = bee.perched ? Math.sin(t * 3) * 3 : 0;
    g.rotation.set(0.35, S.ry, bee.perched ? 0.08 : tilt);
    g.position.set(bee.x, -(bee.y + bob), 0);
    g.scale.setScalar(Math.max(0.001, bee.s) * 1.1);
    const f = 0.55 + Math.sin(t * (bee.perched ? 24 : 55)) * 0.55;
    wings[0].rotation.x = -f;
    wings[1].rotation.x = f;
    renderer.render(scene, camera);
  };

  const applyPalette = (p: RisoPalette) => {
    outM.color.set(p.ink);
    model.applyPalette(p);
  };

  const dispose = () => {
    model.dispose();
    geometries.dispose();
    outM.dispose();
    grad.dispose();
    // Release the GL context now; otherwise it lingers until GC (StrictMode remounts would pile them up).
    renderer.forceContextLoss();
    renderer.dispose();
    renderer.domElement.remove();
  };

  return { resize, frame, applyPalette, dispose };
}
