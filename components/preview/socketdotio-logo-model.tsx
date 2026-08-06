"use client";

import { useEffect, useState, useRef, JSX } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

/**
 * Three.js 3D procedural reconstruction of the Socket.IO logo (public/socketdotio.svg).
 */

const SOCKETDOTIO_EXTRUDE_SETTINGS: THREE.ExtrudeGeometryOptions = {
  depth: 0.8,
  bevelEnabled: true,
  bevelThickness: 0.15,
  bevelSize: 0.15,
  bevelSegments: 5,
  curveSegments: 32,
};

const SOCKETDOTIO_SVG_STRING = `<svg width="2500" height="2500" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet"><path d="M96.447 7.382c32.267-8.275 67.929-3.453 96.386 14.11 35.84 21.433 59.238 61.976 59.833 103.71 1.31 42.15-20.659 83.944-55.963 106.865-39.293 26.433-93.648 27.446-133.775 2.322-40.9-24.41-64.774-73.645-58.641-120.916 4.94-49.95 43.52-94.005 92.16-106.09z" fill="#010101"/><path d="M91.505 27.803c60.964-24.41 135.74 20.658 142.05 86.028 9.824 58.82-38.995 118.593-98.59 120.32-56.677 5.656-111.449-42.39-113.056-99.304-4.227-46.08 26.136-91.803 69.596-107.044z" fill="#FFF"/><path d="M97.637 121.69c27.327-22.326 54.058-45.426 81.98-67.097-14.646 22.505-29.708 44.711-44.354 67.215-12.562.06-25.123.06-37.626-.119zM120.737 134.132c12.621 0 25.183 0 37.745.179-27.505 22.206-54.117 45.484-82.099 67.096 14.646-22.505 29.708-44.77 44.354-67.275z" fill="#010101"/></svg>`;

export function SocketIOLogoModel({ scale = 1 }: { scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const [meshes, setMeshes] = useState<JSX.Element[]>([]);

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
      const svgData = loader.parse(SOCKETDOTIO_SVG_STRING);
      const generatedMeshes: JSX.Element[] = [];

      // Map SVG fills to rich Three.js colors
      const colorMap: Record<string, string> = {
        "#010101": "#121212", // Very dark grey/black
        "#fff": "#ffffff",
        "#ffffff": "#ffffff",
        "#FFF": "#ffffff",
      };

      const emissiveMap: Record<string, string> = {
        "#010101": "#000000",
        "#fff": "#e0e0e0",
        "#ffffff": "#e0e0e0",
        "#FFF": "#e0e0e0",
      };

      svgData.paths.forEach((path, index) => {
        const fill = path.userData.style.fill;

        if (fill !== undefined && fill !== 'none') {
          const mappedColor = colorMap[fill] || fill;
          const emissiveColor = emissiveMap[fill] || "#000000";

          // true enforces CCW for shapes and CW for holes
          const shapes = path.toShapes();
          
          if (shapes.length > 0) {
            const geo = new THREE.ExtrudeGeometry(shapes, SOCKETDOTIO_EXTRUDE_SETTINGS);
            geo.computeVertexNormals();

            // Translate center relative to 256x256 SVG viewbox
            geo.translate(-128, -128, 0);

            // Scale uniformly
            geo.scale(0.014, 0.014, 0.014);

            // Z-offset to prevent z-fighting in layered shapes
            const zOffset = (index * 0.02);
            geo.translate(0, 0, zOffset);

            generatedMeshes.push(
              <mesh key={index} geometry={geo} scale={[1, -1, 1]} castShadow receiveShadow>
                <meshPhysicalMaterial
                  color={mappedColor}
                  roughness={0.15}
                  metalness={mappedColor === "#ffffff" ? 0.1 : 0.3}
                  emissive={emissiveColor}
                  emissiveIntensity={mappedColor === "#ffffff" ? 0.2 : 0.0}
                  clearcoat={1.0}
                  clearcoatRoughness={0.1}
                  reflectivity={1.0}
                  side={THREE.DoubleSide}
                />
              </mesh>
            );
          }
        }
      });

      setMeshes(generatedMeshes);
    } catch (err) {
      console.warn("SVGLoader parsing error for Socket.IO logo:", err);
    }
  }, []);

  return (
    <group ref={groupRef} scale={scale}>
      {meshes}
    </group>
  );
}
