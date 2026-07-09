"use client";

import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { TechItem } from "@/lib/portfolio-data";

export interface TechSceneHandle {
  focusTech: (index: number) => void;
  closeFocus: () => void;
  setRotationTarget: (rotY: number, tilt: number) => void;
}

export interface TechSceneProps {
  techs: TechItem[];
  accent: string;
  reducedMotion: boolean;
  visible: boolean;
  focusedIndex: number | null;
  onFocus: (index: number | null) => void;
}

const TIERS = [
  { y: -1.7, r: 2.5, dir: 1 },
  { y: 0.25, r: 2.0, dir: -1 },
  { y: 2.05, r: 1.5, dir: 1 },
] as const;

const CAMERA_HOME = new THREE.Vector3(0, 0.7, 8.4);

function buildTierGeometry(tier: number): THREE.BufferGeometry {
  if (tier === 0) return new THREE.IcosahedronGeometry(0.3, 0);
  if (tier === 1) return new THREE.OctahedronGeometry(0.32, 0);
  return new THREE.DodecahedronGeometry(0.28, 0);
}

function computeTechPosition(
  tier: (typeof TIERS)[number],
  tierIndex: number,
  angle0: number,
  orbitTime: number,
  index: number,
  reducedMotion: boolean,
): THREE.Vector3 {
  const angle = reducedMotion
    ? angle0
    : angle0 + orbitTime * tier.dir * (1 + tierIndex * 0.18);
  const y =
    tier.y + (reducedMotion ? 0 : Math.sin(orbitTime * 1.3 + index) * 0.07);
  return new THREE.Vector3(Math.cos(angle) * tier.r, y, Math.sin(angle) * tier.r);
}

interface TechMeshProps {
  tech: TechItem;
  index: number;
  angle0: number;
  accent: string;
  reducedMotion: boolean;
  focused: boolean;
  dimmed: boolean;
  growRef: MutableRefObject<number>;
  orbitTimeRef: MutableRefObject<number>;
  dragMovedRef: MutableRefObject<number>;
  onSelect: (index: number) => void;
}

function TechMesh({
  tech,
  index,
  angle0,
  accent,
  reducedMotion,
  focused,
  dimmed,
  growRef,
  orbitTimeRef,
  dragMovedRef,
  onSelect,
}: TechMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const scaleRef = useRef(0.001);
  const opacityRef = useRef(0);
  const hoveredRef = useRef(false);
  const tier = TIERS[tech.tier];

  const geometry = useMemo(() => buildTierGeometry(tech.tier), [tech.tier]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const grow = growRef.current;
    const ease = grow < 1 ? 1 - Math.pow(1 - grow, 3) : 1;
    const tierReveal = Math.max(
      0,
      Math.min(1, (ease - (0.25 + tech.tier * 0.22)) / 0.25),
    );

    mesh.position.copy(
      computeTechPosition(
        tier,
        tech.tier,
        angle0,
        orbitTimeRef.current,
        index,
        reducedMotion,
      ),
    );

    let targetScale = tierReveal;
    if (focused) targetScale *= 1.5;
    else if (hoveredRef.current) targetScale *= 1.25;
    scaleRef.current += (targetScale - scaleRef.current) * 0.12;
    mesh.scale.setScalar(Math.max(0.001, scaleRef.current));

    if (!reducedMotion) {
      mesh.rotation.y += 0.4 / 60;
      mesh.rotation.x += 0.15 / 60;
    }

    const targetOpacity = dimmed ? 0.13 : 1;
    opacityRef.current += (targetOpacity - opacityRef.current) * 0.1;
    const material = mesh.material as THREE.MeshStandardMaterial;
    material.opacity = opacityRef.current;
    material.emissiveIntensity = focused || hoveredRef.current ? 0.9 : 0.3;

    const wire = mesh.children[0] as THREE.LineSegments | undefined;
    const wireMaterial = wire?.material as THREE.LineBasicMaterial | undefined;
    if (wireMaterial) {
      wireMaterial.opacity =
        opacityRef.current * (focused || hoveredRef.current ? 0.95 : 0.5);
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      onPointerOver={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        if (dragMovedRef.current > 0) return;
        hoveredRef.current = true;
      }}
      onPointerOut={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        hoveredRef.current = false;
      }}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        if (dragMovedRef.current >= 12) return;
        onSelect(index);
      }}
    >
      <meshStandardMaterial
        color={0x232c3a}
        emissive={accent}
        emissiveIntensity={0.3}
        roughness={0.35}
        metalness={0.45}
        transparent
        opacity={0}
      />
      <lineSegments>
        <primitive object={edges} attach="geometry" />
        <lineBasicMaterial color={accent} transparent opacity={0.5} />
      </lineSegments>
    </mesh>
  );
}

function TechTrunk({
  accent,
  growRef,
}: {
  accent: string;
  growRef: MutableRefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const tipMaterialRef = useRef<THREE.MeshBasicMaterial>(null);

  const trunkMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x2a3442,
        emissive: accent,
        emissiveIntensity: 0.35,
        roughness: 0.4,
        metalness: 0.3,
      }),
    [accent],
  );

  const trunkGeometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.035, 0.11, 5.8, 10);
    geo.translate(0, 2.9, 0);
    return geo;
  }, []);

  const roots = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => {
        const geo = new THREE.CylinderGeometry(0.012, 0.05, 1.1, 6);
        geo.translate(0, -0.55, 0);
        const angle = (i / 5) * Math.PI * 2;
        return {
          geo,
          rotationZ: Math.cos(angle) * 0.85,
          rotationX: Math.sin(angle) * 0.85,
        };
      }),
    [],
  );

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    const grow = growRef.current;
    const ease = grow < 1 ? 1 - Math.pow(1 - grow, 3) : 1;
    group.scale.y = Math.max(0.001, ease);
    if (tipMaterialRef.current) tipMaterialRef.current.opacity = ease;
  });

  return (
    <group ref={groupRef} position={[0, -2.9, 0]}>
      <mesh geometry={trunkGeometry} material={trunkMaterial} />
      {roots.map((root, i) => (
        <mesh
          key={i}
          geometry={root.geo}
          material={trunkMaterial}
          rotation={[root.rotationX, 0, root.rotationZ]}
        />
      ))}
      <mesh position={[0, 5.85, 0]}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshBasicMaterial ref={tipMaterialRef} color={accent} transparent opacity={0} />
      </mesh>
    </group>
  );
}

function OrbitRings({ accent }: { accent: string }) {
  return (
    <>
      {TIERS.map((tier, i) => (
        <mesh key={i} position={[0, tier.y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[tier.r, 0.005, 8, 90]} />
          <meshBasicMaterial color={accent} transparent opacity={0.16} />
        </mesh>
      ))}
    </>
  );
}

function TechLights({ accent }: { accent: string }) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <pointLight color={accent} intensity={1.1} distance={40} position={[3, 5, 5]} />
      <pointLight color={0xffffff} intensity={0.35} distance={40} position={[-4, -2, 4]} />
    </>
  );
}

function DragCatcher({
  rotYTargetRef,
  tiltTargetRef,
  dragMovedRef,
}: {
  rotYTargetRef: MutableRefObject<number>;
  tiltTargetRef: MutableRefObject<number>;
  dragMovedRef: MutableRefObject<number>;
}) {
  const draggingRef = useRef(false);
  const lastRef = useRef({ x: 0, y: 0 });

  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    draggingRef.current = true;
    dragMovedRef.current = 0;
    lastRef.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!draggingRef.current) return;
    const dx = event.clientX - lastRef.current.x;
    const dy = event.clientY - lastRef.current.y;
    lastRef.current = { x: event.clientX, y: event.clientY };
    dragMovedRef.current += Math.abs(dx) + Math.abs(dy);
    rotYTargetRef.current += dx * 0.006;
    tiltTargetRef.current = Math.max(
      -0.5,
      Math.min(0.5, tiltTargetRef.current + dy * 0.003),
    );
  };
  const onPointerUp = () => {
    draggingRef.current = false;
  };

  return (
    <mesh
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerOut={onPointerUp}
    >
      <sphereGeometry args={[20, 8, 8]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.BackSide} />
    </mesh>
  );
}

function TechCameraRig({
  techs,
  angle0s,
  focusedIndex,
  orbitTimeRef,
  rotYRef,
  tiltRef,
  reducedMotion,
}: {
  techs: TechItem[];
  angle0s: number[];
  focusedIndex: number | null;
  orbitTimeRef: MutableRefObject<number>;
  rotYRef: MutableRefObject<number>;
  tiltRef: MutableRefObject<number>;
  reducedMotion: boolean;
}) {
  const camTarget = useRef(CAMERA_HOME.clone());
  const lookTarget = useRef(new THREE.Vector3(0, 0, 0));
  const look = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(({ camera }) => {
    if (focusedIndex !== null) {
      const tech = techs[focusedIndex];
      const tier = TIERS[tech.tier];
      const localPos = computeTechPosition(
        tier,
        tech.tier,
        angle0s[focusedIndex],
        orbitTimeRef.current,
        focusedIndex,
        reducedMotion,
      );
      const euler = new THREE.Euler(tiltRef.current * 0.4, rotYRef.current, 0);
      const worldPos = localPos.clone().applyEuler(euler);
      const dir = worldPos
        .clone()
        .sub(new THREE.Vector3(0, worldPos.y, 0))
        .normalize();
      camTarget.current
        .copy(worldPos)
        .add(dir.multiplyScalar(2.1))
        .add(new THREE.Vector3(0, 0.35, 0));
      lookTarget.current.copy(worldPos);
    } else {
      camTarget.current.copy(CAMERA_HOME);
      lookTarget.current.set(0, 0, 0);
    }
    camera.position.lerp(camTarget.current, 0.06);
    look.current.lerp(lookTarget.current, 0.08);
    camera.lookAt(look.current);
  });

  return null;
}

interface TechWorldProps {
  techs: TechItem[];
  accent: string;
  reducedMotion: boolean;
  growStarted: boolean;
  focusedIndex: number | null;
  onFocus: (index: number | null) => void;
}

const TechWorld = forwardRef<TechSceneHandle, TechWorldProps>(
  function TechWorld(
    { techs, accent, reducedMotion, growStarted, focusedIndex, onFocus },
    ref,
  ) {
    const worldGroupRef = useRef<THREE.Group>(null);
    const growRef = useRef(0);
    const orbitTimeRef = useRef(0);
    const rotYRef = useRef(0);
    const rotYTargetRef = useRef(0);
    const tiltRef = useRef(0);
    const tiltTargetRef = useRef(0);
    const dragMovedRef = useRef(0);

    const angle0s = useMemo(() => {
      const perTier = [0, 0, 0];
      techs.forEach((tech) => perTier[tech.tier]++);
      const counters = [0, 0, 0];
      return techs.map((tech) => {
        const angle = (counters[tech.tier] / perTier[tech.tier]) * Math.PI * 2;
        counters[tech.tier]++;
        return angle;
      });
    }, [techs]);

    useImperativeHandle(
      ref,
      () => ({
        focusTech: (index: number) => onFocus(index),
        closeFocus: () => onFocus(null),
        setRotationTarget: (rotY: number, tilt: number) => {
          rotYTargetRef.current = rotY;
          tiltTargetRef.current = Math.max(-0.5, Math.min(0.5, tilt));
        },
      }),
      [onFocus],
    );

    useFrame((_, delta) => {
      if (growStarted && growRef.current < 1) {
        growRef.current = reducedMotion
          ? 1
          : Math.min(1, growRef.current + delta * 0.7);
      }
      if (focusedIndex === null && !reducedMotion) {
        orbitTimeRef.current += delta * 0.18;
      }
      rotYRef.current += (rotYTargetRef.current - rotYRef.current) * 0.07;
      tiltRef.current += (tiltTargetRef.current - tiltRef.current) * 0.07;
      const group = worldGroupRef.current;
      if (group) {
        group.rotation.y = rotYRef.current;
        group.rotation.x = tiltRef.current * 0.4;
      }
    });

    return (
      <>
        <TechLights accent={accent} />
        <DragCatcher
          rotYTargetRef={rotYTargetRef}
          tiltTargetRef={tiltTargetRef}
          dragMovedRef={dragMovedRef}
        />
        <group ref={worldGroupRef}>
          <TechTrunk accent={accent} growRef={growRef} />
          <OrbitRings accent={accent} />
          {techs.map((tech, index) => (
            <TechMesh
              key={tech.label}
              tech={tech}
              index={index}
              angle0={angle0s[index]}
              accent={accent}
              reducedMotion={reducedMotion}
              focused={focusedIndex === index}
              dimmed={focusedIndex !== null && focusedIndex !== index}
              growRef={growRef}
              orbitTimeRef={orbitTimeRef}
              dragMovedRef={dragMovedRef}
              onSelect={onFocus}
            />
          ))}
        </group>
        <TechCameraRig
          techs={techs}
          angle0s={angle0s}
          focusedIndex={focusedIndex}
          orbitTimeRef={orbitTimeRef}
          rotYRef={rotYRef}
          tiltRef={tiltRef}
          reducedMotion={reducedMotion}
        />
      </>
    );
  },
);

export const TechScene = forwardRef<TechSceneHandle, TechSceneProps>(
  function TechScene(
    { techs, accent, reducedMotion, visible, focusedIndex, onFocus },
    ref,
  ) {
    // `growStarted` latches to true the first time `visible` becomes true and
    // never resets, so the growth animation only ever plays once. Deriving it
    // with guarded state updates during render (rather than a ref mutated
    // during render) follows the documented React pattern for this and keeps
    // the value available for the very first visible render.
    const [growStarted, setGrowStarted] = useState(false);
    if (visible && !growStarted) setGrowStarted(true);

    return (
      <Canvas
        style={{ display: "block", width: "100%", height: "100%" }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
        camera={{ fov: 50, near: 0.1, far: 100, position: [0, 0.7, 8.4] }}
        frameloop={visible ? "always" : "never"}
      >
        <TechWorld
          ref={ref}
          techs={techs}
          accent={accent}
          reducedMotion={reducedMotion}
          growStarted={growStarted}
          focusedIndex={focusedIndex}
          onFocus={onFocus}
        />
      </Canvas>
    );
  },
);
