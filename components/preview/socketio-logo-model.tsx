"use client";

import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

/**
 * Three.js 3D procedural reconstruction of the Socket.io logo (public/socketdotio.svg).
 *
 * Technical Highlights:
 * 1. Uses client-side SVGLoader to extrude the Socket.io lightning-bolt circle mark
 *    from the official Simple Icons SVG.
 * 2. Socket.io near-white (#ffffff) MeshPhysicalMaterial with ultra-polish clearcoat
 *    on a dark background for maximum contrast and visual impact.
 * 3. Smooth floating turntable animation.
 */

const SOCKETIO_WHITE = "#ffffff";
const SOCKETIO_EMISSIVE = "#333333";

const EXTRUDE_SETTINGS: THREE.ExtrudeGeometryOptions = {
  depth: 14,
  bevelEnabled: true,
  bevelThickness: 1.5,
  bevelSize: 1.5,
  bevelSegments: 5,
  curveSegments: 48,
};

const SOCKETIO_SVG_STRING = `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Socket.io</title><path d="M11.9362.0137a12.1694 12.1694 0 00-2.9748.378C4.2816 1.5547.5678 5.7944.0918 10.6012c-.59 4.5488 1.7079 9.2856 5.6437 11.6345 3.8608 2.4179 9.0926 2.3199 12.8734-.223 3.3969-2.206 5.5118-6.2277 5.3858-10.2845-.058-4.0159-2.31-7.9167-5.7588-9.9796C16.354.5876 14.1431.0047 11.9362.0137zm-.063 1.696c4.9448-.007 9.7886 3.8137 10.2815 8.9245.945 5.6597-3.7528 11.4125-9.4875 11.5795-5.4538.544-10.7245-4.0798-10.8795-9.5566-.407-4.4338 2.5159-8.8346 6.6977-10.2995a9.1126 9.1126 0 013.3878-.647zm5.0908 3.2248c-2.6869 2.0849-5.2598 4.3078-7.8886 6.4567 1.2029.017 2.4118.016 3.6208.01 1.41-2.165 2.8589-4.3008 4.2678-6.4667zm-5.6647 7.6536c-1.41 2.166-2.86 4.3088-4.2699 6.4737 2.693-2.0799 5.2548-4.3198 7.9017-6.4557a255.4132 255.4132 0 00-3.6318-.018z"/></svg>`;

export function SocketIOLogoModel({ scale = 1 }: { scale?: number }) {
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
      const svgData = loader.parse(SOCKETIO_SVG_STRING);
      const shapes: THREE.Shape[] = [];

      svgData.paths.forEach((path) => {
        const generated = SVGLoader.createShapes(path);
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
          color={SOCKETIO_WHITE}
          roughness={0.1}
          metalness={0.1}
          emissive={SOCKETIO_EMISSIVE}
          emissiveIntensity={0.05}
          clearcoat={1.0}
          clearcoatRoughness={0.03}
          reflectivity={1.0}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
