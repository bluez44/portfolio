"use client";

import { useEffect, useRef, type RefObject } from "react";
import { createBeeIntroScene, type BeeIntroScene } from "./bee-intro-scene";

type Refs = {
  reduced: boolean;
  timecodeRef: RefObject<HTMLElement | null>;
  grainRef: RefObject<HTMLElement | null>;
  onFlap: () => void;
  onPosition?: (pos: { x: number; y: number }) => void;
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

  return sceneRef;
}
