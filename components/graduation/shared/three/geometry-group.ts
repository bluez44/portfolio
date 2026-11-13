import * as THREE from "three";

export function geometryGroup(source: THREE.BufferGeometry, groupIndex: number): THREE.BufferGeometry {
  const group = source.groups[groupIndex];
  const index = source.getIndex();
  if (!group || !index) throw new Error(`Geometry has no indexed group ${groupIndex}`);
  const part = new THREE.BufferGeometry();
  for (const [name, attribute] of Object.entries(source.attributes)) part.setAttribute(name, attribute.clone());
  part.setIndex(Array.from(index.array.slice(group.start, group.start + group.count)));
  return part;
}
