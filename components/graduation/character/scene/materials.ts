import * as THREE from "three";
import { toonGradient } from "../../shared/three/toon";

const TOON_KEYS = ["gown", "stole", "tassel", "skin", "blush", "hair", "cap", "pants", "shoe", "b1", "b2", "b3", "laptop", "paper"] as const;
type ToonKey = (typeof TOON_KEYS)[number];

export type Materials = Record<ToonKey, THREE.MeshToonMaterial> & {
  screen: THREE.MeshBasicMaterial;
  outline: THREE.MeshBasicMaterial;
  shadow: THREE.MeshBasicMaterial;
  gradient: THREE.DataTexture;
};

const DEFAULTS: Record<ToonKey, string> = {
  gown: "#1240e5", stole: "#ef4e2b", tassel: "#f5c518", skin: "#f4cfb2", blush: "#ef4e2b",
  hair: "#1c1b1f", cap: "#1c1b1f", pants: "#4a4a52", shoe: "#1c1b1f",
  b1: "#ef4e2b", b2: "#f5c518", b3: "#0f8f65", laptop: "#7a7a83", paper: "#fbf8f2",
};

export function createMaterials(): Materials {
  const gradient = toonGradient([110, 190, 255]);
  const toon = Object.fromEntries(
    TOON_KEYS.map((k) => [k, new THREE.MeshToonMaterial({ color: DEFAULTS[k], gradientMap: gradient })]),
  ) as Record<ToonKey, THREE.MeshToonMaterial>;
  return {
    ...toon,
    gradient,
    screen: new THREE.MeshBasicMaterial({ color: "#1240e5" }),
    outline: new THREE.MeshBasicMaterial({ color: "#1c1b1f", side: THREE.BackSide }),
    shadow: new THREE.MeshBasicMaterial({ color: "#1c1b1f", transparent: true, opacity: 0.16 }),
  };
}

/** Re-tints materials from the current CSS riso tokens. */
export function applyPalette(m: Materials, readVar: (name: string) => string, dark: boolean): void {
  const set = (mat: { color: THREE.Color }, value: string) => value && mat.color.set(value);
  set(m.gown, readVar("--blue"));
  set(m.stole, readVar("--tomato"));
  set(m.blush, readVar("--tomato"));
  set(m.tassel, readVar("--canary"));
  set(m.b1, readVar("--tomato"));
  set(m.b2, readVar("--canary"));
  set(m.b3, readVar("--jade"));
  set(m.screen, readVar("--blue"));
  set(m.outline, dark ? "#0a0907" : readVar("--ink"));
  set(m.shadow, readVar("--ink"));
}

export function disposeMaterials(m: Materials): void {
  Object.values(m).forEach((v) => v.dispose());
}
