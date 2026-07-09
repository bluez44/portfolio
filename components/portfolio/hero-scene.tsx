"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function ParticleField({
  accent,
  reducedMotion,
}: {
  accent: string;
  reducedMotion: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const isMobile = window.innerWidth < 700;
    const count = reducedMotion ? 250 : isMobile ? 350 : 700;
    const pos = new Float32Array(count * 3);
    /* eslint-disable react-hooks/purity -- Math.random here intentionally seeds a
       one-time decorative particle layout inside useMemo; re-randomizing on
       remount/reducedMotion change is expected, not a correctness concern. */
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 13;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    /* eslint-enable react-hooks/purity */
    return pos;
  }, [reducedMotion]);

  useFrame(() => {
    if (reducedMotion || !pointsRef.current) return;
    pointsRef.current.rotation.y += 0.00045;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={accent}
        size={0.075}
        transparent
        opacity={0.55}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

function HeroGrid({ accent }: { accent: string }) {
  const grid = useMemo(
    () => new THREE.GridHelper(40, 36, accent, accent),
    [accent],
  );

  useEffect(() => {
    /* eslint-disable react-hooks/immutability -- grid is a plain THREE.Object3D created
       once via useMemo, not React-managed state; configuring its material imperatively
       here is the idiomatic R3F pattern for three.js objects. */
    const material = grid.material as THREE.Material;
    material.transparent = true;
    material.opacity = 0.07;
    /* eslint-enable react-hooks/immutability */
  }, [grid]);

  return <primitive object={grid} position={[0, -4.2, 0]} />;
}

function HeroCameraRig({ reducedMotion }: { reducedMotion: boolean }) {
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (reducedMotion) return;
    const onPointerMove = (event: PointerEvent) => {
      pointer.current.x = event.clientX / window.innerWidth - 0.5;
      pointer.current.y = event.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [reducedMotion]);

  useFrame(({ camera }) => {
    if (reducedMotion) return;
    camera.position.x += (pointer.current.x * 0.9 - camera.position.x) * 0.03;
    camera.position.y +=
      (0.4 - pointer.current.y * 0.6 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

interface HeroSceneProps {
  accent: string;
  visible: boolean;
  reducedMotion: boolean;
}

export function HeroScene({ accent, visible, reducedMotion }: HeroSceneProps) {
  return (
    <Canvas
      style={{ position: "absolute", inset: 0 }}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      dpr={[1, 2]}
      camera={{ fov: 58, near: 0.1, far: 100, position: [0, 0.4, 9] }}
      frameloop={visible ? "always" : "never"}
    >
      <ParticleField accent={accent} reducedMotion={reducedMotion} />
      <HeroGrid accent={accent} />
      <HeroCameraRig reducedMotion={reducedMotion} />
    </Canvas>
  );
}
