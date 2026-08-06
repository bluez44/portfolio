"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { ReduxLogoModel } from "./redux-logo-model";
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

export function ReduxLogoScene() {
  return (
    <CanvasErrorBoundary
      fallback={
        <div className="flex h-full w-full items-center justify-center bg-[#f4f2fb] text-[#764abc]">
          <p className="text-sm font-medium">Redux 3D Model Preview</p>
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
        <color attach="background" args={["#f4f2fb"]} />

        <ambientLight intensity={0.9} color="#ffffff" />

        <directionalLight
          position={[5, 6, 6]}
          intensity={2.5}
          color="#ffffff"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        />

        <pointLight
          position={[2, 2, 5]}
          intensity={1.5}
          color="#a37ced"
          distance={15}
        />

        <directionalLight
          position={[-4, 4, 3]}
          intensity={1.2}
          color="#c8aeff"
        />

        <TurntableGroup>
          <ReduxLogoModel scale={1.1} />
        </TurntableGroup>
      </Canvas>
    </CanvasErrorBoundary>
  );
}
