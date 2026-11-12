import * as THREE from "three";
import { isDarkPalette, type RisoPalette } from "../../shared/three/palette";
import { toonGradient } from "../../shared/three/toon";

const TOON_KEYS = ["gown", "stole", "tassel", "skin", "blush", "hair", "cap", "pants", "shoe", "b1", "b2", "b3", "laptop", "paper"] as const;
type ToonKey = (typeof TOON_KEYS)[number];
type ThemedKey = "gown" | "stole" | "blush" | "tassel" | "b1" | "b2" | "b3";
type FixedKey = Exclude<ToonKey, ThemedKey>;

export type Materials = Record<ToonKey, THREE.MeshToonMaterial> & {
  screen: THREE.MeshBasicMaterial;
  outline: THREE.MeshBasicMaterial;
  shadow: THREE.MeshBasicMaterial;
  gradient: THREE.DataTexture;
};

// The figure's own colours (skin, hair, shoes, the sheet of paper) stay put in either theme.
const FIXED: Record<FixedKey, string> = {
  skin: "#f4cfb2", hair: "#1c1b1f", cap: "#1c1b1f", pants: "#4a4a52", shoe: "#1c1b1f", laptop: "#7a7a83", paper: "#fbf8f2",
};
// A near-black rim reads on the dark page, where the ink token turns pale.
const DARK_OUTLINE = "#0a0907";

const themed = (p: RisoPalette): Record<ThemedKey, string> => ({
  gown: p.blue, stole: p.tomato, blush: p.tomato, tassel: p.canary, b1: p.tomato, b2: p.canary, b3: p.jade,
});

export function createMaterials(p: RisoPalette): Materials {
  const gradient = toonGradient([110, 190, 255]);
  const colors = { ...FIXED, ...themed(p) };
  const toon = Object.fromEntries(
    TOON_KEYS.map((k) => [k, new THREE.MeshToonMaterial({ color: colors[k], gradientMap: gradient })]),
  ) as Record<ToonKey, THREE.MeshToonMaterial>;
  const m: Materials = {
    ...toon,
    gradient,
    screen: new THREE.MeshBasicMaterial(),
    outline: new THREE.MeshBasicMaterial({ side: THREE.BackSide }),
    shadow: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.16 }),
  };
  applyPalette(m, p);
  return m;
}

export function applyPalette(m: Materials, p: RisoPalette): void {
  for (const [key, color] of Object.entries(themed(p)) as [ThemedKey, string][]) m[key].color.set(color);
  m.screen.color.set(p.blue);
  m.outline.color.set(isDarkPalette(p) ? DARK_OUTLINE : p.ink);
  m.shadow.color.set(p.ink);
}

export function disposeMaterials(m: Materials): void {
  Object.values(m).forEach((v) => v.dispose());
}
