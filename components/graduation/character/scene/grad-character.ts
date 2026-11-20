import * as THREE from "three";
import type { PerfTier } from "@/lib/browser/perf-tier";
import { BODY_MARGIN } from "../choreography/constants";
import { targetPose } from "../choreography/target-pose";
import { createFrameGovernor } from "../../shared/three/frame-governor";
import { createGeometryCache } from "../../shared/three/geometry-cache";
import { readRisoPalette, type RisoPalette } from "../../shared/three/palette";
import { createRenderer } from "../../shared/three/renderer";
import { applyPalette, createMaterials, disposeMaterials, type Materials } from "./materials";
import { createMeshKit } from "./mesh-kit";
import { applyPose, type PoseState } from "./pose";
import { buildRig } from "./rig";
import type { Beat } from "../types";
import { CAMERA_Y, CAMERA_Z, FOV, INITIAL_POSE } from "./constants";

/** A full-screen canvas whose figure is small does not need 2x pixel density. */
const CHARACTER_DPR_CAPS = { full: 1.5, lite: 1 };
const IDLE_FPS = 30;
const POSE_SETTLED_EPS = 1e-3;

export type GradCharacter = {
  frame(time: number, scrollY: number): void;
  resize(beats: Beat[] | null): void;
  applyPalette(p: RisoPalette): void;
  view(): { halfW: number; scale: number };
  headScreen(): { x: number; y: number };
  dispose(): void;
};

export function createGradCharacter(host: HTMLElement, opts: { scale: number; tier: PerfTier }): GradCharacter {
  // Throws if WebGL is unavailable; nothing has been created yet, so there is nothing to dispose.
  const renderer = createRenderer(opts.tier, CHARACTER_DPR_CAPS);
  let materials: Materials | undefined;

  try {
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
    camera.position.set(0, CAMERA_Y, CAMERA_Z);
    camera.lookAt(0, 0, 0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x9a9488, 0.85));
    const light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(3, 5, 6);
    scene.add(light);

    const palette = readRisoPalette();
    const M = createMaterials(palette);
    materials = M;
    const geometries = createGeometryCache();
    const rig = buildRig(scene, createMeshKit(M.outline, geometries), M, palette);
    const S: PoseState = { ...INITIAL_POSE };
    const view = { halfW: 1, halfH: 1, scale: opts.scale };
    const shouldRender = createFrameGovernor(IDLE_FPS);
    let beats: Beat[] | null = null;
    let phase = 0;
    let last: number | null = null;
    let lastScrollY: number | null = null;
    let hiddenOffStage = false;
    let needsRender = false;

    const headPos = new THREE.Vector3();

    return {
      frame(time, scrollY) {
        const dt = last == null ? 0.016 : Math.min(0.05, time - last);
        last = time;
        const target = beats && targetPose(beats, scrollY);
        let moving = false;
        if (target) {
          const k = 1 - Math.pow(0.002, dt);
          for (const key of Object.keys(target) as (keyof PoseState)[]) {
            S[key] += (target[key] - S[key]) * k;
            if (Math.abs(target[key] - S[key]) > POSE_SETTLED_EPS) moving = true;
          }
        }
        phase += dt * 9 * S.walk;

        const scrolled = scrollY !== lastScrollY;
        lastScrollY = scrollY;
        const busy = scrolled || moving;

        const rootX = S.x * (view.halfW - BODY_MARGIN * view.scale);
        const offStage = Math.abs(rootX) - BODY_MARGIN * view.scale > view.halfW;
        if (offStage) {
          // Still posed (cheap, no draw) so headScreen() reports the head off screen.
          applyPose(rig, S, { time, phase }, view);
          if (!hiddenOffStage) {
            rig.root.visible = false;
            renderer.render(scene, camera);
            hiddenOffStage = true;
          }
          needsRender = false;
          return;
        }

        if (hiddenOffStage) {
          rig.root.visible = true;
          hiddenOffStage = false;
          needsRender = true;
        }

        if (!shouldRender(time, busy || needsRender)) return;
        needsRender = false;
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
        view.scale = opts.scale;
        beats = nextBeats;
        needsRender = true;
      },
      applyPalette(p) {
        applyPalette(M, p);
        rig.beeModel.applyPalette(p);
        needsRender = true;
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
        rig.beeModel.dispose();
        geometries.dispose();
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
