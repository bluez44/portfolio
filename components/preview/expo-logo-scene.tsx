"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { ExpoLogoModel } from "./expo-logo-model";
import { CanvasErrorBoundary } from "../portfolio/canvas-error-boundary";

function TurntableGroup({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.4) * 0.25;
      ref.current.rotation.x = Math.cos(state.clock.getElapsedTime() * 0.3) * 0.08;
    }
  });

  return <group ref={ref}>{children}</group>;
}

export function ExpoLogoScene() {
  return (
    <CanvasErrorBoundary
      fallback={
        <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-neutral-900">
          <p className="text-sm text-neutral-600">Expo 3D Model Preview</p>
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
        <color attach="background" args={["#f0f2f5"]} />

        <ambientLight intensity={0.8} />

        <directionalLight
          position={[5, 6, 6]}
          intensity={2.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        />

        <pointLight
          position={[2, 2, 5]}
          intensity={1.5}
          color="#ffffff"
          distance={15}
        />

        <directionalLight
          position={[-4, 4, 3]}
          intensity={0.8}
          color="#e0e6ed"
        />

        <TurntableGroup>
          <ExpoLogoModel scale={1.1} />
        </TurntableGroup>
      </Canvas>
    </CanvasErrorBoundary>
  );
}
