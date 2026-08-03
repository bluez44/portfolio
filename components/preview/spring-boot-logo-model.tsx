"use client";

import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

/**
 * Three.js 3D procedural reconstruction of the Spring Boot logo (public/Spring_Boot.svg).
 * 
 * Technical Highlights:
 * 1. Client-side SVGLoader parsing of Spring_Boot.svg vector paths.
 * 2. Positive scale factors (0.032, 0.032, 0.032) combined with 180° X-axis rotation (rotation={[Math.PI, 0, 0]})
 *    to align Y-down SVG coordinates into Three.js Y-up frame without horizontal mirroring.
 * 3. Spring leaf green (#6db33f) MeshPhysicalMaterial with DoubleSide rendering, emissive warmth (#1b3b0c),
 *    and clearcoat lacquer finish.
 */

const SPRING_GREEN = "#6db33f";
const SPRING_EMISSIVE = "#1b3b0c";

const EXTRUDE_SETTINGS: THREE.ExtrudeGeometryOptions = {
  depth: 14,
  bevelEnabled: true,
  bevelThickness: 2.0,
  bevelSize: 2.0,
  bevelSegments: 5,
  curveSegments: 32,
};

const SPRING_BOOT_SVG_STRING = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 97.1 97"><path fill="#6db33f" d="M88.4,5.6a42.32,42.32,0,0,1-5.2,9.1A48.46,48.46,0,1,0,15.5,84l1.8,1.6A48.41,48.41,0,0,0,96.8,52C98.2,39.8,94.5,24.2,88.4,5.6ZM22.5,84.4a4.12,4.12,0,1,1-.6-5.8A4.21,4.21,0,0,1,22.5,84.4ZM88.1,69.9C76.2,85.8,50.6,80.4,34.3,81.2c0,0-2.9.2-5.8.6,0,0,1.1-.5,2.5-1,11.5-4,16.9-4.8,23.9-8.4C68,65.7,81.1,51,83.7,35.8c-5,14.6-20.2,27.2-34,32.3C40.2,71.6,23.1,75,23.1,75l-.7-.4c-11.6-5.7-12-30.9,9.2-39,9.3-3.6,18.1-1.6,28.2-4,10.7-2.5,23.1-10.5,28.1-21C93.5,27.5,100.3,53.7,88.1,69.9Z"/></svg>`;

export function SpringBootLogoModel({ scale = 1 }: { scale?: number }) {
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
      const svgData = loader.parse(SPRING_BOOT_SVG_STRING);
      const shapes: THREE.Shape[] = [];

      svgData.paths.forEach((path) => {
        const generated = SVGLoader.createShapes(path);
        shapes.push(...generated);
      });

      if (shapes.length > 0) {
        const geo = new THREE.ExtrudeGeometry(shapes, EXTRUDE_SETTINGS);
        geo.computeVertexNormals();
        geo.center(); // Center on bounding box
        geo.scale(0.032, 0.032, 0.032); // Normalize scale
        setGeometry(geo);
      }
    } catch (err) {
      console.warn("SVGLoader parsing error:", err);
    }
  }, []);

  if (!geometry) return null;

  return (
    <group ref={groupRef} scale={scale} rotation={[Math.PI, 0, 0]}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={SPRING_GREEN}
          roughness={0.18}
          metalness={0.25}
          emissive={SPRING_EMISSIVE}
          emissiveIntensity={0.2}
          clearcoat={0.95}
          clearcoatRoughness={0.05}
          reflectivity={1.0}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
