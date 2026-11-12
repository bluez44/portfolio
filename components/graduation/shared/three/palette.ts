import * as THREE from "three";

export type RisoPalette = { paper: string; paper2: string; paper3: string; ink: string; tomato: string; canary: string; blue: string; jade: string };

const TOKENS: Record<keyof RisoPalette, string> = {
  paper: "--paper",
  paper2: "--paper-2",
  paper3: "--paper-3",
  ink: "--ink",
  tomato: "--tomato",
  canary: "--canary",
  blue: "--blue",
  jade: "--jade",
};

/** The riso tokens as currently resolved on the page, so 3D scenes follow the theme. */
export function readRisoPalette(): RisoPalette {
  const styles = getComputedStyle(document.documentElement);
  return Object.fromEntries(Object.entries(TOKENS).map(([key, token]) => [key, styles.getPropertyValue(token).trim()])) as RisoPalette;
}

const lightness = (color: string) => new THREE.Color(color).getHSL({ h: 0, s: 0, l: 0 }).l;

export const isDarkPalette = (p: RisoPalette) => lightness(p.paper) < lightness(p.ink);

/** The darker and the lighter of ink and paper, whichever theme is on. */
export const inkAndPaperByDepth = (p: RisoPalette): { deep: string; pale: string } =>
  isDarkPalette(p) ? { deep: p.paper, pale: p.ink } : { deep: p.ink, pale: p.paper };
