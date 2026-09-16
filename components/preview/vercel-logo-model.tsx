"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

import { VERCEL_TRIANGLE } from "./logo-outlines";

/**
 * Three.js 3D procedural reconstruction of the Vercel triangle mark
 * (public/vercel-icon-svgrepo-com.svg).
 *
 * Technical notes:
 * 1. Geometry is exact — the reference is a three-point <polygon>
 *    (128 0 · 256 221.705 · 0 221.705), re-centred on its own bounding box and
 *    flipped from SVG y-down to GL y-up. Nothing is approximated.
 * 2. Deviation from the reference, on purpose: the reference fill is pure black,
 *    which vanishes against the dark scene background, so the face is rendered
 *    as the light-on-dark variant Vercel itself ships for dark surfaces.
 * 3. A graphite underplate holds the silhouette; extrusion depth and the chamfer
 *    are authored, since a flat vector mark has no thickness to measure.
 * 4. Metalness stays low. There is no environment map in these scenes, and a
 *    metal with nothing to reflect just goes dark — at 0.35 the light face
 *    rendered mid-grey instead of the near-white it is supposed to be.
 */

const VERCEL_LIGHT = "#f2f2f2";
const VERCEL_GRAPHITE = "#3a3a3a";

const FACE_DEPTH = 26;
const PLATE_DEPTH = 30;

const EXTRUDE_SETTINGS: THREE.ExtrudeGeometryOptions = {
  depth: FACE_DEPTH,
  bevelEnabled: true,
  bevelThickness: 3.2,
  bevelSize: 2.6,
  bevelSegments: 4,
  curveSegments: 8,
};

// Normalises the 256-unit reference box to the ~3-unit envelope the other
// logo models in this folder use.
const UNIT = 0.0117;

export function VercelLogoModel({ scale = 1 }: { scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  // Smooth floating turntable motion
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.22;
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.05;
    }
  });

  const triangleShape = useMemo(
    () =>
      new THREE.Shape(VERCEL_TRIANGLE.map(([x, y]) => new THREE.Vector2(x, y))),
    [],
  );

  // 1. Light face
  const faceGeometry = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(triangleShape, EXTRUDE_SETTINGS);
    geo.translate(0, 0, -FACE_DEPTH / 2);
    geo.computeVertexNormals();
    geo.scale(UNIT, UNIT, UNIT);
    return geo;
  }, [triangleShape]);

  // 2. Graphite underplate — keeps the silhouette readable on dark
  const underplateGeometry = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(triangleShape, {
      ...EXTRUDE_SETTINGS,
      depth: PLATE_DEPTH,
      bevelThickness: 4,
      bevelSize: 6,
    });
    geo.translate(0, 0, -PLATE_DEPTH / 2);
    geo.computeVertexNormals();
    geo.scale(UNIT, UNIT, UNIT);
    return geo;
  }, [triangleShape]);

  return (
    <group ref={groupRef} scale={scale}>
      {/* Graphite underplate */}
      <mesh geometry={underplateGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={VERCEL_GRAPHITE}
          roughness={0.5}
          metalness={0.2}
          clearcoat={0.4}
          clearcoatRoughness={0.2}
        />
      </mesh>

      {/* Light face */}
      <mesh
        geometry={faceGeometry}
        position={[0, 0, 0.06]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={VERCEL_LIGHT}
          roughness={0.22}
          metalness={0.04}
          clearcoat={1.0}
          clearcoatRoughness={0.04}
          reflectivity={1.0}
        />
      </mesh>
    </group>
  );
}
