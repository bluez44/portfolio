import * as THREE from "three";
import type { GeometryCache } from "../shared/three/geometry-cache";
import { geometryGroup } from "../shared/three/geometry-group";

export type HoneycombCell = { x: number; y: number; z: number; top: number };

export type Honeycomb = {
  group: THREE.Group;
  /** Tweened by the wake timeline; `sync` pushes them to the GPU. */
  heights: { y: number }[];
  sync(): void;
  applyTopColors(colors: readonly string[]): void;
  dispose(): void;
};

type Look = { radius: number; outline: number; side: THREE.Material; top: THREE.Material; outlineMaterial: THREE.Material };

const CELL_STRETCH = 3;

/** The intro's hex cells as three draws (bodies, tops, outlines); the never-seen bottom caps are left out. */
export function createHoneycomb(cells: readonly HoneycombCell[], look: Look, geometries: GeometryCache): Honeycomb {
  const prism = geometries.get(`hex-cell:${look.radius}`, () => new THREE.CylinderGeometry(look.radius, look.radius, 1, 6).translate(0, -0.5, 0));
  const body = new THREE.InstancedMesh(geometries.get(`hex-cell-body:${look.radius}`, () => geometryGroup(prism, 0)), look.side, cells.length);
  const tops = new THREE.InstancedMesh(geometries.get(`hex-cell-top:${look.radius}`, () => geometryGroup(prism, 1)), look.top, cells.length);
  const outlines = new THREE.InstancedMesh(geometries.outline(prism, look.outline), look.outlineMaterial, cells.length);
  const meshes = [body, tops, outlines];
  const group = new THREE.Group();
  for (const mesh of meshes) {
    // Cells fall far below their starting bounds during the wake, so a cached bounding sphere would cull them early.
    mesh.frustumCulled = false;
    group.add(mesh);
  }

  const heights = cells.map((c) => ({ y: c.y }));
  const placement = new THREE.Object3D();
  placement.scale.set(1, CELL_STRETCH, 1);
  const sync = () => {
    cells.forEach((cell, i) => {
      placement.position.set(cell.x, heights[i].y, cell.z);
      placement.updateMatrix();
      for (const mesh of meshes) mesh.setMatrixAt(i, placement.matrix);
    });
    for (const mesh of meshes) mesh.instanceMatrix.needsUpdate = true;
  };
  sync();

  const color = new THREE.Color();
  return {
    group,
    heights,
    sync,
    applyTopColors(colors) {
      cells.forEach((cell, i) => tops.setColorAt(i, color.set(colors[cell.top])));
      tops.instanceColor!.needsUpdate = true;
    },
    dispose() {
      meshes.forEach((mesh) => mesh.dispose());
    },
  };
}
