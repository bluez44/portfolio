import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { createMaterials } from "@/components/graduation/character/scene/materials";
import { createMeshKit } from "@/components/graduation/character/scene/mesh-kit";
import { buildRig } from "@/components/graduation/character/scene/rig";
import { createGeometryCache } from "@/components/graduation/shared/three/geometry-cache";
import { findDuplicateGeometries } from "./find-duplicate-geometries";

const PALETTE = { paper: "#f6f1e7", paper2: "#efe8da", paper3: "#e5dccb", ink: "#1c1b1f", tomato: "#e8543a", canary: "#f2c230", blue: "#2f5fb3", jade: "#2e9e7a" };

describe("buildRig", () => {
  it("builds each shape of the figure and its bee once", () => {
    const M = createMaterials(PALETTE);
    const scene = new THREE.Scene();
    buildRig(scene, createMeshKit(M.outline, createGeometryCache()), M, PALETTE);
    expect(findDuplicateGeometries(scene)).toEqual([]);
  });

  it("keeps every mesh", () => {
    const M = createMaterials(PALETTE);
    const scene = new THREE.Scene();
    buildRig(scene, createMeshKit(M.outline, createGeometryCache()), M, PALETTE);
    let meshes = 0;
    scene.traverse((o) => (o instanceof THREE.Mesh ? meshes++ : undefined));
    expect(meshes).toBe(85);
  });
});
