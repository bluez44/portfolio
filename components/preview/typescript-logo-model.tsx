"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

/**
 * Three.js 3D procedural reconstruction of the TypeScript logo (public/Typescript.svg).
 *
 * Technical Highlights:
 * 1. Extruded rounded square background badge in TypeScript signature blue (#3178c6).
 * 2. Pure brilliant white (#ffffff) embossed TS letterforms with non-metallic crisp finish.
 * 3. Exact positioning: "T" on left, "S" on right, situated at the bottom-right of the
 *    blue badge card in authentic TypeScript brand layout.
 * 4. Extrusion directed forward towards camera with DoubleSide MeshPhysicalMaterial.
 */

const TS_BLUE = "#3178c6";
const TS_BLUE_EMISSIVE = "#0a223d";
const TS_PURE_WHITE = "#ffffff";

const BADGE_EXTRUDE_SETTINGS: THREE.ExtrudeGeometryOptions = {
  depth: 24,
  bevelEnabled: true,
  bevelThickness: 3.0,
  bevelSize: 3.0,
  bevelSegments: 5,
  curveSegments: 32,
};

const LETTERS_EXTRUDE_SETTINGS: THREE.ExtrudeGeometryOptions = {
  depth: 14,
  bevelEnabled: true,
  bevelThickness: 1.8,
  bevelSize: 1.8,
  bevelSegments: 4,
  curveSegments: 32,
};

// Clean absolute SVG paths for T and S letterforms in 512x512 canvas coordinates
const TS_ABSOLUTE_SVG_STRING = `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <path fill="#fff" d="M148.621 242.999h179v41.082h-63.906v182.918h-50.874v-182.918h-64.22z"/>
  <path fill="#fff" d="M316.939 407.424v50.061c8.138 4.172 17.763 7.3 28.875 9.386s22.823 3.129 35.135 3.129c11.999 0 23.397-1.147 34.196-3.442 10.799-2.294 20.268-6.075 28.406-11.342 8.138-5.266 14.581-12.15 19.328-20.65s7.121-19.007 7.121-31.522c0-9.074-1.356-17.026-4.069-23.857s-6.625-12.906-11.738-18.225c-5.112-5.319-11.242-10.091-18.389-14.315s-15.207-8.213-24.18-11.967c-6.573-2.712-12.468-5.345-17.685-7.9-5.217-2.556-9.651-5.163-13.303-7.822-3.652-2.66-6.469-5.476-8.451-8.448-1.982-2.973-2.974-6.336-2.974-10.091 0-3.441.887-6.544 2.661-9.308s4.278-5.136 7.512-7.118c3.235-1.981 7.199-3.52 11.894-4.615 4.696-1.095 9.912-1.642 15.651-1.642 4.173 0 8.581.313 13.224.938 4.643.626 9.312 1.591 14.008 2.894 4.695 1.304 9.259 2.947 13.694 4.928 4.434 1.982 8.529 4.276 12.285 6.884v-46.776c-7.616-2.92-15.937-5.084-24.962-6.492s-19.381-2.112-31.066-2.112c-11.895 0-23.163 1.278-33.805 3.833s-20.006 6.544-28.093 11.967c-8.086 5.424-14.476 12.333-19.171 20.729-4.695 8.395-7.043 18.433-7.043 30.114 0 14.914 4.304 27.638 12.912 38.172 8.607 10.533 21.675 19.45 39.204 26.751 6.886 2.816 13.303 5.579 19.25 8.291s11.086 5.528 15.415 8.448c4.33 2.92 7.747 6.101 10.252 9.543 2.504 3.441 3.756 7.352 3.756 11.733 0 3.233-.783 6.231-2.348 8.995s-3.939 5.162-7.121 7.196-7.147 3.624-11.894 4.771c-4.748 1.148-10.303 1.721-16.668 1.721-10.851 0-21.597-1.903-32.24-5.71-10.642-3.806-20.502-9.516-29.579-17.13z"/>
</svg>`;

export function TypeScriptLogoModel({ scale = 1 }: { scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const [lettersGeometry, setLettersGeometry] =
    useState<THREE.BufferGeometry | null>(null);

  // Smooth floating turntable motion
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.22;
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.05;
    }
  });

  // Base Badge Geometry (512x512 with rx=50 rounded corners)
  const badgeGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const w = 512;
    const h = 512;
    const rx = 50;

    shape.moveTo(-w / 2 + rx, -h / 2);
    shape.lineTo(w / 2 - rx, -h / 2);
    shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + rx);
    shape.lineTo(w / 2, h / 2 - rx);
    shape.quadraticCurveTo(w / 2, h / 2, w / 2 - rx, h / 2);
    shape.lineTo(-w / 2 + rx, h / 2);
    shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - rx);
    shape.lineTo(-w / 2, -h / 2 + rx);
    shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + rx, -h / 2);

    const geo = new THREE.ExtrudeGeometry(shape, BADGE_EXTRUDE_SETTINGS);
    geo.computeVertexNormals();
    geo.scale(0.006, 0.006, 0.006);
    return geo;
  }, []);

  // Client-side SVG path parsing for white TS letterforms
  useEffect(() => {
    if (typeof window === "undefined" || typeof DOMParser === "undefined")
      return;

    try {
      const loader = new SVGLoader();
      const svgData = loader.parse(TS_ABSOLUTE_SVG_STRING);
      const shapes: THREE.Shape[] = [];

      svgData.paths.forEach((path) => {
        const generated = path.toShapes();
        shapes.push(...generated);
      });

      if (shapes.length > 0) {
        const geo = new THREE.ExtrudeGeometry(shapes, LETTERS_EXTRUDE_SETTINGS);
        geo.computeVertexNormals();

        // Center relative to 512x512 SVG canvas
        geo.translate(-256, -256, 0);
        // Scale: X is positive (+0.006), Y is negative (-0.006) to flip SVG Y-down to Y-up upright,
        // Z is positive (+0.006) so extrusion points forward out of the badge
        geo.scale(0.006, -0.006, 0.006);
        setLettersGeometry(geo);
      }
    } catch (err) {
      console.warn("SVGLoader parsing error:", err);
    }
  }, []);

  return (
    <group ref={groupRef} scale={scale}>
      {/* 3D Blue Background Badge */}
      <mesh geometry={badgeGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={TS_BLUE}
          roughness={0.18}
          metalness={0.2}
          emissive={TS_BLUE_EMISSIVE}
          emissiveIntensity={0.12}
          clearcoat={0.95}
          clearcoatRoughness={0.05}
          reflectivity={1.0}
        />
      </mesh>

      {/* Pure White TS Letterforms Mounted Proudly on Front Surface */}
      {lettersGeometry && (
        <mesh
          geometry={lettersGeometry}
          position={[0, 0, 0.17]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={TS_PURE_WHITE}
            roughness={0.05}
            metalness={0.0}
            emissive={TS_PURE_WHITE}
            emissiveIntensity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
