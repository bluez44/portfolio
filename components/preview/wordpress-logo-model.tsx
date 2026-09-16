"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

import { WORDPRESS_DISC_OUTLINES } from "./logo-outlines";

/**
 * Three.js 3D procedural reconstruction of the WordPress mark
 * (public/WordPress_blue_logo.svg).
 *
 * Technical notes:
 * 1. Geometry is exact, not eyeballed — the disc outlines come straight from
 *    the SVG's own path data (beziers flattened, y-flipped, re-centred), and
 *    the enclosing ring is rebuilt from absarc at the reference radii.
 * 2. Two-part assembly: an extruded annulus plus the disc. The reference draws
 *    the W as a KNOCKOUT, so the letterform is the negative space between the
 *    disc's four outlines — there is no separate "W" mesh to model.
 * 3. The disc sits forward on Z so the ring reads as its own plane under
 *    raking light. Extrusion depth and bevels are authored: a flat vector mark
 *    carries no thickness to measure. The ring bevel is deliberately small —
 *    the annulus is only 2.81 reference units thick, so a Vue-sized bevel
 *    would knife-edge it.
 */

const WP_BLUE = "#21759b";
const WP_BLUE_DEEP = "#17546f";
const WP_EMISSIVE = "#0a2c3c";

const RING_OUTER = 61.26;
const RING_INNER = 58.45;
const RING_DEPTH = 12;
const DISC_DEPTH = 14;

const RING_EXTRUDE: THREE.ExtrudeGeometryOptions = {
  depth: RING_DEPTH,
  bevelEnabled: true,
  bevelThickness: 0.9,
  bevelSize: 0.45,
  bevelSegments: 4,
  curveSegments: 64,
};

const DISC_EXTRUDE: THREE.ExtrudeGeometryOptions = {
  depth: DISC_DEPTH,
  bevelEnabled: true,
  bevelThickness: 0.8,
  bevelSize: 0.5,
  bevelSegments: 4,
  curveSegments: 12,
};

// Normalises the ~122-unit reference box to the ~3-unit envelope the other
// logo models in this folder use.
const UNIT = 0.0245;

export function WordpressLogoModel({ scale = 1 }: { scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  // Smooth floating turntable motion
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.22;
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.05;
    }
  });

  // 1. Enclosing ring — annulus between the reference's two circle radii
  const ringGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, RING_OUTER, 0, Math.PI * 2, false);

    const hole = new THREE.Path();
    hole.absarc(0, 0, RING_INNER, 0, Math.PI * 2, true);
    shape.holes.push(hole);

    const geo = new THREE.ExtrudeGeometry(shape, RING_EXTRUDE);
    geo.translate(0, 0, -RING_DEPTH / 2);
    geo.computeVertexNormals();
    geo.scale(UNIT, UNIT, UNIT);
    return geo;
  }, []);

  // 2. The disc, with the W left as negative space between its four outlines
  const discGeometry = useMemo(() => {
    const shapes = WORDPRESS_DISC_OUTLINES.map(
      (outline) =>
        new THREE.Shape(outline.map(([x, y]) => new THREE.Vector2(x, y))),
    );

    const geo = new THREE.ExtrudeGeometry(shapes, DISC_EXTRUDE);
    geo.translate(0, 0, -DISC_DEPTH / 2);
    geo.computeVertexNormals();
    geo.scale(UNIT, UNIT, UNIT);
    return geo;
  }, []);

  return (
    <group ref={groupRef} scale={scale}>
      {/* Enclosing ring — deeper tone so it separates from the disc */}
      <mesh geometry={ringGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={WP_BLUE_DEEP}
          roughness={0.28}
          metalness={0.2}
          emissive={WP_EMISSIVE}
          emissiveIntensity={0.15}
          clearcoat={0.9}
          clearcoatRoughness={0.08}
          reflectivity={1.0}
        />
      </mesh>

      {/* Disc in the reference blue, embossed forward of the ring */}
      <mesh
        geometry={discGeometry}
        position={[0, 0, 0.03]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={WP_BLUE}
          roughness={0.16}
          metalness={0.12}
          emissive={WP_EMISSIVE}
          emissiveIntensity={0.18}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          reflectivity={1.0}
        />
      </mesh>
    </group>
  );
}
