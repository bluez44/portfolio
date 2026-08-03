"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { TalentGetGoLogoModel } from "./talentgetgo-logo-model";
import { CanvasErrorBoundary } from "../portfolio/canvas-error-boundary";

function TurntableGroup({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);

  // Smooth, subtle turntable motion
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y =
        Math.sin(state.clock.getElapsedTime() * 0.3) * 0.2;
      ref.current.rotation.x =
        Math.cos(state.clock.getElapsedTime() * 0.3) * 0.06;
    }
  });

  return <group ref={ref}>{children}</group>;
}

export function TalentGetGoLogoScene() {
  return (
    <CanvasErrorBoundary
      fallback={
        <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-white">
          <p className="text-sm text-neutral-400">
            TalentGetGo 3D Model Preview
          </p>
        </div>
      }
    >
      <Canvas
        style={{ display: "block", width: "100%", height: "100%" }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
        shadows
        camera={{ fov: 32, near: 0.1, far: 100, position: [0, 0, 8.5] }}
      >
        <color attach="background" args={["#ffffff"]} />

        <ambientLight intensity={0.75} />

        {/* Key Light casting clean shadows */}
        <directionalLight
          position={[5, 6, 5]}
          intensity={1.6}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        />

        {/* Emerald green rim light picking up the logo accent */}
        <pointLight position={[4, -2, 3]} intensity={0.8} color="#36be77" />

        {/* Soft fill light from the left */}
        <directionalLight
          position={[-4, 3, 2]}
          intensity={0.4}
          color="#e0e6ed"
        />

        <TurntableGroup>
          <TalentGetGoLogoModel scale={1.35} />
        </TurntableGroup>
      </Canvas>
    </CanvasErrorBoundary>
  );
}
