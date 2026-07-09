"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { Hands as HandsInstance } from "@mediapipe/hands";
import type { TechSceneHandle } from "@/components/portfolio/tech-scene";

interface UseHandTrackingOptions {
  sceneRef: RefObject<TechSceneHandle | null>;
  focusedIndex: number | null;
  techCount: number;
}

export function useHandTracking({
  sceneRef,
  focusedIndex,
  techCount,
}: UseHandTrackingOptions) {
  const [handOn, setHandOn] = useState(false);
  const [handStatus, setHandStatus] = useState("");
  const streamRef = useRef<MediaStream | null>(null);
  const handsRef = useRef<HandsInstance | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aliveRef = useRef(false);
  const cycleRef = useRef(-1);
  const lastPinchRef = useRef(0);
  const focusedIndexRef = useRef(focusedIndex);
  // Sync the ref after commit (not during render) to satisfy react-hooks/refs;
  // it's only read inside the async onResults callback, never during render.
  useEffect(() => {
    focusedIndexRef.current = focusedIndex;
  }, [focusedIndex]);

  const stopHands = useCallback(() => {
    aliveRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    handsRef.current?.close();
    handsRef.current = null;
  }, []);

  useEffect(() => stopHands, [stopHands]);

  const startHands = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Camera API unavailable");
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 320, height: 240 },
    });
    const video = document.createElement("video");
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    await video.play();
    streamRef.current = stream;

    const { Hands } = await import("@mediapipe/hands");
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 0,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results) => {
      const scene = sceneRef.current;
      const landmarks = results.multiHandLandmarks[0];
      if (!scene || !landmarks) return;

      scene.setRotationTarget((0.5 - landmarks[0].x) * 5, (landmarks[0].y - 0.5) * 0.8);

      const pinchDistance = Math.hypot(
        landmarks[4].x - landmarks[8].x,
        landmarks[4].y - landmarks[8].y,
      );
      const now = performance.now();
      if (pinchDistance < 0.05 && now - lastPinchRef.current > 1200) {
        lastPinchRef.current = now;
        if (focusedIndexRef.current === null) {
          cycleRef.current = (cycleRef.current + 1) % techCount;
          scene.focusTech(cycleRef.current);
        } else {
          scene.closeFocus();
        }
      }
    });

    handsRef.current = hands;
    aliveRef.current = true;

    const pump = async () => {
      if (!aliveRef.current) return;
      try {
        await hands.send({ image: video });
      } catch {
        // frame skipped, keep pumping
      }
      timerRef.current = setTimeout(pump, 90);
    };
    pump();

    setHandStatus(
      "Hand control active — move your hand to rotate, pinch to focus/close.",
    );
  }, [sceneRef, techCount]);

  const toggleHands = useCallback(() => {
    if (handOn) {
      stopHands();
      setHandOn(false);
      setHandStatus("Hand control off — mouse/touch active.");
      return;
    }
    setHandOn(true);
    setHandStatus("Loading hand-tracking…");
    startHands().catch((error) => {
      console.warn(error);
      stopHands();
      setHandOn(false);
      setHandStatus(
        "Hand-tracking unavailable (camera denied or unsupported) — mouse control still works great.",
      );
    });
  }, [handOn, startHands, stopHands]);

  return { handOn, handStatus, toggleHands };
}
