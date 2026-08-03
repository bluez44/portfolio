"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/**
 * Three.js procedural 3D reconstruction of the TalentGetGo logo (public/talentgetgo_logo.jpg).
 * 
 * Exact content & visual specs:
 * 1. Text: "TalentGetGo" (Capital T, lowercase alent, Capital G, lowercase et, Capital G, lowercase o).
 * 2. Material: Dark charcoal (#060606) extruded typography with subtle satin sheen.
 * 3. Green Swoosh Arcs: Vibrant emerald green (#36be77) upper and lower arcs framing the final "Go".
 * 4. PBR Lighting: Directional key light, fill light, and emerald rim glint.
 */

const COLOR_TEXT = "#060606";
const COLOR_GREEN = "#36be77";
const COLOR_GREEN_EMISSIVE = "#0a361e";

const EXTRUDE_DEPTH = 0.28;
const BEVEL_SIZE = 0.02;

function getExtrudeSettings(depth = EXTRUDE_DEPTH) {
  return {
    depth,
    bevelEnabled: true,
    bevelThickness: BEVEL_SIZE,
    bevelSize: BEVEL_SIZE,
    bevelSegments: 3,
    curveSegments: 32,
  } satisfies THREE.ExtrudeGeometryOptions;
}

// ----------------------------------------------------
// Letterform Builders (Exact "TalentGetGo" Case)
// ----------------------------------------------------

/** Capital 'T' */
function buildCapitalT(): THREE.Shape {
  const shape = new THREE.Shape();
  const w = 0.58;
  const capH = 0.16;
  const stemW = 0.16;
  const totalH = 1.16;
  const stemX = (w - stemW) / 2;

  shape.moveTo(0, totalH);
  shape.lineTo(w, totalH);
  shape.lineTo(w, totalH - capH);
  shape.lineTo(stemX + stemW, totalH - capH);
  shape.lineTo(stemX + stemW, 0);
  shape.lineTo(stemX, 0);
  shape.lineTo(stemX, totalH - capH);
  shape.lineTo(0, totalH - capH);
  shape.closePath();

  return shape;
}

/** Capital 'G' */
function buildCapitalG(): THREE.Shape {
  const shape = new THREE.Shape();
  const w = 0.58;
  const h = 1.16;
  const wall = 0.16;

  // Outer G boundary curve
  shape.absellipse(w / 2, h / 2, w / 2, h / 2, 0, Math.PI * 2, false, 0);

  // Inner hole
  const hole = new THREE.Path();
  hole.absellipse(w / 2, h / 2, w / 2 - wall, h / 2 - wall, 0, Math.PI * 2, true, 0);
  shape.holes.push(hole);

  return shape;
}

/** Lowercase 'a' */
function buildLetterA(): THREE.Shape {
  const shape = new THREE.Shape();
  const w = 0.54;
  const h = 0.82;
  const stemW = 0.16;

  // Outer boundary of 'a': Left rounded bowl + right vertical stem
  shape.moveTo(w, 0);
  shape.lineTo(w, h);
  shape.quadraticCurveTo(w / 2, h, 0, h / 2);
  shape.quadraticCurveTo(0, 0, w / 2, 0);
  shape.lineTo(w, 0);
  shape.closePath();

  // Inner counter hole of 'a'
  const hole = new THREE.Path();
  hole.moveTo(w - stemW, 0.15);
  hole.lineTo(w - stemW, h - 0.15);
  hole.quadraticCurveTo(stemW, h - 0.15, stemW, h / 2);
  hole.quadraticCurveTo(stemW, 0.15, w - stemW, 0.15);
  hole.closePath();

  shape.holes.push(hole);

  return shape;
}

/** Lowercase 'l' */
function buildLetterL(): THREE.Shape {
  const shape = new THREE.Shape();
  const stemW = 0.16;
  const totalH = 1.16;

  shape.moveTo(0, 0);
  shape.lineTo(stemW, 0);
  shape.lineTo(stemW, totalH);
  shape.lineTo(0, totalH);
  shape.closePath();

  return shape;
}

/** Lowercase 'e' */
function buildLetterE(): THREE.Shape {
  const shape = new THREE.Shape();
  const w = 0.52;
  const h = 0.82;
  const wall = 0.16;

  shape.absellipse(w / 2, h / 2, w / 2, h / 2, 0, Math.PI * 2, false, 0);

  const hole = new THREE.Path();
  hole.absellipse(w / 2, h / 2 + 0.04, w / 2 - wall, h / 2 - wall - 0.02, 0, Math.PI * 2, true, 0);
  shape.holes.push(hole);

  return shape;
}

/** Lowercase 'n' */
function buildLetterN(): THREE.Shape {
  const shape = new THREE.Shape();
  const w = 0.54;
  const h = 0.82;
  const stemW = 0.16;

  shape.moveTo(0, 0);
  shape.lineTo(stemW, 0);
  shape.lineTo(stemW, h - 0.2);
  shape.quadraticCurveTo(stemW, h, w / 2 + 0.04, h);
  shape.quadraticCurveTo(w, h, w, h - 0.2);
  shape.lineTo(w, 0);
  shape.lineTo(w - stemW, 0);
  shape.lineTo(w - stemW, h - 0.22);
  shape.quadraticCurveTo(w - stemW, h - stemW, w / 2 + 0.02, h - stemW);
  shape.quadraticCurveTo(stemW, h - stemW, stemW, h - 0.35);
  shape.lineTo(0, h - 0.35);
  shape.closePath();

  return shape;
}

/** Lowercase 't' */
function buildLetterT(): THREE.Shape {
  const shape = new THREE.Shape();
  const stemW = 0.16;
  const barH = 0.15;
  const crossY = 0.72;
  const totalH = 1.08;
  const barLeft = -0.10;
  const barRight = 0.42;

  shape.moveTo(barLeft, crossY);
  shape.lineTo(0, crossY);
  shape.lineTo(0, totalH);
  shape.lineTo(stemW, totalH);
  shape.lineTo(stemW, crossY);
  shape.lineTo(barRight, crossY);
  shape.lineTo(barRight, crossY - barH);
  shape.lineTo(stemW, crossY - barH);
  shape.lineTo(stemW, 0.12);
  shape.quadraticCurveTo(stemW, 0, stemW + 0.1, 0);
  shape.lineTo(barRight, 0);
  shape.lineTo(barRight, -0.15);
  shape.lineTo(0.08, -0.15);
  shape.quadraticCurveTo(-0.04, -0.15, -0.04, 0.08);
  shape.lineTo(-0.04, crossY - barH);
  shape.lineTo(barLeft, crossY - barH);
  shape.closePath();

  return shape;
}

/** Lowercase 'o' */
function buildLetterO(): THREE.Shape {
  const shape = new THREE.Shape();
  const w = 0.52;
  const h = 0.82;
  const wall = 0.16;

  shape.absellipse(w / 2, h / 2, w / 2, h / 2, 0, Math.PI * 2, false, 0);

  const hole = new THREE.Path();
  hole.absellipse(w / 2, h / 2, w / 2 - wall, h / 2 - wall, 0, Math.PI * 2, true, 0);
  shape.holes.push(hole);

  return shape;
}

// ----------------------------------------------------
// Green Swoosh Symbol Builders
// ----------------------------------------------------

/** Upper Green Arc framing top of "Go" */
function buildGreenUpperArcShape(): THREE.Shape {
  const shape = new THREE.Shape();
  const cx = 0.5;
  const cy = 0.35;
  const rOuter = 0.58;
  const rInner = 0.40;

  const startAngle = Math.PI * 0.10;
  const endAngle = Math.PI * 1.08;

  shape.absarc(cx, cy, rOuter, startAngle, endAngle, false);
  shape.quadraticCurveTo(cx - rOuter - 0.05, cy + 0.1, cx - rInner, cy + 0.15);
  shape.absarc(cx, cy, rInner, endAngle, startAngle, true);
  shape.quadraticCurveTo(cx + rOuter + 0.02, cy + 0.1, cx + rOuter * Math.cos(startAngle), cy + rOuter * Math.sin(startAngle));
  shape.closePath();

  return shape;
}

/** Lower Green Arc sweeping under "Go" */
function buildGreenLowerArcShape(): THREE.Shape {
  const shape = new THREE.Shape();
  const cx = 0.5;
  const cy = 0.25;
  const rOuter = 0.58;
  const rInner = 0.42;

  const startAngle = Math.PI * 1.15;
  const endAngle = Math.PI * 1.88;

  shape.absarc(cx, cy, rOuter, startAngle, endAngle, false);
  shape.quadraticCurveTo(cx + rOuter + 0.04, cy - 0.2, cx + rInner * Math.cos(endAngle), cy + rInner * Math.sin(endAngle));
  shape.absarc(cx, cy, rInner, endAngle, startAngle, true);
  shape.quadraticCurveTo(cx - rOuter, cy - 0.18, cx + rOuter * Math.cos(startAngle), cy + rOuter * Math.sin(startAngle));
  shape.closePath();

  return shape;
}

// ----------------------------------------------------
// React Component for TalentGetGo 3D Model
// ----------------------------------------------------

interface ExtrudedMeshProps {
  shape: THREE.Shape;
  position: [number, number, number];
  color: string;
  roughness?: number;
  metalness?: number;
  emissive?: string;
  emissiveIntensity?: number;
  clearcoat?: number;
  depth?: number;
}

function ExtrudedMesh({
  shape,
  position,
  color,
  roughness = 0.3,
  metalness = 0.15,
  emissive = "#000000",
  emissiveIntensity = 0,
  clearcoat = 0.5,
  depth = EXTRUDE_DEPTH,
}: ExtrudedMeshProps) {
  const geometry = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(shape, getExtrudeSettings(depth));
    geo.computeVertexNormals();
    geo.translate(0, 0, -depth / 2);
    return geo;
  }, [shape, depth]);

  return (
    <mesh geometry={geometry} position={position} castShadow receiveShadow>
      <meshPhysicalMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        clearcoat={clearcoat}
        clearcoatRoughness={0.1}
        reflectivity={0.8}
      />
    </mesh>
  );
}

export function TalentGetGoLogoModel({ scale = 1 }: { scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  // Subtle floating rotation animation
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.06;
      groupRef.current.rotation.y = Math.sin(t * 0.8) * 0.08;
    }
  });

  // Letter shapes for "TalentGetGo"
  const capT = useMemo(() => buildCapitalT(), []);
  const letterA = useMemo(() => buildLetterA(), []);
  const letterL = useMemo(() => buildLetterL(), []);
  const letterE1 = useMemo(() => buildLetterE(), []);
  const letterN = useMemo(() => buildLetterN(), []);
  const letterT1 = useMemo(() => buildLetterT(), []);
  const capG1 = useMemo(() => buildCapitalG(), []);
  const letterE2 = useMemo(() => buildLetterE(), []);
  const letterT2 = useMemo(() => buildLetterT(), []);
  const capG2 = useMemo(() => buildCapitalG(), []);
  const letterO = useMemo(() => buildLetterO(), []);

  // Green swoosh arcs
  const greenUpperArc = useMemo(() => buildGreenUpperArcShape(), []);
  const greenLowerArc = useMemo(() => buildGreenLowerArcShape(), []);

  // "TalentGetGo" letter positions (11 characters)
  const letterPositions: { shape: THREE.Shape; x: number }[] = [
    { shape: capT,    x: 0.00 },   // T
    { shape: letterA, x: 0.56 },   // a
    { shape: letterL, x: 1.14 },   // l
    { shape: letterE1,x: 1.38 },   // e
    { shape: letterN, x: 1.96 },   // n
    { shape: letterT1,x: 2.56 },   // t
    { shape: capG1,   x: 3.04 },   // G
    { shape: letterE2,x: 3.68 },   // e
    { shape: letterT2,x: 4.26 },   // t
    { shape: capG2,   x: 4.74 },   // G
    { shape: letterO, x: 5.38 },   // o
  ];

  const totalWidth = 6.0;
  const offsetX = -totalWidth / 2;
  const offsetY = -0.35;

  return (
    <group ref={groupRef} scale={scale} position={[0, 0, 0]}>
      <group position={[offsetX, offsetY, 0]}>
        {/* 1. "TalentGetGo" Wordmark Letters */}
        {letterPositions.map((item, index) => (
          <ExtrudedMesh
            key={index}
            shape={item.shape}
            position={[item.x, 0, 0]}
            color={COLOR_TEXT}
            roughness={0.35}
            metalness={0.15}
            clearcoat={0.6}
          />
        ))}

        {/* 2. Green Upper Swoosh Arc framing "Go" */}
        <ExtrudedMesh
          shape={greenUpperArc}
          position={[4.80, 0.48, 0.04]}
          color={COLOR_GREEN}
          roughness={0.22}
          metalness={0.2}
          emissive={COLOR_GREEN_EMISSIVE}
          emissiveIntensity={0.2}
          clearcoat={0.9}
          depth={EXTRUDE_DEPTH * 1.05}
        />

        {/* 3. Green Lower Swoosh Arc sweeping under "Go" */}
        <ExtrudedMesh
          shape={greenLowerArc}
          position={[4.80, -0.32, 0.04]}
          color={COLOR_GREEN}
          roughness={0.22}
          metalness={0.2}
          emissive={COLOR_GREEN_EMISSIVE}
          emissiveIntensity={0.2}
          clearcoat={0.9}
          depth={EXTRUDE_DEPTH * 1.05}
        />
      </group>
    </group>
  );
}
