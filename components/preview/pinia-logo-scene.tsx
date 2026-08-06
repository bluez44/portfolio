"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { PiniaLogoModel } from "./pinia-logo-model";
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

export function PiniaLogoScene() {
  return (
    <CanvasErrorBoundary
      fallback={
        <div className="flex h-full w-full items-center justify-center bg-[#fcfcfc] text-[#52ce63]">
          <p className="text-sm font-medium">Pinia 3D Model Preview</p>
        </div>
      }
    >
      <Canvas
        style={{ display: "block", width: "100%", height: "100%" }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
        shadows
        camera={{ fov: 35, near: 0.1, far: 100, position: [0, 0, 9] }}
      >
        <color attach="background" args={["#fcfcfc"]} />

        <ambientLight intensity={1.1} color="#ffffff" />

        <directionalLight
          position={[5, 6, 6]}
          intensity={2.5}
          color="#ffffff"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        />

        <pointLight
          position={[3, 3, 5]}
          intensity={1.2}
          color="#ffe56c"
          distance={15}
        />

        <directionalLight
          position={[-4, 4, 3]}
          intensity={1.0}
          color="#52ce63"
        />

        <TurntableGroup>
          <PiniaLogoModel scale={1.2} />
        </TurntableGroup>
      </Canvas>
    </CanvasErrorBoundary>
  );
}
