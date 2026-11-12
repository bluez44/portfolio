# Graduation Bee Intro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay giao diện phong bì và con dấu của màn mở thư bằng cảnh điện ảnh "Chú ong" trong design. Chữ chỉ hiện một ngôn ngữ, có nút VI/EN ở góc phải trên, không có thanh "Phương án · Review" và không có dòng "00 · Mở đầu".

**Architecture:** Gồm ba phần.
- **3D dùng chung:** `toonGradient`, `outlineGeometry` và `createBeeModel`. Ong ở màn mở đầu và ong đưa thư ở tổ ong cùng dùng `createBeeModel`.
- **Cảnh mở đầu thuần three.js:** `createBeeIntroScene`, được bọc trong hook `useBeeIntroScene`.
- **Phần React:**
  - `LetterGate` chỉ điều khiển các pha qua reducer cũ.
  - `BeeIntro` là phần hiển thị: markup, cảnh 3D, timeline vào/ra. Nó bị unmount khi mở xong nên cảnh WebGL được dọn dẹp.
  - `useLetterGate` kết thúc theo `finish()` do timeline gọi, không dùng mốc thời gian cố định nữa.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, three 0.185, GSAP 3.15, Web Audio.

**Spec:** `docs/superpowers/specs/2026-11-12-graduation-bee-intro-design.md`. Design gốc: Claude Design, dự án `b80db96d-a298-4481-b2c5-f918cefba74d`, gồm `intro-cinema.js` (builder `bee`) và `Graduation Invitation.dc.html` (`#intro`, `openIntro`, `startCine`).

## Global Constraints

- Làm trực tiếp trên `feat/bee-wall-design-sync`.
- **Không viết test mới** (theo yêu cầu người dùng). Mỗi task được kiểm chứng bằng `npx tsc --noEmit` (4 lỗi cũ trong `tests/` là baseline), `npx eslint <file đổi>`, và kiểm tra trên trình duyệt ở Task 5. Riêng test i18n đang kiểm tra khóa copy cũ nên phải sửa theo khóa mới.
- Mỗi chuỗi hiển thị chỉ một ngôn ngữ, lấy qua `useCopy()`. Khóa mới phải có ở cả `vi.ts` lẫn `en.ts`.
- Nhạc chỉ được kích hoạt đồng bộ trong handler click của "Đánh thức" hoặc của khung hình. "Vào không nhạc" không gọi `onOpen`.
- Âm thanh hiệu ứng (`buzz`, `rustle`) chỉ phát trên đường "Đánh thức" và khi không bật reduced motion.
- Comment chỉ nêu ràng buộc mà code không tự thể hiện.
- Commit message kết thúc bằng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Bấm nút hoặc chạm khung hình khi chưa tải xong:** không có gì xảy ra; nút hiện "Đang chuẩn bị…". Kiểm tra ở Task 5, bước 2.
2. **Đổi ngôn ngữ ngay trên màn mở đầu:** mọi chữ đổi theo, cảnh 3D không bị dựng lại, Tab vẫn không thoát ra trang phía sau. Kiểm tra ở Task 5, bước 6 và 7.
3. **Không có WebGL:** màn mở đầu vẫn bấm được. "Đánh thức" vẫn phát nhạc và chạy phần dải đen. Kiểm tra ở Task 5, bước 9.
4. **Màn hình hẹp (390px):** dải trên không bị tràn (timecode ẩn dưới `sm`), tiêu đề không vỡ dòng giữa chữ. Kiểm tra ở Task 5, bước 8.
5. **Ong đưa thư ở tổ ong sau khi tách mô hình:** vẫn bay, đậu lên thiệp và bay đi như trước. Kiểm tra ở Task 5, bước 10.

---

### Task 1: Helper 3D dùng chung và mô hình ong

**Files:**
- Create: `components/graduation/shared/three/toon.ts`
- Create: `components/graduation/shared/three/bee-model.ts`
- Modify: `components/graduation/character/scene/mesh-kit.ts` (export `outlineGeometry`)
- Modify: `components/graduation/character/scene/materials.ts` (dùng `toonGradient`)
- Modify (viết lại): `components/graduation/wishes/bee-scene.ts`

**Interfaces:**
- Produces:
  - `toonGradient(steps: [number, number, number]): THREE.DataTexture`
  - `outlineGeometry(geo, t): THREE.BufferGeometry` (export)
  - `createBeeModel(gradient, outline): BeeModel`, với `BeeModel = { group: THREE.Group; wings: { pivot: THREE.Group; side: 1 | -1 }[]; eyes: THREE.Mesh[]; dispose(): void }`

- [ ] **Step 1: Tạo `shared/three/toon.ts`**

```ts
import * as THREE from "three";

/** Three-band ramp for MeshToonMaterial; each value is a band's lightness (0–255). */
export function toonGradient([a, b, c]: [number, number, number]): THREE.DataTexture {
  const tex = new THREE.DataTexture(new Uint8Array([a, a, a, 255, b, b, b, 255, c, c, c, 255]), 3, 1, THREE.RGBAFormat);
  tex.minFilter = tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}
```

- [ ] **Step 2: Export `outlineGeometry`**

Trong `mesh-kit.ts`, đổi `function outlineGeometry(` thành `export function outlineGeometry(`.

- [ ] **Step 3: Dùng `toonGradient` trong `materials.ts`**

Thêm `import { toonGradient } from "../../shared/three/toon";`, rồi thay ba dòng tạo `gradient`:

```ts
  const gradient = new THREE.DataTexture(new Uint8Array([110, 110, 110, 255, 190, 190, 190, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
  gradient.minFilter = gradient.magFilter = THREE.NearestFilter;
  gradient.needsUpdate = true;
```

bằng:

```ts
  const gradient = toonGradient([110, 190, 255]);
```

- [ ] **Step 4: Tạo `shared/three/bee-model.ts`**

```ts
import * as THREE from "three";
import { outlineGeometry } from "../../character/scene/mesh-kit";

type Vec3 = [number, number, number];

export type BeeModel = {
  group: THREE.Group;
  wings: { pivot: THREE.Group; side: 1 | -1 }[];
  eyes: THREE.Mesh[];
  dispose(): void;
};

/** The design's toon bee in its own units (body radius 14, facing +x); callers scale and pose it. */
export function createBeeModel(gradient: THREE.DataTexture, outline: THREE.Material): BeeModel {
  const toon = (color: string, extra?: THREE.MeshToonMaterialParameters) =>
    new THREE.MeshToonMaterial({ color, gradientMap: gradient, ...extra });
  const yellow = toon("#f5c518");
  const ink = toon("#1c1b1f");
  const eye = toon("#fbf8f2");
  const wing = toon("#fbf8f2", { transparent: true, opacity: 0.82 });

  const add = (parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, pos?: Vec3 | null, rot?: Vec3 | null, scale?: Vec3 | null, line = 1.3) => {
    const mesh = new THREE.Mesh(geo, mat);
    if (line) mesh.add(new THREE.Mesh(outlineGeometry(geo, line), outline));
    if (pos) mesh.position.set(...pos);
    if (rot) mesh.rotation.set(...rot);
    if (scale) mesh.scale.set(...scale);
    parent.add(mesh);
    return mesh;
  };

  const group = new THREE.Group();
  add(group, new THREE.SphereGeometry(14, 24, 18), yellow, null, null, [1.35, 1, 1]);
  for (const [x, r] of [[-1, 14.3], [-9.5, 12.4]] as const) {
    const band = new THREE.CylinderGeometry(r, r, 5, 24);
    band.rotateZ(Math.PI / 2);
    add(group, band, ink, [x, 0, 0], null, null, 0);
  }
  add(group, new THREE.SphereGeometry(9.5, 20, 16), ink, [19, 1, 0]);
  const eyes = [5, -5].map((z) => add(group, new THREE.SphereGeometry(2.4, 10, 8), eye, [25.5, 3.5, z], null, null, 0));
  const stinger = new THREE.ConeGeometry(3, 8, 10);
  stinger.rotateZ(Math.PI / 2);
  add(group, stinger, ink, [-21.5, 0, 0], null, null, 0.8);
  for (const z of [4, -4]) {
    const stalk = new THREE.CylinderGeometry(0.7, 0.7, 11, 6);
    stalk.translate(0, 5.5, 0);
    const antenna = add(group, stalk, ink, [22, 8, z], [z > 0 ? 0.35 : -0.35, 0, -0.45], null, 0);
    add(antenna, new THREE.SphereGeometry(1.8, 8, 6), ink, [0, 11, 0], null, null, 0);
  }
  const wings = ([1, -1] as const).map((side) => {
    const pivot = new THREE.Group();
    pivot.position.set(3, 11, side * 4);
    group.add(pivot);
    add(pivot, new THREE.SphereGeometry(10, 16, 12), wing, [-2, 0, side * 9], null, [0.75, 0.14, 1], 1);
    return { pivot, side };
  });

  return {
    group,
    wings,
    eyes,
    dispose() {
      group.traverse((o) => {
        if (o instanceof THREE.Mesh) o.geometry.dispose();
      });
      [yellow, ink, eye, wing].forEach((m) => m.dispose());
    },
  };
}
```

- [ ] **Step 5: Viết lại `wishes/bee-scene.ts` dùng mô hình chung**

Giữ nguyên `BeeState`, `BeeScene` và toàn bộ hành vi bay/đậu, thay toàn bộ file bằng:

```ts
import * as THREE from "three";
import { createBeeModel } from "../shared/three/bee-model";
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
  dispose: () => void;
};

/** Toon-shaded 3D courier bee rendered full-screen in an orthographic camera (1 unit = 1 css px). */
export function createBeeScene(host: HTMLElement): BeeScene {
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
  const outM = new THREE.MeshBasicMaterial({ color: "#1c1b1f", side: THREE.BackSide });
  const model = createBeeModel(grad, outM);
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

  const dispose = () => {
    model.dispose();
    outM.dispose();
    grad.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };

  return { resize, frame, dispose };
}
```

- [ ] **Step 6: Kiểm tra**

Run: `npx tsc --noEmit 2>&1 | grep -c "error TS"` → Expected: `4`.
Run: `npx eslint components/graduation/shared/three components/graduation/character/scene components/graduation/wishes/bee-scene.ts` → Expected: không có lỗi.

- [ ] **Step 7: Commit**

```bash
git add components/graduation/shared/three components/graduation/character/scene components/graduation/wishes/bee-scene.ts
git commit -m "refactor(graduation): shared toon gradient and bee model

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Cảnh mở đầu 3D "Chú ong"

**Files:**
- Create: `components/graduation/intro/hex-grid.ts`
- Create: `components/graduation/intro/film-effects.ts`
- Create: `components/graduation/intro/bee-intro-scene.ts`
- Create: `components/graduation/intro/use-bee-intro-scene.ts`

**Interfaces:**
- Consumes: `toonGradient`, `outlineGeometry`, `createBeeModel` (Task 1).
- Produces:
  - `type BeeIntroScene = { wake(tl: gsap.core.Timeline): number; pause(): void; dispose(): void }`
  - `createBeeIntroScene(host, { reduced, timecode?, grain?, onFlap? }): BeeIntroScene`
  - `useBeeIntroScene(hostRef, { reduced, timecodeRef, grainRef, onFlap }): RefObject<BeeIntroScene | null>`

- [ ] **Step 1: Tạo `intro/hex-grid.ts`**

```ts
export type HexCell = { q: number; r: number; d: number };

/** Axial hex coordinates within `radius` of the centre, in the design's iteration order; `d` is the ring. */
export function hexGrid(radius: number): HexCell[] {
  const cells: HexCell[] = [];
  for (let q = -radius; q <= radius; q++) {
    for (let r = -radius; r <= radius; r++) {
      if (Math.abs(q + r) > radius) continue;
      cells.push({ q, r, d: Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) });
    }
  }
  return cells;
}
```

- [ ] **Step 2: Tạo `intro/film-effects.ts`**

```ts
const pad = (n: number) => String(n).padStart(2, "0");

/** SMPTE-style hh:mm:ss:ff at 24 fps. */
export function formatTimecode(seconds: number): string {
  const s = Math.floor(seconds);
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(Math.floor((seconds % 1) * 24))}`;
}

/** Paints a 180px tile of random grey noise as `el`'s background. */
export function applyFilmGrain(el: HTMLElement) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 180;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const img = ctx.createImageData(180, 180);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  el.style.backgroundImage = `url(${canvas.toDataURL()})`;
}

export function shiftFilmGrain(el: HTMLElement) {
  el.style.backgroundPosition = `${Math.floor(Math.random() * 180)}px ${Math.floor(Math.random() * 180)}px`;
}
```

- [ ] **Step 3: Tạo `intro/bee-intro-scene.ts`**

Port builder `bee` cùng runtime chung của `intro-cinema.js`. Seed ngẫu nhiên giữ là 7, và thứ tự gọi `rnd()` phải giống design để tổ ong ra đúng hình như design.

```ts
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
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
```

- [ ] **Step 4: Tạo `intro/use-bee-intro-scene.ts`**

```ts
"use client";

import { useEffect, useRef, type RefObject } from "react";
import { createBeeIntroScene, type BeeIntroScene } from "./bee-intro-scene";

type Refs = {
  reduced: boolean;
  timecodeRef: RefObject<HTMLElement | null>;
  grainRef: RefObject<HTMLElement | null>;
  onFlap: () => void;
};

/** Mounts the intro's 3D scene into `hostRef`; the ref stays null when WebGL is unavailable. */
export function useBeeIntroScene(hostRef: RefObject<HTMLElement | null>, { reduced, timecodeRef, grainRef, onFlap }: Refs) {
  const sceneRef = useRef<BeeIntroScene | null>(null);
  const onFlapRef = useRef(onFlap);
  useEffect(() => {
    onFlapRef.current = onFlap;
  }, [onFlap]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let scene: BeeIntroScene;
    try {
      scene = createBeeIntroScene(host, { reduced, timecode: timecodeRef.current, grain: grainRef.current, onFlap: () => onFlapRef.current() });
    } catch (error) {
      console.error("Bee intro scene disabled (WebGL unavailable):", error);
      return;
    }
    sceneRef.current = scene;
    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, [hostRef, timecodeRef, grainRef, reduced]);

  return sceneRef;
}
```

- [ ] **Step 5: Kiểm tra**

Run: `npx tsc --noEmit 2>&1 | grep -c "error TS"` → Expected: `4`.
Run: `npx eslint components/graduation/intro` → Expected: không có lỗi.

- [ ] **Step 6: Commit**

```bash
git add components/graduation/intro
git commit -m "feat(graduation): bee intro 3D scene

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Âm thanh hiệu ứng: vo ve và giấy

**Files:**
- Modify (viết lại): `lib/graduation/sfx.ts`

**Interfaces:**
- Produces: `playSfx(name: "buzz" | "rustle", delaySec?: number): void`. Không bao giờ throw.

Spec §3.5 đặt đường âm lượng vào `sfx-envelope.ts` để có thể test. Vì người dùng yêu cầu không viết test, hàm `buzzGain` nằm luôn trong `sfx.ts` và không export.

- [ ] **Step 1: Thay toàn bộ `lib/graduation/sfx.ts`**

```ts
type Sfx = "buzz" | "rustle";

const BUZZ = { duration: 2.6, freq: 190, rise: 1.12, flutter: 28, cutoff: 1200, gain: 0.22 };
const RUSTLE = { duration: 0.6, freq: 3200, q: 0.4, gain: 0.18 };
const BUZZ_ATTACK = 0.15;

let ctx: AudioContext | null = null;

/** Buzz loudness 0..1: a quick swell, then a long fade as the bee flies off. */
function buzzGain(t: number, duration: number) {
  if (t <= 0 || t >= duration) return 0;
  if (t < BUZZ_ATTACK) return t / BUZZ_ATTACK;
  return ((duration - t) / (duration - BUZZ_ATTACK)) ** 1.5;
}

function buzz(ac: AudioContext, at: number) {
  const tone = ac.createOscillator();
  tone.type = "sawtooth";
  tone.frequency.setValueAtTime(BUZZ.freq, at);
  tone.frequency.linearRampToValueAtTime(BUZZ.freq * BUZZ.rise, at + 0.6);
  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = BUZZ.cutoff;
  const wingbeat = ac.createGain();
  wingbeat.gain.value = 0.6;
  const lfo = ac.createOscillator();
  lfo.frequency.value = BUZZ.flutter;
  const depth = ac.createGain();
  depth.gain.value = 0.4;
  lfo.connect(depth).connect(wingbeat.gain);
  const amp = ac.createGain();
  const curve = Float32Array.from({ length: 64 }, (_, i) => buzzGain((i / 63) * BUZZ.duration, BUZZ.duration) * BUZZ.gain);
  amp.gain.setValueCurveAtTime(curve, at, BUZZ.duration);
  tone.connect(filter).connect(wingbeat).connect(amp).connect(ac.destination);
  tone.start(at);
  lfo.start(at);
  tone.stop(at + BUZZ.duration);
  lfo.stop(at + BUZZ.duration);
}

function rustle(ac: AudioContext, at: number) {
  const length = Math.ceil(ac.sampleRate * RUSTLE.duration);
  const buffer = ac.createBuffer(1, length, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2;
  const source = ac.createBufferSource();
  source.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = RUSTLE.freq;
  filter.Q.value = RUSTLE.q;
  const amp = ac.createGain();
  amp.gain.value = RUSTLE.gain;
  source.connect(filter).connect(amp).connect(ac.destination);
  source.start(at);
}

/** Synthesized effect; decoration only, so any audio failure is swallowed. */
export function playSfx(name: Sfx, delaySec = 0) {
  try {
    ctx ??= new AudioContext();
    (name === "buzz" ? buzz : rustle)(ctx, ctx.currentTime + delaySec);
  } catch {
    return;
  }
}
```

- [ ] **Step 2: Kiểm tra**

Run: `npx eslint lib/graduation/sfx.ts` → Expected: không có lỗi.
Run: `npx tsc --noEmit 2>&1 | grep -v "^tests/" | grep "error TS"`. Expected: chỉ có lỗi ở `components/graduation/gate/letter-gate.tsx`, vì file này còn gọi `playSfx("crack")`. Task 4 sẽ viết lại file đó.

- [ ] **Step 3: Commit**

```bash
git add lib/graduation/sfx.ts
git commit -m "feat(graduation): bee buzz sfx replaces the seal crack

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Màn mở đầu: copy, pha, timeline, markup

**Files:**
- Modify: `lib/graduation/i18n/types.ts`, `lib/graduation/i18n/copy/vi.ts`, `lib/graduation/i18n/copy/en.ts`
- Modify: `tests/lib/graduation/i18n/i18n.test.ts` (sửa khóa trong test có sẵn)
- Modify (viết lại): `components/graduation/gate/use-letter-gate.ts`
- Create: `components/graduation/gate/use-intro-timeline.ts`
- Create: `components/graduation/gate/bee-intro.tsx`
- Modify (viết lại): `components/graduation/gate/letter-gate.tsx`
- Modify: `components/graduation/invitation.tsx` (truyền `guestName`)
- Modify: `app/globals.css` (xóa keyframes `gate-drop`, `gate-out`)

**Interfaces:**
- Consumes:
  - `useBeeIntroScene`, `BeeIntroScene` (Task 2)
  - `playSfx("buzz" | "rustle")` (Task 3)
  - `gateReducer` (có sẵn), `useScrollLock` (có sẵn), `LangToggle` (có sẵn), `RisoButton` (có sẵn)
- Produces:
  - `GraduationCopy["gate"] = { dialogLabel; wake; tapHint; silent; soundHint; nowPlaying; preparing }` (tất cả là `string`)
  - `useLetterGate(ready: boolean): { phase: GatePhase; open: () => void; finish: () => void }`
  - `LetterGate({ ready, guestName, onOpen, onOpened })`

- [ ] **Step 1: Copy**

Trong `types.ts`, thay dòng `gate: { youHaveMail: string; preparing: string; tapToOpen: string };` bằng:

```ts
  gate: { dialogLabel: string; wake: string; tapHint: string; silent: string; soundHint: string; nowPlaying: string; preparing: string };
```

Trong `vi.ts`, thay dòng `gate: { youHaveMail: … },` bằng:

```ts
  gate: {
    dialogLabel: "Mở thiệp",
    wake: "Đánh thức",
    tapHint: "hoặc chạm vào khung hình",
    silent: "Vào không nhạc →",
    soundHint: "♪ Nên bật âm thanh",
    nowPlaying: "♪ Đang phát",
    preparing: "Đang chuẩn bị lá thư…",
  },
```

Trong `en.ts`, thay dòng `gate: { youHaveMail: … },` bằng:

```ts
  gate: {
    dialogLabel: "Open invitation",
    wake: "Wake",
    tapHint: "or tap the frame",
    silent: "Enter silently →",
    soundHint: "♪ Sound on",
    nowPlaying: "♪ Now playing",
    preparing: "Preparing your letter…",
  },
```

Trong `tests/lib/graduation/i18n/i18n.test.ts`, thay thân test "has the letter gate copy in every language" bằng:

```ts
    for (const copy of Object.values(GRADUATION_COPY)) {
      expect(Object.values(copy.gate).every(Boolean)).toBe(true);
    }
```

- [ ] **Step 2: Viết lại `use-letter-gate.ts`**

```ts
"use client";

import { useCallback, useEffect, useReducer } from "react";
import { useScrollLock } from "@/lib/hooks/use-scroll-lock";
import { gateReducer } from "./gate-phase";

/** Phase of the intro cover; the exit animation decides when it is done by calling `finish`. */
export function useLetterGate(ready: boolean) {
  const [phase, dispatch] = useReducer(gateReducer, "arriving");

  useEffect(() => {
    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    return () => {
      history.scrollRestoration = previous;
    };
  }, []);

  useEffect(() => {
    if (ready) dispatch({ type: "resourcesReady" });
  }, [ready]);

  useScrollLock(phase !== "done");

  const open = useCallback(() => dispatch({ type: "open", animate: true }), []);
  const finish = useCallback(() => dispatch({ type: "openFinished" }), []);
  return { phase, open, finish };
}
```

- [ ] **Step 3: Tạo `use-intro-timeline.ts`**

```ts
"use client";

import gsap from "gsap";
import { useCallback, useEffect, useRef, type RefObject } from "react";
import type { BeeIntroScene } from "../intro/bee-intro-scene";

const TOP = '[data-intro-bar="top"]';
const BOTTOM = '[data-intro-bar="bottom"]';
const BARS = "[data-intro-bar]";
const CHARS = "[data-intro-char]";
const FADERS = "[data-intro-fade]";
const TOAST = "[data-intro-toast]";
const BACKDROP = "[data-intro-backdrop]";

/** The design's letterbox entrance and exit, scoped to the intro root. */
export function useIntroTimeline(rootRef: RefObject<HTMLElement | null>, reduced: boolean) {
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {}, root);
    ctxRef.current = ctx;
    let cancelled = false;
    if (!reduced) {
      (document.fonts?.ready ?? Promise.resolve()).then(() => {
        if (cancelled) return;
        ctx.add(() => {
          gsap
            .timeline()
            .fromTo(TOP, { scaleY: 0, transformOrigin: "50% 0%" }, { scaleY: 1, duration: 1.1, ease: "power4.inOut", clearProps: "transform" }, 0)
            .fromTo(BOTTOM, { scaleY: 0, transformOrigin: "50% 100%" }, { scaleY: 1, duration: 1.1, ease: "power4.inOut", clearProps: "transform" }, 0)
            .from(CHARS, { yPercent: 115, duration: 1.15, stagger: 0.035, ease: "power4.out" }, 0.35)
            .from(FADERS, { opacity: 0, y: 14, duration: 0.8, stagger: 0.08, ease: "power3.out" }, 0.85);
        });
      });
    }
    return () => {
      cancelled = true;
      ctx.revert();
      ctxRef.current = null;
    };
  }, [rootRef, reduced]);

  /** Plays the exit; `scene` (when given) wakes the bee first. `onReveal` fires as the bars start to part. */
  const exit = useCallback(
    (scene: BeeIntroScene | null, onDone: () => void, onReveal?: () => void) => {
      const ctx = ctxRef.current;
      const root = rootRef.current;
      if (!ctx || !root) return onDone();
      ctx.add(() => {
        if (reduced) {
          gsap.to(root, { opacity: 0, duration: 0.45, onComplete: onDone });
          return;
        }
        const tl = gsap.timeline({ onComplete: onDone });
        tl.to(CHARS, { yPercent: -115, duration: 0.7, stagger: 0.022, ease: "power3.in" }, 0).to(FADERS, {
          opacity: 0,
          y: -12,
          duration: 0.45,
          stagger: 0.04,
          ease: "power2.in",
        }, 0);
        let end = 0.55;
        if (scene) {
          const wake = gsap.timeline();
          end = scene.wake(wake);
          tl.add(wake, 0)
            .to(TOAST, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.6)
            .to(TOAST, { opacity: 0, duration: 0.4 }, Math.max(1.2, end - 0.8));
        }
        tl.to(`${BARS} > *`, { opacity: 0, duration: 0.3 }, end - 0.45)
          .set(TOP, { transformOrigin: "50% 0%" }, end - 0.35)
          .set(BOTTOM, { transformOrigin: "50% 100%" }, end - 0.35)
          .to(BARS, { scaleY: (_i: number, el: HTMLElement) => (innerHeight * 0.505) / el.offsetHeight, duration: 0.6, ease: "power4.inOut" }, end - 0.35)
          .set(BACKDROP, { autoAlpha: 0 })
          .set(root, { backgroundColor: "transparent", pointerEvents: "none" })
          .add(() => {
            scene?.pause();
            onReveal?.();
          })
          .to(BARS, { scaleY: 0, duration: 0.95, ease: "power4.inOut" }, "+=0.12");
      });
    },
    [rootRef, reduced],
  );

  return { exit };
}
```

- [ ] **Step 4: Tạo `bee-intro.tsx`**

```tsx
"use client";

import { useEffect, useRef } from "react";
import { RisoButton } from "@/components/ui/riso/button";
import { playSfx } from "@/lib/graduation/sfx";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { LangToggle } from "../i18n/lang-toggle";
import { useCopy } from "../i18n/lang-context";
import { useBeeIntroScene } from "../intro/use-bee-intro-scene";
import type { GatePhase } from "./gate-phase";
import { useIntroTimeline } from "./use-intro-timeline";

const mono = "font-mono text-[10px] tracking-[0.22em] uppercase";
const bar = "absolute inset-x-0 z-8 box-border flex h-[clamp(44px,8vh,72px)] items-center justify-between gap-4 overflow-hidden bg-ink px-[clamp(16px,3vw,32px)]";

const Chars = ({ text }: { text: string }) =>
  [...text].map((ch, i) => (
    <span key={i} data-intro-char className="inline-block whitespace-pre">
      {ch}
    </span>
  ));

type Props = {
  guestName: string;
  phase: GatePhase;
  /** Returns false when the intro is not ready to open. */
  onEnter: (withMusic: boolean) => boolean;
  onExited: () => void;
};

/** The design's "bee" cinematic cover; `onEnter` must run inside the click for the music to start. */
export function BeeIntro({ guestName, phase, onEnter, onExited }: Props) {
  const { gate: t, header, stage, envelope } = useCopy();
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const timecodeRef = useRef<HTMLSpanElement>(null);
  const grainRef = useRef<HTMLDivElement>(null);
  const sceneRef = useBeeIntroScene(hostRef, { reduced, timecodeRef, grainRef, onFlap: () => playSfx("buzz") });
  const { exit } = useIntroTimeline(rootRef, reduced);

  useEffect(() => {
    if (phase === "ready") rootRef.current?.querySelector<HTMLButtonElement>("[data-intro-wake]")?.focus({ preventScroll: true });
  }, [phase]);

  const enter = (withMusic: boolean) => {
    if (!onEnter(withMusic)) return;
    const audible = withMusic && !reduced;
    exit(withMusic ? sceneRef.current : null, onExited, () => audible && playSfx("rustle"));
  };
  const waiting = phase !== "ready";

  return (
    <div ref={rootRef} role="dialog" aria-modal="true" aria-label={t.dialogLabel} className="fixed inset-0 z-100 overflow-hidden bg-paper">
      <div data-intro-backdrop aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(var(--halftone) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <div data-intro-backdrop aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-155 w-155 rounded-full" style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--tomato) 15%, transparent), transparent)" }} />
        <div className="absolute -right-45 -bottom-50 h-175 w-175 rounded-full" style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--blue) 11%, transparent), transparent)" }} />
      </div>
      <div ref={hostRef} data-intro-backdrop aria-hidden onClick={() => enter(true)} className={`absolute inset-0 z-2 ${waiting ? "cursor-wait" : "cursor-pointer"}`} />
      <div data-intro-backdrop aria-hidden className="pointer-events-none absolute inset-0 z-4" style={{ background: "radial-gradient(ellipse 75% 70% at 55% 50%, transparent 55%, rgba(28,27,31,0.12) 100%)" }} />
      <div ref={grainRef} data-intro-backdrop aria-hidden className="pointer-events-none absolute inset-0 z-6 opacity-7 mix-blend-multiply" />

      <span data-intro-toast className="absolute inset-x-0 top-[calc(clamp(44px,8vh,72px)+64px)] z-7 translate-y-2 text-center font-mono text-[11px] tracking-[0.22em] text-jade uppercase opacity-0">
        {t.nowPlaying}
      </span>

      <div className="pointer-events-none absolute inset-x-[clamp(20px,5vw,72px)] bottom-[calc(clamp(44px,8vh,72px)+clamp(20px,5vh,56px))] z-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <div className="flex min-w-0 flex-col gap-[clamp(10px,2vh,18px)]">
          <h1
            aria-label={`${stage.cover.lead} ${stage.cover.accent}`}
            className="m-0 font-heading text-[clamp(56px,11.5vw,184px)] leading-[0.86] font-bold tracking-[-0.045em] text-ink"
            style={{ fontVariationSettings: '"wdth" 82, "opsz" 96' }}
          >
            <span aria-hidden className="block overflow-hidden pb-[0.05em]">
              <Chars text={stage.cover.lead} />
            </span>
            <span aria-hidden className="block overflow-hidden pb-[0.1em] text-tomato italic" style={{ fontVariationSettings: '"wdth" 78, "opsz" 96' }}>
              <Chars text={stage.cover.accent} />
            </span>
          </h1>
          <div data-intro-fade className="flex flex-wrap items-baseline gap-3">
            <span className={`${mono} text-ink-3`}>{envelope.to}</span>
            <span className="font-heading text-[clamp(20px,2.4vw,30px)] font-semibold tracking-[-0.02em] whitespace-nowrap text-ink">{guestName}</span>
          </div>
        </div>
        <div data-intro-fade className="pointer-events-auto flex flex-col items-end gap-2.5">
          <RisoButton data-intro-wake variant="primary" size="lg" icon="→" disabled={waiting} onClick={() => enter(true)}>
            {phase === "arriving" ? t.preparing : t.wake}
          </RisoButton>
          <span className={`${mono} tracking-[0.16em] text-ink-3`}>{t.tapHint}</span>
        </div>
      </div>

      <div data-intro-bar="top" className={`${bar} top-0`}>
        <span className={`${mono} whitespace-nowrap text-paper`}>QV — {header.title}</span>
        <div className="flex items-center gap-4">
          <span aria-hidden className={`${mono} hidden items-center gap-2 text-paper sm:flex`}>
            <span className="h-1.75 w-1.75 rounded-full bg-tomato" />
            <span ref={timecodeRef} className="tabular-nums">
              00:00:00:00
            </span>
          </span>
          <LangToggle />
        </div>
      </div>
      <div data-intro-bar="bottom" className={`${bar} bottom-0`}>
        <button
          type="button"
          disabled={waiting}
          onClick={() => enter(false)}
          className="riso-focus cursor-pointer border-0 bg-transparent px-0 py-1.5 font-sans text-sm whitespace-nowrap text-paper underline underline-offset-4 hover:text-canary disabled:cursor-wait"
        >
          {t.silent}
        </button>
        <span className={`${mono} whitespace-nowrap text-paper`}>{t.soundHint}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Viết lại `letter-gate.tsx`**

```tsx
"use client";

import { useEffect } from "react";
import { BeeIntro } from "./bee-intro";
import { useLetterGate } from "./use-letter-gate";

type Props = { ready: boolean; guestName: string; onOpen: () => void; onOpened: () => void };

/** Holds the page behind the intro until the guest opens it; `onOpen` is the music's user activation. */
export function LetterGate({ ready, guestName, onOpen, onOpened }: Props) {
  const { phase, open, finish } = useLetterGate(ready);

  useEffect(() => {
    if (phase === "done") onOpened();
  }, [phase, onOpened]);

  if (phase === "done") return null;

  const onEnter = (withMusic: boolean) => {
    if (phase !== "ready") return false;
    if (withMusic) onOpen();
    open();
    return true;
  };

  return <BeeIntro guestName={guestName} phase={phase} onEnter={onEnter} onExited={finish} />;
}
```

- [ ] **Step 6: Truyền `guestName` trong `invitation.tsx`**

Thay `<LetterGate ready={!gate?.pending} onOpen={startMusic} onOpened={onLetterOpened} />` bằng:

```tsx
      <LetterGate ready={!gate?.pending} guestName={guest.name} onOpen={startMusic} onOpened={onLetterOpened} />
```

- [ ] **Step 7: Xóa keyframes cũ**

Trong `app/globals.css`, xóa trọn hai khối `@keyframes gate-drop { … }` và `@keyframes gate-out { … }` (nằm ngay sau `@keyframes wish-pop`).

- [ ] **Step 8: Kiểm tra**

Run: `npx tsc --noEmit 2>&1 | grep -c "error TS"` → Expected: `4`.
Run: `npx eslint components/graduation/gate components/graduation/intro components/graduation/invitation.tsx lib/graduation` → Expected: không có lỗi.
Run: `npx vitest run --exclude tests/lib/graduation/ics.test.ts --exclude tests/components/graduation/character/choreography/beats.test.ts` → Expected: tất cả pass.
Run: `grep -rn "youHaveMail\|tapToOpen\|gate-drop\|gate-out\|\"crack\"" components lib app tests` → Expected: không có kết quả.

- [ ] **Step 9: Commit**

```bash
git add lib/graduation/i18n tests/lib/graduation/i18n/i18n.test.ts components/graduation/gate components/graduation/invitation.tsx app/globals.css
git commit -m "feat(graduation): bee cinematic intro replaces the wax-seal gate

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Kiểm tra trên trình duyệt

Không đổi code, trừ khi phát hiện lỗi; nếu có thì sửa và commit `fix(graduation): …`. Dùng dev server có sẵn ở `localhost:3000`, khách `ae-guot`. Lấy trạng thái player bằng `YT.get(document.querySelector('iframe[src*=youtube]').id).getPlayerState()`.

- [ ] **Step 1:** Reload. Phải thấy cảnh tổ ong và ong đang thở; hai dải đen trượt vào; "Ngày tốt nghiệp." hiện từng ký tự; dòng "Gửi · Ae guột"; timecode chạy. Không có thanh "Phương án · Review", không có dòng "00 · Mở đầu".
- [ ] **Step 2:** Ngay sau reload, nút ghi "Đang chuẩn bị lá thư…" và bị khóa; click vào khung hình không có tác dụng. Khi tải xong, nút đổi thành "Đánh thức →" và có focus.
- [ ] **Step 3:** Click "Đánh thức".
  - Ong mở mắt, rung mình, cất cánh (nghe tiếng vo ve), bay theo đường cong để lại vệt chấm, các ô rơi xuống.
  - Toast "♪ Đang phát" hiện.
  - Hai dải đen khép lại rồi mở ra (nghe tiếng giấy).
  - Trang ở `scrollY` 0, focus ở `SECTION#stage`, player state `1`, không mute.
- [ ] **Step 4:** Reload, bấm "Vào không nhạc →": không có nhạc (player state khác `1`), không có âm thanh hiệu ứng, vào trang trong khoảng 2 giây.
- [ ] **Step 5:** Reload, chạm vào khung hình (ngoài nút): kết quả như bước 3.
- [ ] **Step 6:** Reload, bấm EN trên dải đen phía trên. Chữ đổi thành "Graduation / day.", "To", "Wake →", "or tap the frame", "Enter silently →", "♪ Sound on". Cảnh 3D không bị dựng lại. Chuyển về VI.
- [ ] **Step 7:** Nhấn Tab liên tục: focus chỉ đi qua các nút trong màn mở đầu (VI, EN, "Vào không nhạc", "Đánh thức"), không vào header hay iframe. `scrollY` vẫn 0.
- [ ] **Step 8:** Resize xuống 390×844. Dải trên không bị tràn (timecode ẩn), tiêu đề không vỡ dòng giữa chữ, ong nằm phía trên khối chữ. Trả lại kích thước cũ.
- [ ] **Step 9:** Mô phỏng thiếu WebGL: chạy `HTMLCanvasElement.prototype.getContext = () => null` trước khi trang mount (dùng snippet trong DevTools ở chế độ Override, hoặc tạm bỏ qua nếu không làm được và ghi lại trong ledger). Màn mở đầu vẫn có chữ và nút, "Đánh thức" vẫn phát nhạc.
- [ ] **Step 10:** Cuộn tới tổ ong, bấm một ô: ong đưa thư bay ra, đậu lên thiệp, đóng thiệp thì ong bay đi. Mọi thứ như trước khi tách mô hình.
