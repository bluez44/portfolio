"use client";

import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

/**
 * Three.js 3D procedural reconstruction of the Redux logo (public/redux.svg).
 */

const REDUX_COLOR = "#764abc";
const REDUX_EMISSIVE = "#2d1b4e";

const REDUX_EXTRUDE_SETTINGS: THREE.ExtrudeGeometryOptions = {
  depth: 3.2,
  bevelEnabled: true,
  bevelThickness: 0.35,
  bevelSize: 0.35,
  bevelSegments: 5,
  curveSegments: 32,
};

const REDUX_SVG_STRING = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#764abc" d="M88.69 88.11c-9 18.4-24.76 30.78-45.61 34.85a39.73 39.73 0 0 1-9.77 1.14c-12 0-23-5-28.34-13.19C-2.2 100-4.64 76.87 19 59.76c.48 2.61 1.46 6.19 2.11 8.31A38.24 38.24 0 0 0 10 81.1c-4.4 8.64-3.91 17.27 1.3 25.25 3.6 5.38 9.3 8.65 16.63 9.65a44 44 0 0 0 26.55-5c12.71-6.68 21.18-14.66 26.72-25.57a9.32 9.32 0 0 1-2.61-6A9.12 9.12 0 0 1 87.37 70h.34a9.15 9.15 0 0 1 1 18.25zm28.67-20.2c12.21 13.84 12.54 30.13 7.82 39.58-4.4 8.63-16 17.27-31.6 17.27a50.48 50.48 0 0 1-21-5.05c2.29-1.63 5.54-4.24 7.33-5.87a41.54 41.54 0 0 0 16 3.42c10.1 0 17.75-4.72 22.31-13.35 2.93-5.7 3.1-12.38.33-19.22a43.61 43.61 0 0 0-17.27-20.85 62 62 0 0 0-34.74-10.59h-2.93a9.21 9.21 0 0 1-8 5.54h-.31a9.13 9.13 0 0 1-.3-18.25h.33a9 9 0 0 1 8 4.89h2.61c20.8 0 39.06 7.98 51.42 22.48zm-82.75 23a7.31 7.31 0 0 1 1.14-4.73c-9.12-15.8-14-35.83-6.51-56.68C34.61 13.83 48.13 3.24 62.79 3.24c15.64 0 31.93 13.69 33.88 40.07-2.44-.81-6-2-8.14-2.44-.53-8.63-7.82-30.13-25.09-29.81-6.19.17-15.31 3.1-20 9.12a43.69 43.69 0 0 0-9.64 25.25 59.61 59.61 0 0 0 8.47 36.16 2.75 2.75 0 0 1 1.14-.16h.32a9.121 9.121 0 0 1 .33 18.24h-.33a9.16 9.16 0 0 1-9.12-8.79z"/></svg>`;

export function ReduxLogoModel({ scale = 1 }: { scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const [logoGeometry, setLogoGeometry] = useState<THREE.BufferGeometry | null>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.22;
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.05;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof DOMParser === "undefined") return;

    try {
      const loader = new SVGLoader();
      const svgData = loader.parse(REDUX_SVG_STRING);
      const shapes: THREE.Shape[] = [];

      svgData.paths.forEach((path) => {
        const generated = path.toShapes(true);
        shapes.push(...generated);
      });

      if (shapes.length > 0) {
        const geo = new THREE.ExtrudeGeometry(shapes, REDUX_EXTRUDE_SETTINGS);
        geo.computeVertexNormals();

        // Translate center relative to 128x128 SVG viewbox
        geo.translate(-64, -64, 0);

        // Scale uniformly; do not scale negatively here to preserve winding order
        geo.scale(0.028, 0.028, 0.028);
        setLogoGeometry(geo);
      }
    } catch (err) {
      console.warn("SVGLoader parsing error for Redux logo:", err);
    }
  }, []);

  return (
    <group ref={groupRef} scale={scale}>
      {logoGeometry && (
        <mesh geometry={logoGeometry} scale={[1, -1, 1]} castShadow receiveShadow>
          <meshPhysicalMaterial
            color={REDUX_COLOR}
            roughness={0.15}
            metalness={0.15}
            emissive={REDUX_EMISSIVE}
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
