"use client";

import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

/**
 * Three.js 3D procedural reconstruction of the Expo logo (public/expo.svg).
 *
 * Technical Highlights:
 * 1. Uses client-side SVGLoader to extrude Expo's iconic A-frame mountain mark
 *    from the official Simple Icons SVG.
 * 2. Expo near-white (#000020 base with light surface) MeshPhysicalMaterial with
 *    subtle blue-white emissive and high-gloss clearcoat.
 * 3. Smooth floating animation with gentle Y-axis oscillation.
 */

const EXPO_WHITE = "#ffffff";
const EXPO_EMISSIVE = "#1a1a3e";

const EXTRUDE_SETTINGS: THREE.ExtrudeGeometryOptions = {
  depth: 18,
  bevelEnabled: true,
  bevelThickness: 2.0,
  bevelSize: 2.0,
  bevelSegments: 5,
  curveSegments: 32,
};

const EXPO_SVG_STRING = `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Expo</title><path d="M0 20.084c.043.53.23 1.063.718 1.778.58.849 1.576 1.315 2.303.567.49-.505 5.794-9.776 8.35-13.29a.761.761 0 011.248 0c2.556 3.514 7.86 12.785 8.35 13.29.727.748 1.723.282 2.303-.567.57-.835.728-1.42.728-2.046 0-.426-8.26-15.798-9.092-17.078-.8-1.23-1.044-1.498-2.397-1.542h-1.032c-1.353.044-1.597.311-2.398 1.542C8.267 3.991.33 18.758 0 19.77Z"/></svg>`;

export function ExpoLogoModel({ scale = 1 }: { scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  // Smooth floating turntable motion
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.22;
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.05;
    }
  });

  // Client-side SVG path parsing & extrusion
  useEffect(() => {
    if (typeof window === "undefined" || typeof DOMParser === "undefined")
      return;

    try {
      const loader = new SVGLoader();
      const svgData = loader.parse(EXPO_SVG_STRING);
      const shapes: THREE.Shape[] = [];

      svgData.paths.forEach((path) => {
        const generated = path.toShapes();
        shapes.push(...generated);
      });

      if (shapes.length > 0) {
        const geo = new THREE.ExtrudeGeometry(shapes, EXTRUDE_SETTINGS);
        geo.computeVertexNormals();
        geo.center();
        geo.scale(0.11, -0.11, 0.11);
        setGeometry(geo);
      }
    } catch (err) {
      console.warn("SVGLoader parsing error:", err);
    }
  }, []);

  if (!geometry) return null;

  return (
    <group ref={groupRef} scale={scale}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={EXPO_WHITE}
          roughness={0.1}
          metalness={0.15}
          emissive={EXPO_EMISSIVE}
          emissiveIntensity={0.08}
          clearcoat={1.0}
          clearcoatRoughness={0.03}
          reflectivity={1.0}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
