import * as THREE from "three";
import type { PerfTier } from "@/lib/browser/perf-tier";

const FULL_MAX_DPR = 2;
const LITE_MAX_DPR = 1.25;

export function rendererOptions(tier: PerfTier, dpr: number): { antialias: boolean; pixelRatio: number } {
  const lite = tier === "lite";
  return {
    antialias: !lite,
    pixelRatio: Math.min(dpr, lite ? LITE_MAX_DPR : FULL_MAX_DPR),
  };
}

export function createRenderer(tier: PerfTier): THREE.WebGLRenderer {
  const { antialias, pixelRatio } = rendererOptions(tier, window.devicePixelRatio);
  const renderer = new THREE.WebGLRenderer({ antialias, alpha: true });
  renderer.setPixelRatio(pixelRatio);
  return renderer;
}
