"use client";

import { Canvas } from "@react-three/fiber";
import { TmaLogoModel } from "./tma-logo-model";

export function TmaLogoScene() {
  return (
    <Canvas
      style={{ display: "block", width: "100%", height: "100%" }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      shadows
      camera={{ fov: 32, near: 0.1, far: 100, position: [0, 0, 9] }}
    >
      <color attach="background" args={["#0b0f14"]} />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[3, 4, 5]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-4, -2, 3]} intensity={0.4} color="#8fd3ff" />
      <TmaLogoModel scale={1.5} />
    </Canvas>
  );
}
