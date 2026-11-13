import * as THREE from "three";
import type { GeometryCache } from "./geometry-cache";

type Shape<G extends THREE.BufferGeometry> = new (...args: never[]) => G;

export type Primitives = {
  sphere(...args: ConstructorParameters<typeof THREE.SphereGeometry>): THREE.SphereGeometry;
  box(...args: ConstructorParameters<typeof THREE.BoxGeometry>): THREE.BoxGeometry;
  cylinder(...args: ConstructorParameters<typeof THREE.CylinderGeometry>): THREE.CylinderGeometry;
  cone(...args: ConstructorParameters<typeof THREE.ConeGeometry>): THREE.ConeGeometry;
  torus(...args: ConstructorParameters<typeof THREE.TorusGeometry>): THREE.TorusGeometry;
  circle(...args: ConstructorParameters<typeof THREE.CircleGeometry>): THREE.CircleGeometry;
  plane(...args: ConstructorParameters<typeof THREE.PlaneGeometry>): THREE.PlaneGeometry;
};

export function createPrimitives(cache: GeometryCache): Primitives {
  const shape =
    <G extends THREE.BufferGeometry>(name: string, Geometry: Shape<G>) =>
    (...args: unknown[]) =>
      cache.get(`${name}:${args.join(",")}`, () => new Geometry(...(args as never[])));

  return {
    sphere: shape("sphere", THREE.SphereGeometry),
    box: shape("box", THREE.BoxGeometry),
    cylinder: shape("cylinder", THREE.CylinderGeometry),
    cone: shape("cone", THREE.ConeGeometry),
    torus: shape("torus", THREE.TorusGeometry),
    circle: shape("circle", THREE.CircleGeometry),
    plane: shape("plane", THREE.PlaneGeometry),
  };
}
