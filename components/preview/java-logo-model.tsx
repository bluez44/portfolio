"use client";

import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

const JAVA_BLUE = "#007396";
const JAVA_EMISSIVE = "#002b38";

const EXTRUDE_SETTINGS: THREE.ExtrudeGeometryOptions = {
  depth: 14,
  bevelEnabled: true,
  bevelThickness: 1.5,
  bevelSize: 1.5,
  bevelSegments: 5,
  curveSegments: 32,
};

const JAVA_SVG_STRING = `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8.851 18.56s-.917.534.653.714c1.902.218 2.874.187 4.969-.211 0 0 .552.346 1.321.646-4.699 2.013-10.633-.118-6.943-1.149M8.276 15.933s-1.028.761.542.924c2.032.209 3.636.227 6.413-.308 0 0 .384.389.987.602-5.679 1.661-12.007.13-7.942-1.218M13.116 11.475c1.158 1.333-.304 2.533-.304 2.533s2.939-1.518 1.589-3.418c-1.261-1.772-2.228-2.652 3.007-5.688 0-.001-8.216 2.051-4.292 6.573M19.33 20.504s.679.559-.747.991c-2.712.822-11.288 1.069-13.669.033-.856-.373.75-.89 1.254-.998.527-.114.828-.093.828-.093-.953-.671-6.156 1.317-2.643 1.887 9.58 1.553 17.462-.7 14.977-1.82M9.292 13.21s-4.362 1.036-1.544 1.412c1.189.159 3.561.123 5.77-.062 1.806-.152 3.618-.477 3.618-.477s-.637.272-1.098.587c-4.429 1.165-12.986.623-10.522-.568 2.082-1.006 3.776-.892 3.776-.892M17.116 17.584c4.503-2.34 2.421-4.589.968-4.285-.355.074-.515.138-.515.138s.132-.207.385-.297c2.875-1.011 5.086 2.981-.928 4.562 0-.001.07-.062.09-.118M14.401 0s2.494 2.494-2.365 6.33c-3.896 3.077-.888 4.832-.001 6.836-2.274-2.053-3.943-3.858-2.824-5.539 1.644-2.469 6.197-3.665 5.19-7.627M9.734 23.924c4.322.277 10.959-.153 11.116-2.198 0 0-.302.775-3.572 1.391-3.688.694-8.239.613-10.937.168 0-.001.553.457 3.393.639"/></svg>`;

export function JavaLogoModel({ scale = 1 }: { scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

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
      const svgData = loader.parse(JAVA_SVG_STRING);
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
          color={JAVA_BLUE}
          roughness={0.15}
          metalness={0.25}
          emissive={JAVA_EMISSIVE}
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
