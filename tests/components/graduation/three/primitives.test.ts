import { describe, expect, it } from "vitest";
import { createGeometryCache } from "@/components/graduation/shared/three/geometry-cache";
import { createPrimitives } from "@/components/graduation/shared/three/primitives";

describe("createPrimitives", () => {
  it("returns one geometry per shape and arguments", () => {
    const geo = createPrimitives(createGeometryCache());
    expect(geo.sphere(0.05, 12, 10)).toBe(geo.sphere(0.05, 12, 10));
    expect(geo.box(0.1, 0.72, 0.04)).toBe(geo.box(0.1, 0.72, 0.04));
  });

  it("tells shapes and arguments apart", () => {
    const geo = createPrimitives(createGeometryCache());
    expect(geo.sphere(0.05, 12, 10)).not.toBe(geo.sphere(0.05, 12, 8));
    expect(geo.cylinder(1, 1, 1, 6)).not.toBe(geo.cone(1, 1, 6));
  });

  it("builds the shape it is named after", () => {
    const geo = createPrimitives(createGeometryCache());
    expect(geo.torus(0.06, 0.014, 6, 14, Math.PI).parameters).toMatchObject({ radius: 0.06, tube: 0.014, arc: Math.PI });
  });
});
