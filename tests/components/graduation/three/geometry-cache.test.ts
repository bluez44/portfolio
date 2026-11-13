import * as THREE from "three";
import { describe, expect, it, vi } from "vitest";
import { createGeometryCache } from "@/components/graduation/shared/three/geometry-cache";

describe("createGeometryCache", () => {
  it("builds each key once", () => {
    const cache = createGeometryCache();
    const build = vi.fn(() => new THREE.BoxGeometry(1, 1, 1));
    expect(cache.get("box", build)).toBe(cache.get("box", build));
    expect(build).toHaveBeenCalledOnce();
  });

  it("keeps different keys apart", () => {
    const cache = createGeometryCache();
    expect(cache.get("a", () => new THREE.BoxGeometry(1, 1, 1))).not.toBe(cache.get("b", () => new THREE.BoxGeometry(1, 1, 1)));
  });

  it("shares one outline per geometry and thickness", () => {
    const cache = createGeometryCache();
    const geo = new THREE.SphereGeometry(1, 8, 6);
    expect(cache.outline(geo, 0.02)).toBe(cache.outline(geo, 0.02));
    expect(cache.outline(geo, 0.02)).not.toBe(cache.outline(geo, 0.03));
    expect(cache.outline(geo, 0.02)).not.toBe(geo);
  });

  it("disposes everything it built, twice without error, then rebuilds", () => {
    const cache = createGeometryCache();
    const geo = cache.get("s", () => new THREE.SphereGeometry(1, 8, 6));
    const hull = cache.outline(geo, 0.02);
    const disposed = vi.fn();
    geo.addEventListener("dispose", disposed);
    hull.addEventListener("dispose", disposed);
    cache.dispose();
    cache.dispose();
    expect(disposed).toHaveBeenCalledTimes(2);
    expect(cache.get("s", () => new THREE.SphereGeometry(1, 8, 6))).not.toBe(geo);
  });
});
