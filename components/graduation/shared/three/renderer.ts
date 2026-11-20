import * as THREE from "three";
import type { PerfTier } from "@/lib/browser/perf-tier";

export type DprCaps = { full: number; lite: number };

const DEFAULT_DPR_CAPS: DprCaps = { full: 2, lite: 1.25 };

export function rendererOptions(
  tier: PerfTier,
  dpr: number,
  caps: DprCaps = DEFAULT_DPR_CAPS,
): { antialias: boolean; pixelRatio: number } {
  const lite = tier === "lite";
  return {
    antialias: !lite,
    pixelRatio: Math.min(dpr, lite ? caps.lite : caps.full),
  };
}

export function createRenderer(tier: PerfTier, caps?: DprCaps): THREE.WebGLRenderer {
  const { antialias, pixelRatio } = rendererOptions(tier, window.devicePixelRatio, caps);
  const renderer = new THREE.WebGLRenderer({ antialias, alpha: true });
  renderer.setPixelRatio(pixelRatio);
  return renderer;
}
