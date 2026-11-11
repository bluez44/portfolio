import * as THREE from "three";

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

/**
 * Toon-shaded 3D courier bee rendered full-screen in an orthographic camera
 * (1 unit = 1 css px), ported from the design comp's initBee/beeFrame.
 */
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

  const grad = new THREE.DataTexture(
    new Uint8Array([120, 120, 120, 255, 200, 200, 200, 255, 255, 255, 255, 255]),
    3,
    1,
    THREE.RGBAFormat,
  );
  grad.minFilter = grad.magFilter = THREE.NearestFilter;
  grad.needsUpdate = true;
  const toon = (c: string) => new THREE.MeshToonMaterial({ color: c, gradientMap: grad });
  const yel = toon("#f5c518");
  const ink = toon("#1c1b1f");
  const eye = toon("#fbf8f2");
  const wingM = new THREE.MeshToonMaterial({ color: "#fbf8f2", gradientMap: grad, transparent: true, opacity: 0.82 });
  const outM = new THREE.MeshBasicMaterial({ color: "#1c1b1f", side: THREE.BackSide });

  // Inflate a copy of the geometry along its normals for the ink outline shell.
  const outline = (geo: THREE.BufferGeometry, t: number) => {
    const o = geo.clone();
    const p = o.attributes.position as THREE.BufferAttribute;
    const n = o.attributes.normal as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++)
      p.setXYZ(i, p.getX(i) + n.getX(i) * t, p.getY(i) + n.getY(i) * t, p.getZ(i) + n.getZ(i) * t);
    return o;
  };
  const add = (
    par: THREE.Object3D,
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    pos?: [number, number, number] | null,
    rot?: [number, number, number] | null,
    sc?: [number, number, number] | null,
    line = 1.3,
  ) => {
    const m = new THREE.Mesh(geo, mat);
    if (line) m.add(new THREE.Mesh(outline(geo, line), outM));
    if (pos) m.position.set(...pos);
    if (rot) m.rotation.set(...rot);
    if (sc) m.scale.set(...sc);
    par.add(m);
    return m;
  };

  const g = new THREE.Group();
  scene.add(g);
  add(g, new THREE.SphereGeometry(14, 24, 18), yel, null, null, [1.35, 1, 1]);
  const ring = (x: number, r: number) => {
    const c = new THREE.CylinderGeometry(r, r, 5, 24);
    c.rotateZ(Math.PI / 2);
    add(g, c, ink, [x, 0, 0], null, null, 0);
  };
  ring(-1, 14.3);
  ring(-9.5, 12.4);
  add(g, new THREE.SphereGeometry(9.5, 20, 16), ink, [19, 1, 0]);
  [5, -5].forEach((z) => add(g, new THREE.SphereGeometry(2.4, 10, 8), eye, [25.5, 3.5, z], null, null, 0));
  const st = new THREE.ConeGeometry(3, 8, 10);
  st.rotateZ(Math.PI / 2);
  add(g, st, ink, [-21.5, 0, 0], null, null, 0.8);
  [4, -4].forEach((z) => {
    const a = new THREE.CylinderGeometry(0.7, 0.7, 11, 6);
    a.translate(0, 5.5, 0);
    const m = add(g, a, ink, [22, 8, z], [z > 0 ? 0.35 : -0.35, 0, -0.45], null, 0);
    add(m, new THREE.SphereGeometry(1.8, 8, 6), ink, [0, 11, 0], null, null, 0);
  });
  const wings = [1, -1].map((sd) => {
    const p = new THREE.Group();
    p.position.set(3, 11, sd * 4);
    g.add(p);
    add(p, new THREE.SphereGeometry(10, 16, 12), wingM, [-2, 0, sd * 9], null, [0.75, 0.14, 1], 1);
    return p;
  });
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
    scene.traverse((o) => {
      if (o instanceof THREE.Mesh) o.geometry.dispose();
    });
    [yel, ink, eye, wingM, outM].forEach((m) => m.dispose());
    grad.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };

  return { resize, frame, dispose };
}
