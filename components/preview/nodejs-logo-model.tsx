"use client";

import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

/**
 * Three.js 3D procedural reconstruction of the Node.js logo (public/nodedotjs.svg).
 *
 * Technical Highlights:
 * 1. Uses client-side SVGLoader parsing to extract the authentic Node.js hexagonal
 *    shield paths from the official Simple Icons SVG.
 * 2. Applies rotation={[Math.PI, 0, 0]} to orient Y-down SVG paths upright in
 *    Three.js Y-up coordinate system.
 * 3. Node.js signature green (#339933) MeshPhysicalMaterial with emissive warmth
 *    and ultra-reflective clearcoat finish.
 */

const NODEJS_GREEN = "#339933";
const NODEJS_EMISSIVE = "#0d3d0d";

const EXTRUDE_SETTINGS: THREE.ExtrudeGeometryOptions = {
  depth: 14,
  bevelEnabled: true,
  bevelThickness: 1.5,
  bevelSize: 1.5,
  bevelSegments: 5,
  curveSegments: 32,
};

const NODEJS_SVG_STRING = `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Node.js</title><path d="M11.998,24c-0.321,0-0.641-0.084-0.922-0.247l-2.936-1.737c-0.438-0.245-0.224-0.332-0.08-0.383 c0.585-0.203,0.703-0.25,1.328-0.604c0.065-0.037,0.151-0.023,0.218,0.017l2.256,1.339c0.082,0.045,0.197,0.045,0.272,0l8.795-5.076 c0.082-0.047,0.134-0.141,0.134-0.238V6.921c0-0.099-0.053-0.192-0.137-0.242l-8.791-5.072c-0.081-0.047-0.189-0.047-0.271,0 L3.075,6.68C2.99,6.729,2.936,6.825,2.936,6.921v10.15c0,0.097,0.054,0.189,0.139,0.235l2.409,1.392 c1.307,0.654,2.108-0.116,2.108-0.89V7.787c0-0.142,0.114-0.253,0.256-0.253h1.115c0.139,0,0.255,0.112,0.255,0.253v10.021 c0,1.745-0.95,2.745-2.604,2.745c-0.508,0-0.909,0-2.026-0.551L2.28,18.675c-0.57-0.329-0.922-0.945-0.922-1.604V6.921 c0-0.659,0.353-1.275,0.922-1.603l8.795-5.082c0.557-0.315,1.296-0.315,1.848,0l8.794,5.082c0.57,0.329,0.924,0.944,0.924,1.603 v10.15c0,0.659-0.354,1.273-0.924,1.604l-8.794,5.078C12.643,23.916,12.324,24,11.998,24z M19.099,13.993 c0-1.9-1.284-2.406-3.987-2.763c-2.731-0.361-3.009-0.548-3.009-1.187c0-0.528,0.235-1.233,2.258-1.233 c1.807,0,2.473,0.389,2.747,1.607c0.024,0.115,0.129,0.199,0.247,0.199h1.141c0.071,0,0.138-0.031,0.186-0.081 c0.048-0.054,0.074-0.123,0.067-0.196c-0.177-2.098-1.571-3.076-4.388-3.076c-2.508,0-4.004,1.058-4.004,2.833 c0,1.925,1.488,2.457,3.895,2.695c2.88,0.282,3.103,0.703,3.103,1.269c0,0.983-0.789,1.402-2.642,1.402 c-2.327,0-2.839-0.584-3.011-1.742c-0.02-0.124-0.126-0.215-0.253-0.215h-1.137c-0.141,0-0.254,0.112-0.254,0.253 c0,1.482,0.806,3.248,4.655,3.248C17.501,17.007,19.099,15.91,19.099,13.993z"/></svg>`;

export function NodeJSLogoModel({ scale = 1 }: { scale?: number }) {
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
    if (typeof window === "undefined" || typeof DOMParser === "undefined") return;

    try {
      const loader = new SVGLoader();
      const svgData = loader.parse(NODEJS_SVG_STRING);
      const shapes: THREE.Shape[] = [];

      svgData.paths.forEach((path) => {
        const generated = SVGLoader.createShapes(path);
        shapes.push(...generated);
      });

      if (shapes.length > 0) {
        const geo = new THREE.ExtrudeGeometry(shapes, EXTRUDE_SETTINGS);
        geo.computeVertexNormals();
        geo.center();
        // Scale: Y negated to flip SVG Y-down → Y-up; Z positive for forward extrusion
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
          color={NODEJS_GREEN}
          roughness={0.15}
          metalness={0.25}
          emissive={NODEJS_EMISSIVE}
          emissiveIntensity={0.2}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          reflectivity={1.0}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
