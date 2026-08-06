"use client";

import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

/**
 * Three.js 3D procedural reconstruction of the Tailwind CSS logo (public/tailwindcss.svg).
 *
 * Technical Highlights:
 * 1. Uses client-side SVGLoader to extrude the iconic twin-wave mark from the
 *    official Simple Icons Tailwind CSS SVG.
 * 2. Tailwind signature cyan (#06b6d4) MeshPhysicalMaterial with sky-blue emissive
 *    glow and premium clearcoat sheen.
 * 3. Smooth floating turntable animation with gentle oscillation.
 */

const TAILWIND_CYAN = "#06b6d4";
const TAILWIND_EMISSIVE = "#012f38";

const EXTRUDE_SETTINGS: THREE.ExtrudeGeometryOptions = {
  depth: 16,
  bevelEnabled: true,
  bevelThickness: 2.0,
  bevelSize: 2.0,
  bevelSegments: 5,
  curveSegments: 32,
};

const TAILWIND_SVG_STRING = `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Tailwind CSS</title><path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z"/></svg>`;

export function TailwindCSSLogoModel({ scale = 1 }: { scale?: number }) {
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
      const svgData = loader.parse(TAILWIND_SVG_STRING);
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
          color={TAILWIND_CYAN}
          roughness={0.12}
          metalness={0.2}
          emissive={TAILWIND_EMISSIVE}
          emissiveIntensity={0.25}
          clearcoat={1.0}
          clearcoatRoughness={0.04}
          reflectivity={1.0}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
