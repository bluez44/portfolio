"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { NuxtLogoModel } from "./nuxt-logo-model";
import { CanvasErrorBoundary } from "../portfolio/canvas-error-boundary";

function TurntableGroup({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y =
        Math.sin(state.clock.getElapsedTime() * 0.4) * 0.25;
      ref.current.rotation.x =
        Math.cos(state.clock.getElapsedTime() * 0.3) * 0.08;
    }
  });

  return <group ref={ref}>{children}</group>;
}

export function NuxtLogoScene() {
  return (
    <CanvasErrorBoundary
      fallback={
        <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-white">
          <p className="text-sm text-neutral-400">Nuxt 3D Model Preview</p>
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
        <color attach="background" args={["#090d16"]} />

        {/* Soft Ambient Light */}
        <ambientLight intensity={1.2} />

        {/* Directional Key Light */}
        <directionalLight
          position={[5, 6, 6]}
          intensity={2.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        />

        {/* Pure White Front Accent Point Light */}
        <pointLight
          position={[2, 2, 5]}
          intensity={1.5}
          color="#ffffff"
          distance={15}
        />

        {/* Cool Rim Light */}
        <directionalLight
          position={[-4, 4, 3]}
          intensity={1.0}
          color="#e0e6ed"
        />

        <TurntableGroup>
          <NuxtLogoModel scale={1.2} />
        </TurntableGroup>
      </Canvas>
    </CanvasErrorBoundary>
  );
}
