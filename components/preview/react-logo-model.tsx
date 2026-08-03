"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/**
 * Three.js 3D procedural reconstruction of the React logo (public/React-icon.svg).
 * 
 * Features:
 * 1. Authentic proportions matching SVG: central nucleus sphere (r = 2.05) and 
 *    three 3D elliptical orbital rings (rx = 11, ry = 4.2, tubeRadius = 0.45).
 * 2. 60° and 120° orbital rotations around the Z-axis.
 * 3. React cyan (#61dafb) MeshPhysicalMaterial with electric emissive glow (#145a75)
 *    and clearcoat lacquer finish.
 * 4. Gyroscopic 3D orbital animation.
 */

const REACT_CYAN = "#61dafb";
const REACT_EMISSIVE = "#145a75";

class EllipseCurve3D extends THREE.Curve<THREE.Vector3> {
  aX: number;
  aY: number;

  constructor(aX = 11, aY = 4.2) {
    super();
    this.aX = aX;
    this.aY = aY;
  }

  getPoint(t: number, optionalTarget = new THREE.Vector3()) {
    const angle = t * Math.PI * 2;
    return optionalTarget.set(this.aX * Math.cos(angle), this.aY * Math.sin(angle), 0);
  }
}

export function ReactLogoModel({ scale = 1 }: { scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Group>(null);
  const ring2Ref = useRef<THREE.Group>(null);
  const ring3Ref = useRef<THREE.Group>(null);

  // Nucleus Sphere Geometry
  const nucleusGeometry = useMemo(() => {
    return new THREE.SphereGeometry(2.05, 32, 32);
  }, []);

  // Orbital Ring Geometry
  const ringGeometry = useMemo(() => {
    const curve = new EllipseCurve3D(11, 4.2);
    const geo = new THREE.TubeGeometry(curve, 128, 0.45, 16, true);
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Shared React Cyan Material
  const material = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: REACT_CYAN,
      roughness: 0.15,
      metalness: 0.3,
      emissive: REACT_EMISSIVE,
      emissiveIntensity: 0.3,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 1.0,
    });
  }, []);

  // Gyroscopic 3D animation
  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.2;
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.1;
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = Math.sin(t * 0.5) * 0.05;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = Math.PI / 3 + Math.sin(t * 0.5 + 1) * 0.05;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = (2 * Math.PI) / 3 + Math.sin(t * 0.5 + 2) * 0.05;
    }
  });

  return (
    <group ref={groupRef} scale={scale * 0.12}>
      {/* Central Nucleus Atom */}
      <mesh geometry={nucleusGeometry} material={material} castShadow receiveShadow />

      {/* Orbital Ring 1 (Horizontal, 0°) */}
      <group ref={ring1Ref}>
        <mesh geometry={ringGeometry} material={material} castShadow receiveShadow />
      </group>

      {/* Orbital Ring 2 (Rotated 60°) */}
      <group ref={ring2Ref} rotation={[0, 0, Math.PI / 3]}>
        <mesh geometry={ringGeometry} material={material} castShadow receiveShadow />
      </group>

      {/* Orbital Ring 3 (Rotated 120°) */}
      <group ref={ring3Ref} rotation={[0, 0, (2 * Math.PI) / 3]}>
        <mesh geometry={ringGeometry} material={material} castShadow receiveShadow />
      </group>
    </group>
  );
}
