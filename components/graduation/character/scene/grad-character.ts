import * as THREE from "three";
import { targetPose } from "../choreography/target-pose";
import { readRisoPalette, type RisoPalette } from "../../shared/three/palette";
import { applyPalette, createMaterials, disposeMaterials, type Materials } from "./materials";
import { createMeshKit } from "./mesh-kit";
import { applyPose, type PoseState } from "./pose";
import { buildRig } from "./rig";
import type { Beat } from "../types";
import { CAMERA_Y, CAMERA_Z, FOV, INITIAL_POSE, MAX_PIXEL_RATIO, MOBILE_BREAKPOINT, MOBILE_SCALE } from "./constants";

export type GradCharacter = {
  frame(time: number, scrollY: number): void;
  resize(beats: Beat[] | null): void;
  applyPalette(p: RisoPalette): void;
  view(): { halfW: number; scale: number };
  headScreen(): { x: number; y: number };
  dispose(): void;
};

export function createGradCharacter(host: HTMLElement, opts: { scale: number }): GradCharacter {
  // Throws if WebGL is unavailable; nothing has been created yet, so there is nothing to dispose.
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  let materials: Materials | undefined;

  try {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
    camera.position.set(0, CAMERA_Y, CAMERA_Z);
    camera.lookAt(0, 0, 0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x9a9488, 0.85));
    const light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(3, 5, 6);
    scene.add(light);

    const M = createMaterials(readRisoPalette());
    materials = M;
    const rig = buildRig(scene, createMeshKit(M.outline), M);
    const S: PoseState = { ...INITIAL_POSE };
    const view = { halfW: 1, halfH: 1, scale: opts.scale };
    let beats: Beat[] | null = null;
    let phase = 0;
    let last: number | null = null;

    const headPos = new THREE.Vector3();

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
        view.scale = opts.scale * (w < MOBILE_BREAKPOINT ? MOBILE_SCALE : 1);
        beats = nextBeats;
      },
      applyPalette(p) {
        applyPalette(M, p);
      },
      view: () => ({ halfW: view.halfW, scale: view.scale }),
      headScreen() {
        rig.headG.getWorldPosition(headPos);
        headPos.project(camera);
        return {
          x: (headPos.x * 0.5 + 0.5) * window.innerWidth,
          y: (-(headPos.y * 0.5) + 0.5) * window.innerHeight,
        };
      },
      dispose() {
        scene.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
        disposeMaterials(M);
        // Release the GL context now; otherwise it lingers until GC (StrictMode remounts would pile them up).
        renderer.forceContextLoss();
        renderer.dispose();
        renderer.domElement.remove();
      },
    };
  } catch (error) {
    // Later steps (materials, rig) may have partially allocated GPU resources; dispose what exists.
    if (materials) disposeMaterials(materials);
    renderer.forceContextLoss();
    renderer.dispose();
    renderer.domElement.remove();
    throw error;
  }
}
