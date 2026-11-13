import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { geometryGroup } from "@/components/graduation/shared/three/geometry-group";

describe("geometryGroup", () => {
  const hex = new THREE.CylinderGeometry(0.475, 0.475, 1, 6);

  it("keeps only the triangles of that group", () => {
    expect(hex.groups.map((g) => g.count)).toEqual([36, 18, 18]);
    expect(geometryGroup(hex, 0).index!.count).toBe(36);
    expect(geometryGroup(hex, 1).index!.count).toBe(18);
  });

  it("takes the top cap, whose normals all point up", () => {
    const top = geometryGroup(hex, 1);
    const normal = top.attributes.normal;
    for (const i of top.index!.array) expect(normal.getY(i)).toBeCloseTo(1);
  });

  it("does not share attributes with the source", () => {
    expect(geometryGroup(hex, 0).attributes.position).not.toBe(hex.attributes.position);
  });

  it("rejects a missing group", () => {
    expect(() => geometryGroup(hex, 5)).toThrow();
  });
});
