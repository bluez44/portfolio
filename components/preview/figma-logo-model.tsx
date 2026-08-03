"use client";

import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

/**
 * Three.js 3D procedural reconstruction of the Figma logo (public/Figma-logo.svg).
 * 
 * Technical Highlights:
 * 1. 5-Part extruded 3D geometric shape assembly matching authentic Figma SVG paths.
 * 2. Iconic 5-color Figma palette: Red (#f24e1e), Coral (#ff7262), Purple (#a259ff),
 *    Cyan (#1abcfe), and Green (#0acf83).
 * 3. Uses positive geometry scaling combined with rotation={[Math.PI, 0, 0]} to orient 
 *    Y-down SVG paths upright into Three.js Y-up space without inverting face normals.
 * 4. High-vibrancy MeshStandardMaterial with smooth floating turntable animation.
 */

const FIGMA_COLORS = {
  red: "#f24e1e",
  coral: "#ff7262",
  purple: "#a259ff",
  cyan: "#1abcfe",
  green: "#0acf83",
};

const EXTRUDE_SETTINGS: THREE.ExtrudeGeometryOptions = {
  depth: 24,
  bevelEnabled: true,
  bevelThickness: 3.0,
  bevelSize: 3.0,
  bevelSegments: 5,
  curveSegments: 32,
};

const FIGMA_SVG_STRING = `<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" width="1667" height="2500">
  <path id="path0_fill" fill="#0acf83" d="M50 300c27.6 0 50-22.4 50-50v-50H50c-27.6 0-50 22.4-50 50s22.4 50 50 50z"/>
  <path id="path1_fill" fill="#a259ff" d="M0 150c0-27.6 22.4-50 50-50h50v100H50c-27.6 0-50-22.4-50-50z"/>
  <path id="path1_fill_1_" fill="#f24e1e" d="M0 50C0 22.4 22.4 0 50 0h50v100H50C22.4 100 0 77.6 0 50z"/>
  <path id="path2_fill" fill="#ff7262" d="M100 0h50c27.6 0 50 22.4 50 50s-22.4 50-50 50h-50V0z"/>
  <path id="path3_fill" fill="#1abcfe" d="M200 150c0 27.6-22.4 50-50 50s-50-22.4-50-50 22.4-50 50-50 50 22.4 50 50z"/>
</svg>`;

interface GeometriesState {
  green: THREE.BufferGeometry | null;
  purple: THREE.BufferGeometry | null;
  red: THREE.BufferGeometry | null;
  coral: THREE.BufferGeometry | null;
  cyan: THREE.BufferGeometry | null;
}

export function FigmaLogoModel({ scale = 1 }: { scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const [geos, setGeos] = useState<GeometriesState>({
    green: null,
    purple: null,
    red: null,
    coral: null,
    cyan: null,
  });

  // Smooth floating turntable motion
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.22;
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.05;
    }
  });

  // Client-side SVG path parsing for Figma 3D shapes
  useEffect(() => {
    if (typeof window === "undefined" || typeof DOMParser === "undefined") return;

    try {
      const loader = new SVGLoader();
      const svgData = loader.parse(FIGMA_SVG_STRING);

      if (svgData.paths.length >= 5) {
        const createGeo = (path: typeof svgData.paths[0]) => {
          const shapes = path.toShapes();
          if (shapes.length === 0) return null;
          const g = new THREE.ExtrudeGeometry(shapes, EXTRUDE_SETTINGS);
          g.computeVertexNormals();
          g.translate(-100, -150, 0); // Center relative to 200x300 viewBox
          g.scale(0.012, 0.012, 0.012); // Positive scale preserving face normal orientation
          return g;
        };

        setGeos({
          green: createGeo(svgData.paths[0]),
          purple: createGeo(svgData.paths[1]),
          red: createGeo(svgData.paths[2]),
          coral: createGeo(svgData.paths[3]),
          cyan: createGeo(svgData.paths[4]),
        });
      }
    } catch (err) {
      console.warn("SVGLoader parsing error for Figma logo:", err);
    }
  }, []);

  return (
    <group ref={groupRef} scale={scale}>
      {/* 180° X-axis rotation group to align Y-down SVG upright with forward Z-extrusion */}
      <group rotation={[Math.PI, 0, 0]}>
        {/* 1. Green Teardrop (Bottom-Left) */}
        {geos.green && (
          <mesh geometry={geos.green} castShadow receiveShadow>
            <meshStandardMaterial
              color={FIGMA_COLORS.green}
              roughness={0.1}
              metalness={0.1}
              emissive={FIGMA_COLORS.green}
              emissiveIntensity={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* 2. Purple Pill (Middle-Left) */}
        {geos.purple && (
          <mesh geometry={geos.purple} castShadow receiveShadow>
            <meshStandardMaterial
              color={FIGMA_COLORS.purple}
              roughness={0.1}
              metalness={0.1}
              emissive={FIGMA_COLORS.purple}
              emissiveIntensity={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* 3. Red Pill (Top-Left) */}
        {geos.red && (
          <mesh geometry={geos.red} castShadow receiveShadow>
            <meshStandardMaterial
              color={FIGMA_COLORS.red}
              roughness={0.1}
              metalness={0.1}
              emissive={FIGMA_COLORS.red}
              emissiveIntensity={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* 4. Coral Pill (Top-Right) */}
        {geos.coral && (
          <mesh geometry={geos.coral} castShadow receiveShadow>
            <meshStandardMaterial
              color={FIGMA_COLORS.coral}
              roughness={0.1}
              metalness={0.1}
              emissive={FIGMA_COLORS.coral}
              emissiveIntensity={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* 5. Cyan Circle (Middle-Right) */}
        {geos.cyan && (
          <mesh geometry={geos.cyan} castShadow receiveShadow>
            <meshStandardMaterial
              color={FIGMA_COLORS.cyan}
              roughness={0.1}
              metalness={0.1}
              emissive={FIGMA_COLORS.cyan}
              emissiveIntensity={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}
