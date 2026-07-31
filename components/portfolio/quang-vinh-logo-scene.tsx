"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { QuangVinhLogoModel } from "./quang-vinh-logo-model";

function TurntableGroup({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);

  // Slow, smooth auto-rotation
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.25;
      ref.current.rotation.x = Math.cos(state.clock.getElapsedTime() * 0.3) * 0.08;
    }
  });

  return <group ref={ref}>{children}</group>;
}

export function QuangVinhLogoScene() {
  return (
    <Canvas
      style={{ display: "block", width: "100%", height: "100%" }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      shadows
      camera={{ fov: 30, near: 0.1, far: 100, position: [0, 0, 8.5] }}
    >
      {/* Sleek, premium dark slate background */}
      <color attach="background" args={["#070a0e"]} />
      
      <ambientLight intensity={0.65} />
      
      {/* Key Light casting premium shadows and specular glints */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />
      
      {/* Subtle blue rim light to pick up metallic edges */}
      <pointLight position={[-4, -2, 3]} intensity={0.8} color="#90d5ff" />
      
      {/* Soft warm fill light from the side */}
      <directionalLight position={[-4, 2, -2]} intensity={0.4} color="#ffe8d6" />

      <TurntableGroup>
        <QuangVinhLogoModel scale={1.8} />
      </TurntableGroup>
    </Canvas>
  );
}
