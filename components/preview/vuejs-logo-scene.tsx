"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { VuejsLogoModel } from "./vuejs-logo-model";
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

export function VuejsLogoScene() {
  return (
    <CanvasErrorBoundary
      fallback={
        <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-white">
          <p className="text-sm text-neutral-400">Vue.js 3D Model Preview</p>
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
        <ambientLight intensity={0.8} />

        {/* Key Light casting clean specular highlights */}
        <directionalLight
          position={[5, 6, 6]}
          intensity={2.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        />

        {/* Vue Emerald Green Accent Point Light */}
        <pointLight
          position={[-4, -2, 4]}
          intensity={1.8}
          color="#41b883"
          distance={15}
        />

        {/* Cool Rim Light */}
        <directionalLight
          position={[-4, 4, 3]}
          intensity={0.8}
          color="#e0e6ed"
        />

        <TurntableGroup>
          <VuejsLogoModel scale={1.2} />
        </TurntableGroup>
      </Canvas>
    </CanvasErrorBoundary>
  );
}
