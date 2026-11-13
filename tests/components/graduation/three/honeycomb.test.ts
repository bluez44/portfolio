import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { createHoneycomb } from "@/components/graduation/intro/honeycomb";
import { createGeometryCache } from "@/components/graduation/shared/three/geometry-cache";

const CELLS = [
  { x: 0, y: 0.72, z: 0, top: 0 },
  { x: 1, y: 0.3, z: 0, top: 1 },
  { x: 0, y: 0.4, z: 1, top: 0 },
];
const make = () =>
  createHoneycomb(
    CELLS,
    { radius: 0.475, outline: 0.022, side: new THREE.MeshBasicMaterial(), top: new THREE.MeshBasicMaterial(), outlineMaterial: new THREE.MeshBasicMaterial() },
    createGeometryCache(),
  );
const meshes = (h: ReturnType<typeof make>) => h.group.children as THREE.InstancedMesh[];

describe("createHoneycomb", () => {
  it("draws all cells in three instanced meshes", () => {
    const h = make();
    expect(meshes(h)).toHaveLength(3);
    for (const mesh of meshes(h)) {
      expect(mesh).toBeInstanceOf(THREE.InstancedMesh);
      expect(mesh.count).toBe(3);
      expect(mesh.frustumCulled).toBe(false);
    }
  });

  it("places each cell at its height, three times taller", () => {
    const h = make();
    h.heights[1].y = -2;
    h.sync();
    const m = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const scale = new THREE.Vector3();
    for (const mesh of meshes(h)) {
      mesh.getMatrixAt(1, m);
      m.decompose(position, new THREE.Quaternion(), scale);
      expect(position.toArray()).toEqual([1, -2, 0]);
      expect(scale.y).toBe(3);
    }
  });

  it("starts at the given heights", () => {
    expect(make().heights.map((c) => c.y)).toEqual([0.72, 0.3, 0.4]);
  });

  it("colours each top by its index and recolours on theme change", () => {
    const h = make();
    const tops = meshes(h)[1];
    const c = new THREE.Color();
    h.applyTopColors(["#ff0000", "#00ff00"]);
    tops.getColorAt(1, c);
    expect(c.getHexString()).toBe("00ff00");
    h.applyTopColors(["#0000ff", "#ffffff"]);
    tops.getColorAt(0, c);
    expect(c.getHexString()).toBe("0000ff");
  });

  it("leaves no bottom cap on the cell body", () => {
    const body = meshes(make())[0];
    expect(body.geometry.index!.count).toBe(36);
  });
});
