"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

import { CLAUDE_OUTLINE } from "./logo-outlines";

/**
 * Three.js 3D procedural reconstruction of the Claude starburst symbol
 * (public/Claude_AI_symbol.svg).
 *
 * Technical notes:
 * 1. Geometry is exact — the outline is the SVG's own single path, flattened
 *    from its bezier/line mix, y-flipped and re-centred on the origin.
 * 2. The bevel is deliberately tiny. ExtrudeGeometry insets the end caps by
 *    bevelSize, and at a sharp spike that inset eats a lot of length — a
 *    Vue-sized bevel cuts every ray tip into a blunt hexagon. 0.18 keeps the
 *    points sharp while still catching a highlight on the rim.
 * 3. The backing plate is scaled 4% in XY rather than sharing the face's
 *    outline. Same-outline plates put the two side walls in the same plane and
 *    z-fight along the rim; the offset turns that into a deliberate dark edge.
 */

const CLAUDE_CORAL = "#d97757";
const CLAUDE_CORAL_DEEP = "#8f3f2b";
const CLAUDE_EMISSIVE = "#4a1d10";

const FACE_DEPTH = 11;
const BACKING_DEPTH = 9;
const BACKING_SPREAD = 1.04;

const EXTRUDE_SETTINGS: THREE.ExtrudeGeometryOptions = {
  depth: FACE_DEPTH,
  bevelEnabled: true,
  bevelThickness: 0.35,
  bevelSize: 0.18,
  bevelSegments: 3,
  curveSegments: 12,
};

// Normalises the 100-unit reference box to the ~3-unit envelope the other
// logo models in this folder use.
const UNIT = 0.03;

export function ClaudeLogoModel({ scale = 1 }: { scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  // Smooth floating turntable motion
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.22;
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.05;
    }
  });

  const starburstShape = useMemo(
    () =>
      new THREE.Shape(CLAUDE_OUTLINE.map(([x, y]) => new THREE.Vector2(x, y))),
    [],
  );

  // 1. Coral face
  const faceGeometry = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(starburstShape, EXTRUDE_SETTINGS);
    geo.translate(0, 0, -FACE_DEPTH / 2);
    geo.computeVertexNormals();
    geo.scale(UNIT, UNIT, UNIT);
    return geo;
  }, [starburstShape]);

  // 2. Backing plate, spread slightly in XY to read as a dark outline
  const backingGeometry = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(starburstShape, {
      ...EXTRUDE_SETTINGS,
      depth: BACKING_DEPTH,
    });
    geo.translate(0, 0, -BACKING_DEPTH / 2);
    geo.scale(BACKING_SPREAD, BACKING_SPREAD, 1);
    geo.computeVertexNormals();
    geo.scale(UNIT, UNIT, UNIT);
    return geo;
  }, [starburstShape]);

  return (
    <group ref={groupRef} scale={scale}>
      {/* Backing plate */}
      <mesh geometry={backingGeometry} position={[0, 0, -0.03]} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={CLAUDE_CORAL_DEEP}
          roughness={0.4}
          metalness={0.15}
          emissive={CLAUDE_EMISSIVE}
          emissiveIntensity={0.08}
          clearcoat={0.5}
          clearcoatRoughness={0.2}
        />
      </mesh>

      {/* Coral face */}
      <mesh geometry={faceGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={CLAUDE_CORAL}
          roughness={0.18}
          metalness={0.08}
          emissive={CLAUDE_EMISSIVE}
          emissiveIntensity={0.16}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          reflectivity={1.0}
        />
      </mesh>
    </group>
  );
}
