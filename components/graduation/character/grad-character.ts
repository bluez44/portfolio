import * as THREE from "three";
import { targetPose } from "./beats";
import { applyPalette, createMaterials, disposeMaterials } from "./materials";
import { createMeshKit } from "./mesh-kit";
import { applyPose, type PoseState } from "./pose";
import { buildRig } from "./rig";
import type { Beat } from "./types";

const FOV = 28;
const CAMERA_Z = 14;
const MOBILE_BREAKPOINT = 760;

export type GradCharacter = {
  frame(time: number, scrollY: number): void;
  resize(beats: Beat[] | null): void;
  applyPalette(dark: boolean): void;
  view(): { halfW: number; scale: number };
  dispose(): void;
};

export function createGradCharacter(host: HTMLElement, opts: { scale: number }): GradCharacter {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.set(0, 1.2, CAMERA_Z);
  camera.lookAt(0, 0, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9a9488, 0.85));
  const light = new THREE.DirectionalLight(0xffffff, 0.8);
  light.position.set(3, 5, 6);
  scene.add(light);

  const M = createMaterials();
  const rig = buildRig(scene, createMeshKit(M.outline), M);
  const S: PoseState = { x: 0.68, ry: -0.5, wave: 1, bow: 0, sit: 0, point: 0, toss: 0, walk: 0, dir: 0 };
  const view = { halfW: 1, halfH: 1, scale: opts.scale };
  let beats: Beat[] | null = null;
  let phase = 0;
  let last: number | null = null;

  return {
    frame(time, scrollY) {
      const dt = last == null ? 0.016 : Math.min(0.05, time - last);
      last = time;
      const target = beats && targetPose(beats, scrollY);
      if (target) {
        const k = 1 - Math.pow(0.002, dt);
        for (const key of Object.keys(target) as (keyof PoseState)[]) S[key] += (target[key] - S[key]) * k;
      }
      phase += dt * 9 * S.walk;
      applyPose(rig, S, { time, phase }, view);
      renderer.render(scene, camera);
    },
    resize(nextBeats) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      view.halfH = CAMERA_Z * Math.tan(((FOV / 2) * Math.PI) / 180);
      view.halfW = view.halfH * camera.aspect;
      view.scale = opts.scale * (w < MOBILE_BREAKPOINT ? 0.7 : 1);
      beats = nextBeats;
    },
    applyPalette(dark) {
      const styles = getComputedStyle(document.documentElement);
      applyPalette(M, (n) => styles.getPropertyValue(n).trim(), dark);
    },
    view: () => ({ halfW: view.halfW, scale: view.scale }),
    dispose() {
      scene.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
      disposeMaterials(M);
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
