"use client";

import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

/**
 * Three.js 3D procedural reconstruction of the Tailwind CSS logo (public/tailwindcss.svg).
 */

const TAILWINDCSS_COLOR = "#38bdf8";
const TAILWINDCSS_EMISSIVE = "#1c5e7c";

const TAILWINDCSS_EXTRUDE_SETTINGS: THREE.ExtrudeGeometryOptions = {
  depth: 1.35,
  bevelEnabled: true,
  bevelThickness: 0.15,
  bevelSize: 0.15,
  bevelSegments: 5,
  curveSegments: 32,
};

const TAILWINDCSS_SVG_STRING = `<svg xmlns="http://www.w3.org/2000/svg" fill="${TAILWINDCSS_COLOR}" viewBox="0 0 54 33"><path fill="#38bdf8" fill-rule="evenodd" d="M27 0c-7.2 0-11.7 3.6-13.5 10.8 2.7-3.6 5.85-4.95 9.45-4.05 2.054.513 3.522 2.004 5.147 3.653C30.744 13.09 33.808 16.2 40.5 16.2c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C36.756 3.11 33.692 0 27 0zM13.5 16.2C6.3 16.2 1.8 19.8 0 27c2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C17.244 29.29 20.308 32.4 27 32.4c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C23.256 19.31 20.192 16.2 13.5 16.2z" clip-rule="evenodd"/></svg>`;

export function TailwindCSSLogoModel({ scale = 1 }: { scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const [logoGeometry, setLogoGeometry] = useState<THREE.BufferGeometry | null>(
    null,
  );

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.22;
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.05;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof DOMParser === "undefined")
      return;

    try {
      const loader = new SVGLoader();
      const svgData = loader.parse(TAILWINDCSS_SVG_STRING);
      const shapes: THREE.Shape[] = [];

      svgData.paths.forEach((path) => {
        const generated = path.toShapes();
        shapes.push(...generated);
      });

      if (shapes.length > 0) {
        const geo = new THREE.ExtrudeGeometry(
          shapes,
          TAILWINDCSS_EXTRUDE_SETTINGS,
        );
        geo.computeVertexNormals();

        // Translate center relative to 54x33 SVG viewbox
        geo.translate(-27, -16.5, 0);

        // Scale uniformly; do not scale negatively here to preserve winding order
        geo.scale(0.065, 0.065, 0.065);
        setLogoGeometry(geo);
      }
    } catch (err) {
      console.warn("SVGLoader parsing error for Tailwind CSS logo:", err);
    }
  }, []);

  return (
    <group ref={groupRef} scale={scale}>
      {logoGeometry && (
        <mesh geometry={logoGeometry} scale={[1, -1, 1]} castShadow receiveShadow>
          <meshPhysicalMaterial
            color={TAILWINDCSS_COLOR}
            roughness={0.15}
            metalness={0.15}
            emissive={TAILWINDCSS_EMISSIVE}
            emissiveIntensity={0.2}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            reflectivity={1.0}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
