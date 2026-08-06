"use client";

import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

/**
 * Three.js 3D procedural reconstruction of the JavaScript logo.
 * Preserves exact paths, colors, and proportions from the original SVG.
 */

const JS_SVG_STRING = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 630 630">
<rect width="630" height="630" fill="#f7df1e"/>
<path d="m423.2 492.19c12.69 20.72 29.2 35.95 58.4 35.95 24.53 0 40.2-12.26 40.2-29.2 0-20.3-16.1-27.49-43.1-39.3l-14.8-6.35c-42.72-18.2-71.1-41-71.1-89.2 0-44.4 33.83-78.2 86.7-78.2 37.64 0 64.7 13.1 84.2 47.4l-46.1 29.6c-10.15-18.2-21.1-25.37-38.1-25.37-17.34 0-28.33 11-28.33 25.37 0 17.76 11 24.95 36.4 35.95l14.8 6.34c50.3 21.57 78.7 43.56 78.7 93 0 53.3-41.87 82.5-98.1 82.5-54.98 0-90.5-26.2-107.88-60.54zm-209.13 5.13c9.3 16.5 17.76 30.45 38.1 30.45 19.45 0 31.72-7.61 31.72-37.2v-201.3h59.2v202.1c0 61.3-35.94 89.2-88.4 89.2-47.4 0-74.85-24.53-88.81-54.075z"/>
</svg>`;

const EXTRUDE_SETTINGS: THREE.ExtrudeGeometryOptions = {
  depth: 30,
  bevelEnabled: true,
  bevelThickness: 3,
  bevelSize: 2,
  bevelSegments: 4,
  curveSegments: 24,
};

type SubMesh = {
  geometry: THREE.BufferGeometry;
  color: string;
};

export function JavascriptLogoModel({ scale = 1 }: { scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const [meshes, setMeshes] = useState<SubMesh[]>([]);
  const [groupOffset, setGroupOffset] = useState<THREE.Vector3>(
    new THREE.Vector3(0, 0, 0),
  );

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.22;
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.2;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof DOMParser === "undefined")
      return;

    try {
      const loader = new SVGLoader();
      const svgData = loader.parse(JS_SVG_STRING);
      const subMeshes: SubMesh[] = [];

      svgData.paths.forEach((path) => {
        // If a path has no fill style specified, it defaults to black
        const color =
          ((path.userData?.style as { fill: string })?.fill as string) ||
          "#000000";
        const shapes = path.toShapes();

        shapes.forEach((shape) => {
          const geo = new THREE.ExtrudeGeometry(shape, EXTRUDE_SETTINGS);
          geo.computeVertexNormals();
          subMeshes.push({ geometry: geo, color });
        });
      });

      if (subMeshes.length > 0) {
        // Calculate a joint bounding box so we can center the entire logo
        const groupBox = new THREE.Box3();
        subMeshes.forEach(({ geometry }) => {
          geometry.computeBoundingBox();
          if (geometry.boundingBox) {
            groupBox.union(geometry.boundingBox);
          }
        });

        const center = new THREE.Vector3();
        groupBox.getCenter(center);
        setGroupOffset(new THREE.Vector3(-center.x, -center.y, -center.z));

        setMeshes(subMeshes);
      }
    } catch (err) {
      console.warn("SVGLoader parsing error:", err);
    }
  }, []);

  if (meshes.length === 0) return null;

  return (
    <group ref={groupRef} scale={scale}>
      <group scale={[0.015, -0.015, 0.015]} position={[0, 0, 0]}>
        {meshes.map((mesh, index) => {
          const isYellow = mesh.color === "#f7df1e";
          return (
            <mesh
              key={index}
              geometry={mesh.geometry}
              castShadow
              receiveShadow
              position={
                isYellow
                  ? [groupOffset.x, groupOffset.y, groupOffset.z]
                  : [groupOffset.x, groupOffset.y, groupOffset.z + 0.5]
              }
            >
              <meshPhysicalMaterial
                color={mesh.color}
                roughness={isYellow ? 0.2 : 0.1}
                metalness={isYellow ? 0.1 : 0.4}
                emissive={mesh.color}
                emissiveIntensity={isYellow ? 0.1 : 0}
                clearcoat={1.0}
                clearcoatRoughness={0.05}
                reflectivity={1.0}
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}
