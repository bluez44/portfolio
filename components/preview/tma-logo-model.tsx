"use client";

import { useMemo } from "react";
import * as THREE from "three";

/**
 * Procedural reconstruction of the flat TMA wordmark (public/tma.webp) as a
 * Three.js group: three extruded letterforms, a tapered swoosh ribbon, a
 * textured globe, and a row of three flat "button" dots. The source is a
 * flat vector logo (no hidden side, no real depth) -- extrusion depth,
 * bevels, and globe volume are a deliberate stylized 3D reading of a 2D
 * mark, not reconstruction of geometry that exists in the reference.
 */

const BRAND_BLUE = "#1697d6";
const DOT_RED = "#ed1c2a";
const DOT_GREEN = "#39a935";
const GLOBE_GREY = "#a7a9ac";
const GLOBE_LAND = "#f3e6a6";

const SLANT = 0.17; // forward italic lean matching the reference wordmark
const EXTRUDE_DEPTH = 0.34;
const BEVEL = 0.03;

function slantedPoint(x: number, y: number): THREE.Vector2 {
  return new THREE.Vector2(x + SLANT * y, y);
}

function extrudeSettings(depth = EXTRUDE_DEPTH) {
  return {
    depth,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 2,
    curveSegments: 1,
  } satisfies THREE.ExtrudeGeometryOptions;
}

function buildLetterT(): THREE.Shape {
  const barH = 0.3;
  const stemW = 0.26;
  const w = 0.66;
  const cx = w / 2;
  const pts = [
    [0, 1],
    [w, 1],
    [w, 1 - barH],
    [cx + stemW / 2, 1 - barH],
    [cx + stemW / 2, 0],
    [cx - stemW / 2, 0],
    [cx - stemW / 2, 1 - barH],
    [0, 1 - barH],
  ];
  const shape = new THREE.Shape();
  pts.forEach(([x, y], i) => {
    const p = slantedPoint(x, y);
    if (i === 0) shape.moveTo(p.x, p.y);
    else shape.lineTo(p.x, p.y);
  });
  shape.closePath();
  return shape;
}

function quadShape(points: [number, number][]): THREE.Shape {
  const shape = new THREE.Shape();
  points.forEach(([x, y], i) => {
    const p = slantedPoint(x, y);
    if (i === 0) shape.moveTo(p.x, p.y);
    else shape.lineTo(p.x, p.y);
  });
  shape.closePath();
  return shape;
}

/**
 * Built as four separate strokes (two vertical stems, two converging
 * diagonals) rather than one concave outline -- this is what keeps the
 * valley an actual open notch instead of a solid wedge that reads as a "V".
 */
function buildLetterM(): THREE.Shape[] {
  const w = 0.92;
  const stemW = 0.22;
  const strokeW = 0.24;
  const apexY = 1.0;
  const valleyY = 0.16;
  const midX = w / 2;

  const leftStem = quadShape([
    [0, 0],
    [0, apexY],
    [stemW, apexY],
    [stemW, 0],
  ]);
  const rightStem = quadShape([
    [w - stemW, 0],
    [w - stemW, apexY],
    [w, apexY],
    [w, 0],
  ]);
  const leftDiagonal = quadShape([
    [stemW, apexY],
    [stemW + strokeW, apexY],
    [midX + strokeW / 2, valleyY],
    [midX - strokeW / 2, valleyY],
  ]);
  const rightDiagonal = quadShape([
    [w - stemW - strokeW, apexY],
    [w - stemW, apexY],
    [midX + strokeW / 2, valleyY],
    [midX - strokeW / 2, valleyY],
  ]);

  return [leftStem, rightStem, leftDiagonal, rightDiagonal];
}

function buildLetterA(): THREE.Shape {
  const w = 0.72;
  const apex = 1.0;
  const barBottom = 0.3;
  const barTop = 0.4;
  const legInnerL = 0.22;
  const legInnerR = 0.5;

  const outer = [
    [0, 0],
    [w / 2, apex],
    [w, 0],
    [legInnerR, 0],
    [legInnerR, barBottom],
    [legInnerL, barBottom],
    [legInnerL, 0],
  ];
  const shape = new THREE.Shape();
  outer.forEach(([x, y], i) => {
    const p = slantedPoint(x, y);
    if (i === 0) shape.moveTo(p.x, p.y);
    else shape.lineTo(p.x, p.y);
  });
  shape.closePath();

  const hole = [
    [0.3, barTop],
    [0.42, barTop],
    [w / 2, 0.86],
  ];
  const holePath = new THREE.Path();
  hole.forEach(([x, y], i) => {
    const p = slantedPoint(x, y);
    if (i === 0) holePath.moveTo(p.x, p.y);
    else holePath.lineTo(p.x, p.y);
  });
  holePath.closePath();
  shape.holes.push(holePath);

  return shape;
}

function buildSwooshShape(): THREE.Shape {
  // Tapered comet/orbit arc sweeping up off the A and curling down around
  // the globe, approximated as a crescent: an outer and inner arc joined
  // at two tapered tips.
  const cx = 0.0;
  const cy = 0.0;
  const rOuterBase = 1.0;
  const startAngle = THREE.MathUtils.degToRad(168);
  const endAngle = THREE.MathUtils.degToRad(-42);
  const segments = 40;
  const maxThickness = 0.2;

  const outerPts: THREE.Vector2[] = [];
  const innerPts: THREE.Vector2[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = THREE.MathUtils.lerp(startAngle, endAngle, t);
    // ease-in/out taper: thin at both tips, thickest through the middle
    const taper = Math.sin(Math.PI * t) ** 0.7;
    const thickness = maxThickness * taper;
    const rOuter = rOuterBase;
    const rInner = rOuterBase - Math.max(thickness, 0.015);
    outerPts.push(
      new THREE.Vector2(cx + Math.cos(angle) * rOuter, cy + Math.sin(angle) * rOuter),
    );
    innerPts.push(
      new THREE.Vector2(cx + Math.cos(angle) * rInner, cy + Math.sin(angle) * rInner),
    );
  }

  const shape = new THREE.Shape();
  shape.moveTo(outerPts[0].x, outerPts[0].y);
  outerPts.forEach((p) => shape.lineTo(p.x, p.y));
  for (let i = innerPts.length - 1; i >= 0; i--) shape.lineTo(innerPts[i].x, innerPts[i].y);
  shape.closePath();
  return shape;
}

function buildGlobeTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size / 2;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = GLOBE_GREY;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // subtle latitude shading so the sphere reads as a globe, not a flat disc
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "rgba(255,255,255,0.18)");
  grad.addColorStop(0.5, "rgba(255,255,255,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.22)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // stylized Asia-like landmass blob, placed so it faces the camera once
  // the sphere is rotated into position (see rotation.y on the globe mesh)
  ctx.fillStyle = GLOBE_LAND;
  ctx.beginPath();
  ctx.moveTo(size * 0.56, canvas.height * 0.22);
  ctx.bezierCurveTo(
    size * 0.7,
    canvas.height * 0.18,
    size * 0.82,
    canvas.height * 0.3,
    size * 0.8,
    canvas.height * 0.46,
  );
  ctx.bezierCurveTo(
    size * 0.78,
    canvas.height * 0.58,
    size * 0.68,
    canvas.height * 0.66,
    size * 0.6,
    canvas.height * 0.6,
  );
  ctx.bezierCurveTo(
    size * 0.5,
    canvas.height * 0.56,
    size * 0.46,
    canvas.height * 0.4,
    size * 0.5,
    canvas.height * 0.3,
  );
  ctx.closePath();
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function LetterMesh({
  shape,
  position,
}: {
  shape: THREE.Shape | THREE.Shape[];
  position: [number, number, number];
}) {
  const geometry = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings());
    geo.computeVertexNormals();
    geo.translate(0, 0, -EXTRUDE_DEPTH / 2);
    return geo;
  }, [shape]);

  return (
    <mesh geometry={geometry} position={position} castShadow receiveShadow>
      <meshStandardMaterial color={BRAND_BLUE} roughness={0.4} metalness={0.08} />
    </mesh>
  );
}

function Swoosh({ position }: { position: [number, number, number] }) {
  const geometry = useMemo(() => {
    const shape = buildSwooshShape();
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings(0.22));
    geo.computeVertexNormals();
    geo.translate(0, 0, -0.11);
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} position={position} castShadow receiveShadow>
      <meshStandardMaterial color={BRAND_BLUE} roughness={0.4} metalness={0.08} />
    </mesh>
  );
}

function Globe({
  position,
  radius,
}: {
  position: [number, number, number];
  radius: number;
}) {
  const texture = useMemo(() => buildGlobeTexture(), []);

  return (
    <mesh position={position} rotation={[0, -1.8, 0]} castShadow receiveShadow>
      <sphereGeometry args={[radius, 48, 48]} />
      <meshStandardMaterial map={texture} roughness={0.65} metalness={0.05} />
    </mesh>
  );
}

function Dot({
  position,
  color,
}: {
  position: [number, number, number];
  color: string;
}) {
  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.15, 24, 24);
    geo.scale(1, 1, 0.4);
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} position={position} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.35} metalness={0.1} />
    </mesh>
  );
}

/**
 * Drop this inside any react-three-fiber `<Canvas>`. The group is centered
 * on its own visual bounding box, so it can be scaled/positioned/rotated
 * like a single object.
 */
export function TmaLogoModel(props: { scale?: number }) {
  const { scale = 1 } = props;

  const letterT = useMemo(() => buildLetterT(), []);
  const letterM = useMemo(() => buildLetterM(), []);
  const letterA = useMemo(() => buildLetterA(), []);

  // Layout in local units (letter cap-height = 1), matching the reference's
  // 2:1 wide composition, then re-centered on the group's visual bounds.
  const centerX = 1.8;
  const centerY = 0.36;

  return (
    <group scale={scale} position={[-centerX * scale, -centerY * scale, 0]}>
      <LetterMesh shape={letterT} position={[0, 0, 0]} />
      <LetterMesh shape={letterM} position={[0.74, 0, 0]} />
      <LetterMesh shape={letterA} position={[1.76, 0, 0]} />
      <Swoosh position={[2.78, 0.16, 0]} />
      <Globe position={[2.98, 0.5, -0.05]} radius={0.62} />
      <Dot position={[0.15, -0.34, 0.05]} color={DOT_RED} />
      <Dot position={[0.5, -0.34, 0.05]} color={BRAND_BLUE} />
      <Dot position={[0.85, -0.34, 0.05]} color={DOT_GREEN} />
    </group>
  );
}
