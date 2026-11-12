"use client";

import { useEffect, useRef, type RefObject } from "react";
import { readRisoPalette } from "../shared/three/palette";
import { usePaletteSync } from "../shared/three/use-palette-sync";
import { createBeeIntroScene, type BeeIntroScene, type BeeScreenPosition } from "./bee-intro-scene";

type Refs = {
  reduced: boolean;
  timecodeRef: RefObject<HTMLElement | null>;
  grainRef: RefObject<HTMLElement | null>;
  onFlap: () => void;
  onPosition?: (pos: BeeScreenPosition) => void;
};

/** Mounts the intro's 3D scene into `hostRef`; the ref stays null when WebGL is unavailable. */
export function useBeeIntroScene(hostRef: RefObject<HTMLElement | null>, { reduced, timecodeRef, grainRef, onFlap, onPosition }: Refs) {
  const sceneRef = useRef<BeeIntroScene | null>(null);
  const onFlapRef = useRef(onFlap);
  const onPositionRef = useRef(onPosition);
  useEffect(() => {
    onFlapRef.current = onFlap;
  }, [onFlap]);
  useEffect(() => {
    onPositionRef.current = onPosition;
  }, [onPosition]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let scene: BeeIntroScene;
    try {
      scene = createBeeIntroScene(host, {
        reduced,
        palette: readRisoPalette(),
        timecode: timecodeRef.current,
        grain: grainRef.current,
        onFlap: () => onFlapRef.current(),
        onPosition: (pos) => onPositionRef.current?.(pos),
      });
    } catch (error) {
      console.error("Bee intro scene disabled (WebGL unavailable):", error);
      return;
    }
    sceneRef.current = scene;
    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, [hostRef, timecodeRef, grainRef, reduced]);
  usePaletteSync(sceneRef);

  return sceneRef;
}
