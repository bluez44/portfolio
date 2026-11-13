import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { createMeshKit } from "@/components/graduation/character/scene/mesh-kit";
import { createGeometryCache } from "@/components/graduation/shared/three/geometry-cache";

describe("createMeshKit", () => {
  it("shares the outline of a repeated shape", () => {
    const k = createMeshKit(new THREE.MeshBasicMaterial(), createGeometryCache());
    const root = new THREE.Group();
    const a = k.add(root, k.down(0.1, 0.125, 0.42), new THREE.MeshBasicMaterial());
    const b = k.add(root, k.down(0.1, 0.125, 0.42), new THREE.MeshBasicMaterial());
    expect(a.geometry).toBe(b.geometry);
    expect((a.children[0] as THREE.Mesh).geometry).toBe((b.children[0] as THREE.Mesh).geometry);
  });

  it("keeps hanging, standing and plain cylinders apart", () => {
    const k = createMeshKit(new THREE.MeshBasicMaterial(), createGeometryCache());
    const down = k.down(0.1, 0.1, 0.5, 18);
    const up = k.up(0.1, 0.1, 0.5, 18);
    const plain = k.geo.cylinder(0.1, 0.1, 0.5, 18);
    expect(new Set([down, up, plain]).size).toBe(3);
    down.computeBoundingBox();
    expect(down.boundingBox!.max.y).toBeCloseTo(0);
  });
});
