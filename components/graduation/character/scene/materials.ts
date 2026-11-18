import * as THREE from "three";
import { isDarkPalette, type RisoPalette } from "../../shared/three/palette";
import { toonGradient } from "../../shared/three/toon";
import { createCapBadgeTexture, createStoleTexture } from "./textures";

const TOON_KEYS = [
  "gown",
  "stole",
  "tassel",
  "tasselRing",
  "cowlNavy",
  "cowlCyan",
  "cowlSilver",
  "skin",
  "blush",
  "hair",
  "cap",
  "pants",
  "shoe",
  "b1",
  "b2",
  "b3",
  "laptop",
  "paper",
] as const;
type ToonKey = (typeof TOON_KEYS)[number];
type ThemedKey = "gown" | "blush" | "b1" | "b2" | "b3";
type FixedKey = Exclude<ToonKey, ThemedKey>;

export type Materials = Record<ToonKey, THREE.MeshToonMaterial> & {
  stolePattern: THREE.MeshToonMaterial;
  stolePlain: THREE.MeshToonMaterial;
  capBadge: THREE.MeshBasicMaterial;
  screen: THREE.MeshBasicMaterial;
  outline: THREE.MeshBasicMaterial;
  shadow: THREE.MeshBasicMaterial;
  gradient: THREE.DataTexture;
  stoleTexture: THREE.Texture;
  stolePlainTexture: THREE.Texture;
  capBadgeTexture: THREE.Texture;
};

// University colors & character colors (HCMUT regalia: Navy cap, Cyan tassel, Gold ring, etc.)
const FIXED: Record<FixedKey, string> = {
  skin: "#f4cfb2",
  hair: "#1c1b1f",
  cap: "#1e3a8a", // Royal navy (HCMUT cap)
  tassel: "#38bdf8", // Light sky blue (HCMUT tassel)
  tasselRing: "#f59e0b", // Gold ferrule ring
  cowlNavy: "#1e3a8a", // Royal navy (túi càn khôn outer shell)
  cowlCyan: "#38bdf8", // Light cyan (túi càn khôn inner trim)
  cowlSilver: "#e2e8f0", // Silver / off-white (túi càn khôn lining & collar)
  stole: "#0284c7", // Fallback / base stole color
  pants: "#4a4a52",
  shoe: "#1c1b1f",
  laptop: "#7a7a83",
  paper: "#fbf8f2",
};

// A near-black rim reads on the dark page, where the ink token turns pale.
const DARK_OUTLINE = "#0a0907";

const themed = (p: RisoPalette): Record<ThemedKey, string> => ({
  gown: p.blue,
  blush: p.tomato,
  b1: p.tomato,
  b2: p.canary,
  b3: p.jade,
});

export function createMaterials(p: RisoPalette): Materials {
  const gradient = toonGradient([110, 190, 255]);
  const colors = { ...FIXED, ...themed(p) };
  const toon = Object.fromEntries(
    TOON_KEYS.map((k) => [k, new THREE.MeshToonMaterial({ color: colors[k], gradientMap: gradient })]),
  ) as Record<ToonKey, THREE.MeshToonMaterial>;

  const stoleTexture = createStoleTexture(true);
  const stolePlainTexture = createStoleTexture(false);
  const capBadgeTexture = createCapBadgeTexture();

  const stolePattern = new THREE.MeshToonMaterial({
    map: stoleTexture,
    gradientMap: gradient,
  });

  const stolePlain = new THREE.MeshToonMaterial({
    map: stolePlainTexture,
    gradientMap: gradient,
  });

  const capBadge = new THREE.MeshBasicMaterial({
    map: capBadgeTexture,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const m: Materials = {
    ...toon,
    stolePattern,
    stolePlain,
    capBadge,
    gradient,
    stoleTexture,
    stolePlainTexture,
    capBadgeTexture,
    screen: new THREE.MeshBasicMaterial(),
    outline: new THREE.MeshBasicMaterial({ side: THREE.BackSide }),
    shadow: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.16 }),
  };
  applyPalette(m, p);
  return m;
}

export function applyPalette(m: Materials, p: RisoPalette): void {
  for (const [key, color] of Object.entries(themed(p)) as [ThemedKey, string][]) {
    m[key].color.set(color);
  }
  m.screen.color.set(p.blue);
  m.outline.color.set(isDarkPalette(p) ? DARK_OUTLINE : p.ink);
  m.shadow.color.set(p.ink);
}

export function disposeMaterials(m: Materials): void {
  Object.values(m).forEach((v) => {
    if (v && typeof v.dispose === "function") {
      v.dispose();
    }
  });
}
