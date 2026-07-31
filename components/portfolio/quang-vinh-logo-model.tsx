"use client";

import { useMemo } from "react";
import * as THREE from "three";

/**
 * Procedural reconstruction of the Quang Vinh Logo (app/icon.png) as a Three.js group.
 * The model consists of:
 * 1. An outer ring with a crescent-shaped slot on the bottom-left.
 * 2. Two hollow pointed ears at the top.
 * 3. A wavy cat tail sweeping out on the bottom-right.
 * 4. A central V-shaped checkmark that overlaps the ring.
 * 5. A wordmark plane with a high-resolution canvas texture for "QUANG VINH".
 * 
 * Rebuilt using extruded shapes with clean bevels and a premium navy blue metallic finish.
 */

const BRAND_BLUE = "#0f2847"; // Deep navy blue from the logo

const EXTRUDE_DEPTH = 0.25;
const BEVEL = 0.02;

function extrudeSettings(depth = EXTRUDE_DEPTH) {
  return {
    depth,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 3,
    curveSegments: 32,
  } satisfies THREE.ExtrudeGeometryOptions;
}

// 1. Build Outer Ring with main hole and bottom-left crescent slot
function buildOuterRingShape(): THREE.Shape {
  const shape = new THREE.Shape();
  // Outer circle
  shape.absarc(0, 0, 1.0, 0, Math.PI * 2, false);

  // Main center hole
  const mainHole = new THREE.Path();
  mainHole.absarc(0, 0, 0.78, 0, Math.PI * 2, true);
  shape.holes.push(mainHole);

  // Bottom-left crescent slot
  const crescentHole = new THREE.Path();
  const startAngle = Math.PI * 1.08; // 194.4 degrees
  const endAngle = Math.PI * 1.35; // 243.0 degrees
  crescentHole.absarc(0, 0, 0.88, startAngle, endAngle, false);
  crescentHole.absarc(0, 0, 0.82, endAngle, startAngle, true);
  crescentHole.closePath();
  shape.holes.push(crescentHole);

  return shape;
}

// 2. Build Hollow Left Ear
function buildLeftEarShape(): THREE.Shape {
  const shape = new THREE.Shape();
  // Outer boundary
  shape.moveTo(-0.76, 0.62);
  shape.lineTo(-0.78, 1.25);
  shape.lineTo(-0.18, 0.82);
  shape.closePath();

  // Inner hole
  const hole = new THREE.Path();
  hole.moveTo(-0.66, 0.70);
  hole.lineTo(-0.68, 1.12);
  hole.lineTo(-0.25, 0.82);
  hole.closePath();
  shape.holes.push(hole);

  return shape;
}

// 3. Build Hollow Right Ear
function buildRightEarShape(): THREE.Shape {
  const shape = new THREE.Shape();
  // Outer boundary
  shape.moveTo(0.76, 0.62);
  shape.lineTo(0.78, 1.25);
  shape.lineTo(0.18, 0.82);
  shape.closePath();

  // Inner hole
  const hole = new THREE.Path();
  hole.moveTo(0.66, 0.70);
  hole.lineTo(0.68, 1.12);
  hole.lineTo(0.25, 0.82);
  hole.closePath();
  shape.holes.push(hole);

  return shape;
}

// 4. Build Wavy Cat Tail
function buildTailShape(): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(0.68, -0.62);

  // Top edge: sweep out to tip
  shape.bezierCurveTo(
    0.88, -0.52,
    1.12, -0.45,
    1.38, -0.56
  );

  // Bottom edge: sweep back to outer ring
  shape.bezierCurveTo(
    1.12, -0.80,
    0.78, -0.92,
    0.54, -0.84
  );

  shape.closePath();
  return shape;
}

// 5. Build Hollow Central Checkmark (overlaps the ring)
function buildCheckmarkShape(): THREE.Shape {
  const shape = new THREE.Shape();
  // Outer boundary of the V
  shape.moveTo(-0.52, 0.38);
  shape.lineTo(0.0, -0.42);
  shape.lineTo(0.92, 0.85);
  shape.lineTo(0.72, 0.72);
  shape.lineTo(-0.10, -0.15);
  shape.lineTo(-0.40, 0.28);
  shape.closePath();

  // Inner V-shaped slot
  const hole = new THREE.Path();
  hole.moveTo(-0.44, 0.30);
  hole.lineTo(0.0, -0.32);
  hole.lineTo(0.82, 0.76);
  hole.lineTo(0.76, 0.74);
  hole.lineTo(-0.02, -0.22);
  hole.lineTo(-0.35, 0.22);
  hole.closePath();
  shape.holes.push(hole);

  return shape;
}

// 6. Build High-Resolution Wordmark Canvas Texture
function buildTextTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "rgba(0,0,0,0)"; // Transparent background
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Style text
  ctx.fillStyle = BRAND_BLUE;
  // Use a clean bold geometric sans-serif font
  ctx.font = "bold 220px 'Outfit', 'Inter', 'Montserrat', 'Helvetica', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  // Custom letter spacing logic since older canvas APIs don't always support letterSpacing
  const text = "QUANG VINH";
  const spacing = 16; // letter spacing in pixels
  
  // Measure total width to center it
  ctx.letterSpacing = `${spacing}px`;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

interface ComponentMeshProps {
  shape: THREE.Shape;
  position: [number, number, number];
  depth?: number;
  castShadow?: boolean;
}

function ComponentMesh({ shape, position, depth = EXTRUDE_DEPTH }: ComponentMeshProps) {
  const geometry = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings(depth));
    geo.computeVertexNormals();
    geo.translate(0, 0, -depth / 2);
    return geo;
  }, [shape, depth]);

  return (
    <mesh geometry={geometry} position={position} castShadow receiveShadow>
      {/* Premium Dark Blue Metallic Lacquer Finish */}
      <meshPhysicalMaterial
        color={BRAND_BLUE}
        roughness={0.18}
        metalness={0.85}
        clearcoat={1.0}
        clearcoatRoughness={0.08}
        reflectivity={1.0}
      />
    </mesh>
  );
}

export function QuangVinhLogoModel({ scale = 1 }: { scale?: number }) {
  const outerRing = useMemo(() => buildOuterRingShape(), []);
  const leftEar = useMemo(() => buildLeftEarShape(), []);
  const rightEar = useMemo(() => buildRightEarShape(), []);
  const tail = useMemo(() => buildTailShape(), []);
  const checkmark = useMemo(() => buildCheckmarkShape(), []);
  const textTexture = useMemo(() => buildTextTexture(), []);

  // Centering offset based on bounding box
  const centerY = -0.1;

  return (
    <group scale={scale} position={[0, centerY * scale, 0]}>
      {/* 1. Outer Ring */}
      <ComponentMesh shape={outerRing} position={[0, 0.2, 0]} />

      {/* 2. Left Ear */}
      <ComponentMesh shape={leftEar} position={[0, 0.2, -0.01]} />

      {/* 3. Right Ear */}
      <ComponentMesh shape={rightEar} position={[0, 0.2, -0.01]} />

      {/* 4. Cat Tail */}
      <ComponentMesh shape={tail} position={[0, 0.2, -0.01]} />

      {/* 5. Central Checkmark (slight forward Z offset to cleanly overlap the ring) */}
      <ComponentMesh shape={checkmark} position={[0, 0.2, 0.05]} depth={EXTRUDE_DEPTH * 1.1} />

      {/* 6. Wordmark Text Plane */}
      <mesh position={[0, -1.3, 0]} castShadow receiveShadow>
        <planeGeometry args={[3.2, 0.8]} />
        <meshStandardMaterial
          map={textTexture}
          transparent
          roughness={0.3}
          metalness={0.1}
          alphaTest={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
