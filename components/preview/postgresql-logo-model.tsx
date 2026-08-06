"use client";

import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

/**
 * Three.js 3D procedural reconstruction of the PostgreSQL Elephant logo (public/Postgresql_elephant.svg).
 * 
 * Technical Highlights:
 * 1. Multi-layered extruded 3D Slavik the Elephant mascot assembly.
 * 2. Signature PostgreSQL color palette: Steel Blue (#336791), Charcoal Black frame (#0a0f14),
 *    and Pure White accent highlights (#ffffff).
 * 3. Exact 3D Z-layering:
 *    - Background Frame (z = 0.00): Charcoal Black outline border frame
 *    - Main Body        (z = +0.06): PostgreSQL Steel Blue (#336791)
 *    - Accent Details   (z = +0.12): Pure White contour linework
 *    - Eye Highlights   (z = +0.14): Pure White eye ovals
 * 4. High-vibrancy MeshStandardMaterial with smooth floating turntable animation.
 */

const PG_BLUE = "#336791";
const PG_BLACK = "#0a0f14";
const PG_WHITE = "#ffffff";

const EXTRUDE_BODY: THREE.ExtrudeGeometryOptions = {
  depth: 24,
  bevelEnabled: true,
  bevelThickness: 2.5,
  bevelSize: 2.0,
  bevelSegments: 5,
  curveSegments: 32,
};

const EXTRUDE_FRAME: THREE.ExtrudeGeometryOptions = {
  depth: 28,
  bevelEnabled: true,
  bevelThickness: 3.0,
  bevelSize: 2.5,
  bevelSegments: 5,
  curveSegments: 32,
};

const EXTRUDE_ACCENT: THREE.ExtrudeGeometryOptions = {
  depth: 10,
  bevelEnabled: true,
  bevelThickness: 1.0,
  bevelSize: 0.8,
  bevelSegments: 5,
  curveSegments: 32,
};

const PG_SVG_STRING = `<svg viewBox="0 0 432.071 445.383" xmlns="http://www.w3.org/2000/svg">
  <g fill-rule="nonzero">
    <path fill="#0a0f14" d="M323.205,324.227c2.833-23.601,1.984-27.062,19.563-23.239l4.463,0.392c13.517,0.615,31.199-2.174,41.587-7c22.362-10.376,35.622-27.7,13.572-23.148c-50.297,10.376-53.755-6.655-53.755-6.655c53.111-78.803,75.313-178.836,56.149-203.322 C352.514-5.534,262.036,26.049,260.522,26.869l-0.482,0.089c-9.938-2.062-21.06-3.294-33.554-3.496c-22.761-0.374-40.032,5.967-53.133,15.904c0,0-161.408-66.498-153.899,83.628c1.597,31.936,45.777,241.655,98.47,178.31 c19.259-23.163,37.871-42.748,37.871-42.748c9.242,6.14,20.307,9.272,31.912,8.147l0.897-0.765c-0.281,2.876-0.157,5.689,0.359,9.019c-13.572,15.167-9.584,17.83-36.723,23.416c-27.457,5.659-11.326,15.734-0.797,18.367c12.768,3.193,42.305,7.716,62.268-20.224 l-0.795,3.188c5.325,4.26,4.965,30.619,5.72,49.452c0.756,18.834,2.017,36.409,5.856,46.771c3.839,10.36,8.369,37.05,44.036,29.406c29.809-6.388,52.6-15.582,54.677-101.107"/>
    <path fill="#336791" d="M402.395,271.23c-50.302,10.376-53.76-6.655-53.76-6.655c53.111-78.808,75.313-178.843,56.153-203.326c-52.27-66.785-142.752-35.2-144.262-34.38l-0.486,0.087c-9.938-2.063-21.06-3.292-33.56-3.496c-22.761-0.373-40.026,5.967-53.127,15.902 c0,0-161.411-66.495-153.904,83.63c1.597,31.938,45.776,241.657,98.471,178.312c19.26-23.163,37.869-42.748,37.869-42.748c9.243,6.14,20.308,9.272,31.908,8.147l0.901-0.765c-0.28,2.876-0.152,5.689,0.361,9.019c-13.575,15.167-9.586,17.83-36.723,23.416 c-27.459,5.659-11.328,15.734-0.796,18.367c12.768,3.193,42.307,7.716,62.266-20.224l-0.796,3.188c5.319,4.26,9.054,27.711,8.428,48.969c-0.626,21.259-1.044,35.854,3.147,47.254c4.191,11.4,8.368,37.05,44.042,29.406c29.809-6.388,45.256-22.942,47.405-50.555 c1.525-19.631,4.976-16.729,5.194-34.28l2.768-8.309c3.192-26.611,0.507-35.196,18.872-31.203l4.463,0.392c13.517,0.615,31.208-2.174,41.591-7c22.358-10.376,35.618-27.7,13.573-23.148z"/>
    <path fill="#ffffff" d="M172.517,141.7c-0.288,2.039,3.733,7.48,8.976,8.207c5.234,0.73,9.714-3.522,9.998-5.559c0.284-2.039-3.732-4.285-8.977-5.015c-5.237-0.731-9.719,0.333-9.996,2.367z"/>
    <path fill="#ffffff" d="M331.941,137.543c0.284,2.039-3.732,7.48-8.976,8.207c-5.238,0.73-9.718-3.522-10.005-5.559c-0.277-2.039,3.74-4.285,8.979-5.015c5.239-0.73,9.718,0.333,10.002,2.368z"/>
  </g>
</svg>`;

export function PostgresqlLogoModel({ scale = 1 }: { scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const [frameGeo, setFrameGeo] = useState<THREE.BufferGeometry | null>(null);
  const [bodyGeo, setBodyGeo] = useState<THREE.BufferGeometry | null>(null);
  const [eyeLGeo, setEyeLGeo] = useState<THREE.BufferGeometry | null>(null);
  const [eyeRGeo, setEyeRGeo] = useState<THREE.BufferGeometry | null>(null);

  // Smooth floating turntable motion
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.22;
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.05;
    }
  });

  // Client-side SVG path parsing for PostgreSQL 3D elephant mascot
  useEffect(() => {
    if (typeof window === "undefined" || typeof DOMParser === "undefined") return;

    try {
      const loader = new SVGLoader();
      const svgData = loader.parse(PG_SVG_STRING);

      if (svgData.paths.length >= 4) {
        // Path 0: Charcoal Black Outline Border Frame
        const frameShapes = svgData.paths[0].toShapes();
        if (frameShapes.length > 0) {
          const fg = new THREE.ExtrudeGeometry(frameShapes, EXTRUDE_FRAME);
          fg.computeVertexNormals();
          fg.translate(-216, -222, 0);
          fg.scale(0.0075, -0.0075, 0.0075);
          setFrameGeo(fg);
        }

        // Path 1: PostgreSQL Signature Steel Blue Body (#336791)
        const bodyShapes = svgData.paths[1].toShapes();
        if (bodyShapes.length > 0) {
          const bg = new THREE.ExtrudeGeometry(bodyShapes, EXTRUDE_BODY);
          bg.computeVertexNormals();
          bg.translate(-216, -222, 0);
          bg.scale(0.0075, -0.0075, 0.0075);
          setBodyGeo(bg);
        }

        // Path 2: Left Eye Oval Highlight (#ffffff)
        const eyeLShapes = svgData.paths[2].toShapes();
        if (eyeLShapes.length > 0) {
          const elg = new THREE.ExtrudeGeometry(eyeLShapes, EXTRUDE_ACCENT);
          elg.computeVertexNormals();
          elg.translate(-216, -222, 0);
          elg.scale(0.0075, -0.0075, 0.0075);
          setEyeLGeo(elg);
        }

        // Path 3: Right Eye Oval Highlight (#ffffff)
        const eyeRShapes = svgData.paths[3].toShapes();
        if (eyeRShapes.length > 0) {
          const erg = new THREE.ExtrudeGeometry(eyeRShapes, EXTRUDE_ACCENT);
          erg.computeVertexNormals();
          erg.translate(-216, -222, 0);
          erg.scale(0.0075, -0.0075, 0.0075);
          setEyeRGeo(erg);
        }
      }
    } catch (err) {
      console.warn("SVGLoader parsing error for PostgreSQL logo:", err);
    }
  }, []);

  return (
    <group ref={groupRef} scale={scale}>
      {/* 1. Charcoal Black Border Frame (Background z = 0.00) */}
      {frameGeo && (
        <mesh geometry={frameGeo} position={[0, 0, 0.0]} castShadow receiveShadow>
          <meshStandardMaterial
            color={PG_BLACK}
            roughness={0.2}
            metalness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* 2. PostgreSQL Steel Blue Elephant Body (Midground z = +0.06) */}
      {bodyGeo && (
        <mesh geometry={bodyGeo} position={[0, 0, 0.06]} castShadow receiveShadow>
          <meshStandardMaterial
            color={PG_BLUE}
            roughness={0.15}
            metalness={0.2}
            emissive={PG_BLUE}
            emissiveIntensity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* 3. Pure White Left Eye Highlight (Foreground z = +0.14) */}
      {eyeLGeo && (
        <mesh geometry={eyeLGeo} position={[0, 0, 0.14]} castShadow receiveShadow>
          <meshStandardMaterial
            color={PG_WHITE}
            roughness={0.05}
            metalness={0.0}
            emissive={PG_WHITE}
            emissiveIntensity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* 4. Pure White Right Eye Highlight (Foreground z = +0.14) */}
      {eyeRGeo && (
        <mesh geometry={eyeRGeo} position={[0, 0, 0.14]} castShadow receiveShadow>
          <meshStandardMaterial
            color={PG_WHITE}
            roughness={0.05}
            metalness={0.0}
            emissive={PG_WHITE}
            emissiveIntensity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
