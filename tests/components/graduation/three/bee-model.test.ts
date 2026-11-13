import * as THREE from "three";
import { describe, expect, it, vi } from "vitest";
import { createBeeModel } from "@/components/graduation/shared/three/bee-model";
import { createGeometryCache } from "@/components/graduation/shared/three/geometry-cache";
import { toonGradient } from "@/components/graduation/shared/three/toon";
import { findDuplicateGeometries } from "./find-duplicate-geometries";

const PALETTE = { paper: "#f6f1e7", paper2: "#efe8da", paper3: "#e5dccb", ink: "#1c1b1f", tomato: "#e8543a", canary: "#f2c230", blue: "#2f5fb3", jade: "#2e9e7a" };
const build = () => createBeeModel(toonGradient([120, 200, 255]), new THREE.MeshBasicMaterial({ side: THREE.BackSide }), PALETTE, createGeometryCache());

describe("createBeeModel", () => {
  it("builds each shape once", () => {
    expect(findDuplicateGeometries(build().group)).toEqual([]);
  });

  it("keeps the same parts", () => {
    const bee = build();
    let meshes = 0;
    bee.group.traverse((o) => (o instanceof THREE.Mesh ? meshes++ : undefined));
    expect(meshes).toBe(18);
    expect(bee.eyes).toHaveLength(2);
    expect(bee.wings).toHaveLength(2);
  });

  it("leaves geometry to the cache owner on dispose", () => {
    const geometries = createGeometryCache();
    const bee = createBeeModel(toonGradient([120, 200, 255]), new THREE.MeshBasicMaterial(), PALETTE, geometries);
    const disposed = vi.fn();
    bee.head.geometry.addEventListener("dispose", disposed);
    bee.dispose();
    expect(disposed).not.toHaveBeenCalled();
    geometries.dispose();
    expect(disposed).toHaveBeenCalledOnce();
  });
});
