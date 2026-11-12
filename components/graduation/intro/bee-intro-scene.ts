import gsap from "gsap";
import * as THREE from "three";
import { outlineGeometry } from "../character/scene/mesh-kit";
import { createBeeModel } from "../shared/three/bee-model";
import { toonGradient } from "../shared/three/toon";
import { applyFilmGrain, formatTimecode, shiftFilmGrain } from "./film-effects";
import { hexGrid } from "./hex-grid";

const C = { paper: "#fbf8f2", paper2: "#f2ede2", paper3: "#e7e1d3", ink: "#1c1b1f", tomato: "#ef4e2b", canary: "#f5c518" };
const CELL_R = 0.5;
const BEE_SCALE = 0.021;
const TRAIL_POINTS = 600;

export type BeeIntroScene = {
  /** Adds the bee waking and flying off to `tl`; returns when (s) the scene's part ends. */
  wake(tl: gsap.core.Timeline): number;
  pause(): void;
  dispose(): void;
};

type Options = { reduced: boolean; timecode?: HTMLElement | null; grain?: HTMLElement | null; onFlap?: () => void };

const seeded = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

/** The design's "bee" intro: a toon honeycomb with a sleeping bee, a drifting camera and film overlays. */
export function createBeeIntroScene(host: HTMLElement, opts: Options): BeeIntroScene {
  const rnd = seeded(7);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0xfbf8f2, 0);
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%;";
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xfbf8f2, 3.5, 12);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9a9488, 0.85));
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.85);
  keyLight.position.set(3, 6, 5);
  scene.add(keyLight);

  const gradient = toonGradient([122, 196, 255]);
  const outM = new THREE.MeshBasicMaterial({ color: C.ink, side: THREE.BackSide });
  const toon = (color: string) => new THREE.MeshToonMaterial({ color, gradientMap: gradient });
  const sideM = toon(C.paper3);
  const tops = [toon(C.canary), toon(C.paper), toon(C.paper2), toon(C.tomato)];

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
  const bee = createBeeModel(gradient, outM);
  inner.add(bee.group);
  bee.eyes.forEach((e) => (e.scale.y = 0.18));
  bee.wings.forEach((w) => (w.pivot.rotation.x = w.side * 0.9));
  outer.lookAt(2, 1.0, 3);

  const trailBuf = new Float32Array(TRAIL_POINTS * 3);
  const trailGeo = new THREE.BufferGeometry();
  trailGeo.setAttribute("position", new THREE.BufferAttribute(trailBuf, 3));
  trailGeo.setDrawRange(0, 0);
  const trailM = new THREE.PointsMaterial({ color: C.ink, size: 0.045, sizeAttenuation: true, transparent: true, depthWrite: false });
  rig.add(new THREE.Points(trailGeo, trailM));
  let trailCount = 0;
  const lastTrail = new THREE.Vector3(1e9, 0, 0);
  const flight = { u: 0 };
  let curve: THREE.CatmullRomCurve3 | null = null;
  const fly = () => {
    if (!curve) return;
    const p = curve.getPointAt(flight.u);
    outer.position.copy(p);
    outer.lookAt(p.clone().add(curve.getTangentAt(flight.u)));
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
  let paused = false;
  let frame = 0;
  const tick = (_time: number, deltaMs: number) => {
    if (paused) return;
    const dt = Math.min(0.05, deltaMs / 1000);
    S.t += dt;
    frame++;
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
        .to(outer.position, { y: "+=0.5", duration: 0.6, ease: "power2.out" }, 0.5)
        .add(() => {
          curve = new THREE.CatmullRomCurve3([outer.position.clone(), V(0.6, 1.9, -0.9), V(-1.4, 2.6, -0.2), V(-1.0, 3.2, 1.8), V(0.9, 3.1, 3.6), V(0.6, 3.2, 5.9)], false, "catmullrom", 0.5);
        }, 1.05)
        .to(flight, { u: 1, duration: 2.5, ease: "power1.inOut", onUpdate: fly }, 1.08)
        .to(S, { follow: 0.85, duration: 0.9, ease: "power2.inOut" }, 1.0)
        .to(cam, { x: 0.6, y: 3.2, z: 6.3, fov: 36, duration: 2.5, ease: "power2.inOut" }, 1.0)
        .to(trailM, { opacity: 0, duration: 0.6 }, 3.0);
      cells.forEach((c) => tl.to(c.mesh.position, { y: c.mesh.position.y - 2.6 - rnd() * 1.5, duration: 1.4, ease: "power3.in" }, 1.5 + c.d * 0.12));
      return 3.7;
    },
    pause() {
      paused = true;
    },
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
