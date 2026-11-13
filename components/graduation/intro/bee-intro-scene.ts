import gsap from "gsap";
import * as THREE from "three";
import { outlineGeometry } from "../shared/three/outline-geometry";
import { BEE_HEAD_RADIUS, createBeeModel } from "../shared/three/bee-model";
import type { RisoPalette } from "../shared/three/palette";
import { toonGradient } from "../shared/three/toon";
import { applyFilmGrain, formatTimecode, shiftFilmGrain } from "./film-effects";
import { hexGrid } from "./hex-grid";

const CELL_R = 0.5;
const BEE_SCALE = 0.021;
const TRAIL_POINTS = 600;

export type BeeIntroScene = {
  /** Adds the bee waking and flying off to `tl`; returns when (s) the scene's part ends. */
  wake(tl: gsap.core.Timeline): number;
  pause(): void;
  applyPalette(p: RisoPalette): void;
  dispose(): void;
};

/** Where the bee is on screen (CSS px): its body centre, and its head's centre and radius. */
export type BeeScreenPosition = { x: number; y: number; head: { x: number; y: number; r: number } };

type Options = {
  reduced: boolean;
  palette: RisoPalette;
  timecode?: HTMLElement | null;
  grain?: HTMLElement | null;
  onFlap?: () => void;
  onPosition?: (pos: BeeScreenPosition) => void;
};

const seeded = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

/** The design's "bee" intro: a toon honeycomb with a sleeping bee, a drifting camera and film overlays. */
export function createBeeIntroScene(host: HTMLElement, opts: Options): BeeIntroScene {
  const rnd = seeded(7);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%;";
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const fog = new THREE.Fog(0, 3.5, 12);
  scene.fog = fog;
  const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9a9488, 1.8));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
  keyLight.position.set(3, 6, 5);
  scene.add(keyLight);

  const gradient = toonGradient([122, 196, 255]);
  const outM = new THREE.MeshBasicMaterial({ side: THREE.BackSide });
  const toon = () => new THREE.MeshToonMaterial({ gradientMap: gradient });
  const sideM = toon();
  const tops = [toon(), toon(), toon(), toon()];

  const S = { amp: opts.reduced ? 0 : 1, par: opts.reduced ? 0 : 1, off: 1, t: 0, mx: 0, my: 0, cmx: 0, cmy: 0, flap: 0, follow: 0 };
  const cam = { x: 2.4, y: 2.1, z: 3.7, lx: 0, ly: 0.75, lz: 0, fov: 32 };
  const rig = new THREE.Group();
  scene.add(rig);

  const cellGeo = new THREE.CylinderGeometry(CELL_R * 0.95, CELL_R * 0.95, 1, 6);
  cellGeo.translate(0, -0.5, 0);
  const cellOutline = outlineGeometry(cellGeo, 0.022);
  const cells = hexGrid(4).map(({ q, r, d }) => {
    const centre = q === 0 && r === 0;
    const top = centre ? 0 : rnd() < 0.32 ? 0 : rnd() < 0.08 ? 3 : rnd() < 0.5 ? 1 : 2;
    const mesh = new THREE.Mesh(cellGeo, [sideM, tops[top], sideM]);
    mesh.add(new THREE.Mesh(cellOutline, outM));
    mesh.position.set(Math.sqrt(3) * CELL_R * (q + r / 2), centre ? 0.72 : 0.3 + rnd() * 0.42 - d * 0.03, 1.5 * CELL_R * r);
    mesh.scale.y = 3;
    rig.add(mesh);
    return { mesh, d };
  });

  const outer = new THREE.Group();
  outer.position.set(0, 1.02, 0);
  rig.add(outer);
  const inner = new THREE.Group();
  inner.rotation.y = -Math.PI / 2;
  inner.scale.setScalar(BEE_SCALE);
  outer.add(inner);
  const bee = createBeeModel(gradient, outM, opts.palette);
  inner.add(bee.group);
  bee.eyes.forEach((e) => (e.scale.y = 0.18));
  bee.wings.forEach((w) => (w.pivot.rotation.x = w.side * 0.9));
  outer.lookAt(2, 1.0, 3);

  const trailBuf = new Float32Array(TRAIL_POINTS * 3);
  const trailGeo = new THREE.BufferGeometry();
  trailGeo.setAttribute("position", new THREE.BufferAttribute(trailBuf, 3));
  trailGeo.setDrawRange(0, 0);
  const trailM = new THREE.PointsMaterial({ size: 0.045, sizeAttenuation: true, transparent: true, depthWrite: false });
  rig.add(new THREE.Points(trailGeo, trailM));

  const applyPalette = (p: RisoPalette) => {
    renderer.setClearColor(p.paper, 0);
    fog.color.set(p.paper);
    outM.color.set(p.ink);
    sideM.color.set(p.paper3);
    [p.canary, p.paper, p.paper2, p.tomato].forEach((color, i) => tops[i].color.set(color));
    trailM.color.set(p.ink);
    bee.applyPalette(p);
  };
  applyPalette(opts.palette);
  let trailCount = 0;
  const lastTrail = new THREE.Vector3(1e9, 0, 0);
  const flight = { u: 0 };
  let curve: THREE.CatmullRomCurve3 | null = null;
  const heading = new THREE.Quaternion();
  const facing = new THREE.Quaternion();
  const roll = new THREE.Quaternion();
  const forwardAxis = new THREE.Vector3(0, 0, 1);
  const aim = new THREE.Matrix4();
  const up = new THREE.Vector3(0, 1, 0);
  const tan = new THREE.Vector3();
  const ahead = new THREE.Vector3();
  let bank = 0;
  /** Follows the curve, easing the heading and rolling into turns instead of snapping to the tangent. */
  const fly = (dt: number) => {
    if (!curve) return;
    const u = flight.u;
    const p = curve.getPointAt(u);
    curve.getTangentAt(u, tan);
    curve.getTangentAt(Math.min(1, u + 0.03), ahead);
    // A light hover bob: eased in at take-off and damped while the bee is at full speed.
    const bob = Math.sin(S.t * 9) * 0.03 * Math.min(1, u * 15) * (1 - Math.sin(u * Math.PI) * 0.7);
    outer.position.set(p.x, p.y + bob, p.z);
    const k = 1 - Math.exp(-dt * 7);
    bank += (THREE.MathUtils.clamp(-tan.clone().cross(ahead).y * 9, -0.6, 0.6) - bank) * k;
    aim.lookAt(ahead.add(p), p, up);
    heading.setFromRotationMatrix(aim);
    facing.slerp(heading, 1 - Math.exp(-dt * 6));
    outer.quaternion.copy(facing).multiply(roll.setFromAxisAngle(forwardAxis, bank));
    if (p.distanceTo(lastTrail) > 0.08 && trailCount < TRAIL_POINTS) {
      trailBuf.set([p.x, p.y, p.z], trailCount * 3);
      trailCount++;
      trailGeo.setDrawRange(0, trailCount);
      trailGeo.attributes.position.needsUpdate = true;
      lastTrail.copy(p);
    }
  };

  let vw = 1;
  let vh = 1;
  let ox = 0;
  let oy = 0;
  let fovK = 1;
  const resize = () => {
    vw = host.clientWidth || innerWidth;
    vh = host.clientHeight || innerHeight;
    renderer.setSize(vw, vh, false);
    camera.aspect = vw / vh;
    fovK = camera.aspect < 0.8 ? 1.55 : camera.aspect < 1.15 ? 1.2 : 1;
    // Wide screens shift the frame left of the text block; narrow ones push the bee above it.
    ox = camera.aspect > 1.15 ? -vw * 0.15 : 0;
    oy = camera.aspect < 1.15 ? vh * 0.13 : 0;
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  const onMove = (e: PointerEvent) => {
    S.mx = (e.clientX / innerWidth) * 2 - 1;
    S.my = (e.clientY / innerHeight) * 2 - 1;
  };
  addEventListener("pointermove", onMove);
  if (opts.grain) applyFilmGrain(opts.grain);
  if (!opts.reduced) gsap.from(cam, { x: cam.x * 1.35, y: cam.y + 1.3, z: cam.z * 1.45, duration: 2.6, ease: "power3.out" });

  const look = new THREE.Vector3();
  const beePos = new THREE.Vector3();
  const headPos = new THREE.Vector3();
  const headScale = new THREE.Vector3();
  const headEdge = new THREE.Vector3();
  let paused = false;
  let frame = 0;
  const tick = (_time: number, deltaMs: number) => {
    if (paused) return;
    const dt = Math.min(0.05, deltaMs / 1000);
    S.t += dt;
    frame++;
    if (curve) fly(dt);
    if (S.flap) bee.wings.forEach((w) => (w.pivot.rotation.x = w.side * (0.2 + Math.sin(S.t * 70) * 0.55)));
    else {
      inner.scale.set(BEE_SCALE, BEE_SCALE * (1 + Math.sin(S.t * 2.2) * 0.04 * S.amp), BEE_SCALE);
      rig.rotation.y = Math.sin(S.t * 0.25) * 0.08 * S.amp;
    }
    S.cmx += (S.mx - S.cmx) * 0.05;
    S.cmy += (S.my - S.cmy) * 0.05;
    camera.position.set(cam.x + S.cmx * 0.4 * S.par, cam.y - S.cmy * 0.25 * S.par, cam.z);
    look.set(cam.lx, cam.ly, cam.lz);
    if (S.follow) look.lerp(outer.position, S.follow);
    camera.lookAt(look);
    camera.fov = cam.fov * fovK;
    camera.setViewOffset(vw, vh, ox * S.off, oy * S.off, vw, vh);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    if (opts.onPosition) {
      const toScreen = (v: THREE.Vector3) => ({ x: (v.x * 0.5 + 0.5) * vw, y: (-(v.y * 0.5) + 0.5) * vh });
      const body = toScreen(outer.getWorldPosition(beePos).project(camera));
      // The head's screen radius: project its centre and a point one world radius to the camera's right.
      bee.head.getWorldPosition(headPos);
      bee.head.getWorldScale(headScale);
      headEdge.setFromMatrixColumn(camera.matrixWorld, 0).multiplyScalar(BEE_HEAD_RADIUS * headScale.x).add(headPos);
      const head = toScreen(headPos.project(camera));
      const edge = toScreen(headEdge.project(camera));
      opts.onPosition({ ...body, head: { ...head, r: Math.hypot(edge.x - head.x, edge.y - head.y) } });
    }
    if (opts.timecode && frame % 2 === 0) opts.timecode.textContent = formatTimecode(S.t);
    if (opts.grain && frame % 3 === 0) shiftFilmGrain(opts.grain);
  };
  gsap.ticker.add(tick);

  return {
    wake(tl) {
      const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
      tl.to(S, { amp: 0, par: 0, duration: 0.6, ease: "power2.out" }, 0)
        .to(S, { off: 0, duration: 1.3, ease: "power2.inOut" }, 0.4)
        .to(bee.eyes.map((e) => e.scale), { y: 1, duration: 0.18, ease: "back.out(3)" }, 0.1)
        .to(outer.rotation, { z: "+=0.22", duration: 0.06, yoyo: true, repeat: 5, ease: "none" }, 0.15)
        .add(() => {
          S.flap = 1;
          opts.onFlap?.();
        }, 0.45)
        .add(() => {
          const o = outer.position.clone();
          facing.copy(outer.quaternion);
          // One continuous path from the cell: a gentle hover first, then the loop off-screen.
          curve = new THREE.CatmullRomCurve3(
            [o, V(o.x + 0.12, o.y + 0.45, o.z + 0.1), V(0.6, 1.95, -0.8), V(-1.3, 2.6, -0.2), V(-1.0, 3.15, 1.8), V(0.8, 3.15, 3.7), V(0.6, 3.2, 5.9)],
            false,
            "centripetal",
          );
        }, 0.52)
        .to(flight, { u: 1, duration: 3.1, ease: "power2.inOut" }, 0.52)
        .to(S, { follow: 0.85, duration: 0.9, ease: "power2.inOut" }, 1.0)
        .to(cam, { x: 0.6, y: 3.2, z: 6.3, fov: 36, duration: 2.5, ease: "power2.inOut" }, 1.0)
        .to(trailM, { opacity: 0, duration: 0.6 }, 3.0);
      cells.forEach((c) => tl.to(c.mesh.position, { y: c.mesh.position.y - 2.6 - rnd() * 1.5, duration: 1.4, ease: "power3.in" }, 1.5 + c.d * 0.12));
      return 3.7;
    },
    pause() {
      paused = true;
    },
    applyPalette,
    dispose() {
      gsap.ticker.remove(tick);
      ro.disconnect();
      removeEventListener("pointermove", onMove);
      gsap.killTweensOf([cam, S, flight]);
      bee.dispose();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Points) o.geometry.dispose();
      });
      [sideM, ...tops, outM, trailM].forEach((m) => m.dispose());
      gradient.dispose();
      // Release the GL context now; otherwise it lingers until GC (StrictMode remounts would pile them up).
      renderer.forceContextLoss();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
