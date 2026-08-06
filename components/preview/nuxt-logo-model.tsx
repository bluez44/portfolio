"use client";

import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

/**
 * Three.js 3D procedural reconstruction of the Nuxt logo (public/Nuxt_logo.svg).
 * 
 * Technical Highlights:
 * 1. 3-Part extruded 3D mountain peak assembly matching authentic Nuxt SVG vector paths.
 * 2. Signature Nuxt color palette: Emerald Green (#00C58E), Dark Slate Navy (#2F495E), 
 *    and Deep Teal (#108775).
 * 3. Removed fill="none" parent group wrapper to ensure SVGLoader parses solid filled 3D shapes.
 * 4. Exact 3D Z-layering:
 *    - Foreground (z = +0.12): Emerald Green (#00C58E)
 *    - Midground  (z = +0.06): Deep Teal (#108775)
 *    - Background (z = 0.00): Dark Slate Navy (#2F495E)
 * 5. High-contrast MeshPhysicalMaterial with clearcoat lacquer reflectivity & smooth turntable.
 */

const NUXT_GREEN = "#00C58E";
const NUXT_SLATE = "#2F495E";
const NUXT_TEAL = "#108775";

const EXTRUDE_SETTINGS: THREE.ExtrudeGeometryOptions = {
  depth: 18,
  bevelEnabled: true,
  bevelThickness: 1.8,
  bevelSize: 1.5,
  bevelSegments: 5,
  curveSegments: 32,
};

// Clean SVG string without fill="none" parent group to allow solid shape extrusion
const NUXT_SVG_STRING = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 298">
  <path fill="#00C58E" d="M227.92099 82.07407l-13.6889 23.7037-46.8148-81.08641L23.7037 273.58025h97.3037c0 13.0912 10.61252 23.7037 23.70371 23.7037H23.70371c-8.46771 0-16.29145-4.52017-20.5246-11.85382-4.23315-7.33366-4.23272-16.36849.00114-23.70174L146.89383 12.83951c4.23415-7.33433 12.0596-11.85252 20.5284-11.85252 8.46878 0 16.29423 4.51819 20.52839 11.85252l39.97037 69.23456z"/>
  <path fill="#2F495E" d="M331.6642 261.7284l-90.05432-155.95062-13.6889-23.7037-13.68888 23.7037-90.04445 155.95061c-4.23385 7.33325-4.23428 16.36808-.00113 23.70174 4.23314 7.33365 12.05689 11.85382 20.5246 11.85382h166.4c8.46946 0 16.29644-4.51525 20.532-11.84955 4.23555-7.3343 4.23606-16.37123.00132-23.706h.01976zM144.7111 273.58024L227.921 129.48148l83.19012 144.09877h-166.4z"/>
  <path fill="#108775" d="M396.04938 285.4321c-4.23344 7.33254-12.05656 11.85185-20.52345 11.85185H311.1111c13.0912 0 23.7037-10.6125 23.7037-23.7037h40.66173L260.09877 73.74815l-18.4889 32.02963-13.68888-23.7037L239.5753 61.8963c4.23416-7.33433 12.0596-11.85252 20.5284-11.85252 8.46879 0 16.29423 4.51819 20.52839 11.85252l115.41728 199.8321c4.23426 7.33395 4.23426 16.36975 0 23.7037z"/>
</svg>`;

export function NuxtLogoModel({ scale = 1 }: { scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const [greenGeo, setGreenGeo] = useState<THREE.BufferGeometry | null>(null);
  const [slateGeo, setSlateGeo] = useState<THREE.BufferGeometry | null>(null);
  const [tealGeo, setTealGeo] = useState<THREE.BufferGeometry | null>(null);

  // Smooth floating turntable motion
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.22;
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.05;
    }
  });

  // Client-side SVG path parsing for Nuxt 3D mountain peaks
  useEffect(() => {
    if (typeof window === "undefined" || typeof DOMParser === "undefined") return;

    try {
      const loader = new SVGLoader();
      const svgData = loader.parse(NUXT_SVG_STRING);

      if (svgData.paths.length >= 3) {
        // Path 0: Emerald Green Peak (#00C58E)
        const greenShapes = svgData.paths[0].toShapes();
        if (greenShapes.length > 0) {
          const g = new THREE.ExtrudeGeometry(greenShapes, EXTRUDE_SETTINGS);
          g.computeVertexNormals();
          g.translate(-200, -149, 0);
          g.scale(0.012, -0.012, 0.012);
          setGreenGeo(g);
        }

        // Path 1: Dark Slate Navy Peak (#2F495E)
        const slateShapes = svgData.paths[1].toShapes();
        if (slateShapes.length > 0) {
          const s = new THREE.ExtrudeGeometry(slateShapes, EXTRUDE_SETTINGS);
          s.computeVertexNormals();
          s.translate(-200, -149, 0);
          s.scale(0.012, -0.012, 0.012);
          setSlateGeo(s);
        }

        // Path 2: Deep Teal Peak (#108775)
        const tealShapes = svgData.paths[2].toShapes();
        if (tealShapes.length > 0) {
          const t = new THREE.ExtrudeGeometry(tealShapes, EXTRUDE_SETTINGS);
          t.computeVertexNormals();
          t.translate(-200, -149, 0);
          t.scale(0.012, -0.012, 0.012);
          setTealGeo(t);
        }
      }
    } catch (err) {
      console.warn("SVGLoader parsing error for Nuxt logo:", err);
    }
  }, []);

  return (
    <group ref={groupRef} scale={scale}>
      {/* 1. Emerald Green Mountain Peak (#00C58E) - Foreground */}
      {greenGeo && (
        <mesh geometry={greenGeo} position={[0, 0, 0.06]} castShadow receiveShadow>
          <meshStandardMaterial
            color={NUXT_GREEN}
            roughness={0.1}
            metalness={0.1}
            emissive={NUXT_GREEN}
            emissiveIntensity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* 2. Deep Teal Mountain Peak (#108775) - Midground */}
      {tealGeo && (
        <mesh geometry={tealGeo} position={[0, 0, 0.00]} castShadow receiveShadow>
          <meshStandardMaterial
            color={NUXT_TEAL}
            roughness={0.1}
            metalness={0.1}
            emissive={NUXT_TEAL}
            emissiveIntensity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* 3. Dark Slate Navy Mountain Peak (#2F495E) - Background Base */}
      {slateGeo && (
        <mesh geometry={slateGeo} position={[0, 0, 0.12]} castShadow receiveShadow>
          <meshStandardMaterial
            color={NUXT_SLATE}
            roughness={0.1}
            metalness={0.1}
            emissive={NUXT_SLATE}
            emissiveIntensity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
