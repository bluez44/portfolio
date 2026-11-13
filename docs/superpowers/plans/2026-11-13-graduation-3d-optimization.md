# Tối ưu model 3D trang /graduation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bỏ các geometry bị dựng trùng lặp và các draw call thừa trong ba model 3D dựng bằng code của trang `/graduation`, mà hình ảnh hiển thị không đổi.

**Architecture:** Mỗi scene có một `GeometryCache` riêng. Cache này trả lại cùng một geometry cho cùng một hình, và dùng chung outline (inverted hull) cho cùng một geometry và độ dày. Nhân vật và con ong lấy geometry qua cache thay vì gọi `new THREE.*Geometry` trực tiếp. Tổ ong ở intro chuyển từ 61 mesh (mỗi mesh 4 draw call) sang 3 `InstancedMesh`; màu mặt trên của từng ô đặt bằng instance color.

**Tech Stack:** three 0.185.1, TypeScript, vitest (môi trường `node`), gsap.

**Spec:** Không có spec riêng. Cơ sở của plan là phần "Hiện trạng đo được" bên dưới, được đo bằng cách dựng lại các model trong Node ngày 2026-11-13.

## Hiện trạng đo được

Trang không tải file model nào: `public/stylized_tree/scene.gltf` chỉ dùng ở portfolio (`components/portfolio/tech-scene.tsx`). Ba model đều dựng bằng code.

| Model | File | Mesh | Draw call | Tam giác | Geometry tải lên GPU | Geometry trùng |
|---|---|---|---|---|---|---|
| Nhân vật (kèm con ong) | `components/graduation/character/scene/rig.ts` | 85 (34 outline) | 85 | 13.684 (outline 5.892) | 85 | 13 cặp hình gốc + 8 cặp outline |
| Con ong (1 bản) | `components/graduation/shared/three/bee-model.ts` | 18 (5 outline) | 18 | 4.960 | 18 | 4 cặp hình gốc + 1 cặp outline |
| Tổ ong intro | `components/graduation/intro/bee-intro-scene.ts` | 122 (61 ô + 61 outline) | **244** | 2.928 | 2 | 0 |

Con ong được dựng 3 lần, mỗi lần trong một WebGL renderer riêng: intro, nhân vật và ong đưa thư (`components/graduation/wishes/bee-scene.ts`).

Các geometry trùng là những cặp đối xứng trái phải dựng hai lần với cùng tham số:
- hai chân (đùi, cẳng, giày), hai tay (bắp tay, cẳng tay, bàn tay), hai dải khăn;
- ở mặt nhân vật: hai mắt, hai má;
- ở con ong: hai mắt, hai râu, hai đầu râu, hai cánh.

Ngoài ra, mỗi lần gọi `add` có outline đều clone và "thổi phồng" lại geometry (`outlineGeometry`), kể cả khi geometry gốc giống hệt một cái đã làm trước đó.

Mỗi ô tổ ong là một mesh có 3 nhóm vật liệu (thân, mặt trên, mặt đáy) cộng một mesh outline, nên tốn 4 draw call. Mặt đáy không bao giờ được nhìn thấy.

**Kết quả mong đợi sau plan:**
- Nhân vật: 64 geometry thay vì 85. Draw call giữ nguyên 85 (xem "Không làm").
- Con ong: 13 geometry thay vì 18.
- Tổ ong: 3 draw call thay vì 244. Mặt đáy của ô không còn được vẽ.

## Không làm (và vì sao)

- **Giảm số đoạn (segments) của sphere/cylinder:** sẽ làm đường viền và bóng đổ thay đổi, trái với mục tiêu giữ nguyên hình ảnh.
- **Bỏ đùi nằm trong váy:** khi ngồi (`sit`, `components/graduation/character/scene/pose.ts:84-88`), chân xoay ngang và váy co lại, nên đùi lộ ra.
- **Gộp ba toon gradient (`[110,190,255]`, `[120,200,255]`, `[122,196,255]`) thành một:** sẽ đổi màu đổ bóng. Ngoài ra mỗi renderer vẫn phải tải texture riêng, nên gộp không tiết kiệm được gì.
- **Gộp ba WebGL renderer thành một:** đây là thay đổi kiến trúc, không thuộc phạm vi tối ưu model.
- **Gộp mesh của nhân vật để giảm draw call:** các bộ phận xoay độc lập theo rig, nên gộp phải chuyển sang skinning. Không làm trong plan này.

## Global Constraints

- Hình ảnh không được đổi: giữ nguyên tham số geometry, số đoạn, màu, gradient, độ dày outline, vị trí và thứ tự gọi `rnd()`.
- Geometry lấy từ cache không bao giờ được biến đổi sau khi lấy (`translate`, `rotate`, `scale`, `applyMatrix4`). Mọi biến đổi phải nằm bên trong hàm `build` truyền cho `cache.get`. Muốn co giãn thì dùng `mesh.scale`.
- Chỉ người tạo cache mới giải phóng geometry, bằng `cache.dispose()`. `BeeModel.dispose()` chỉ giải phóng vật liệu.
- Tuân thủ SOLID và tái sử dụng code tối đa. Mỗi file chỉ một trách nhiệm, chia càng nhỏ càng tốt.
- Không comment lung tung. Chỉ comment khi lý do không tự đọc ra được từ code. Không comment kiểu kể lại code làm gì.
- Không sửa `components/preview/*` và `components/portfolio/*`.
- Không sửa hoặc stage `docs/mobile-fix-plan.md`.
- Không tắt dev server ở cổng 3000, không chạy lệnh Prisma.
- Mỗi task một commit. Cuối mỗi commit message, sau một dòng trống, có đúng hai dòng:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01JvSBxKetjoRWNxLi74rKVy
  ```
- Sau mỗi task chạy `npx tsc --noEmit -p .`, kết quả phải là 0 lỗi. Với `npx vitest run`, chỉ được phép còn 2 lỗi có sẵn: `beats.test.ts` và `target-pose.test.ts`.

## Review Focus

1. **Đổi theme khi intro đang chạy:** màu mặt trên của ô phải đổi theo. Test `applyTopColors` ở Task 6 kiểm tra điều này.
2. **React StrictMode mount, dispose rồi mount lại:** `cache.dispose()` gọi hai lần không được lỗi, và sau `dispose()` thì `get` phải dựng geometry mới. Test ở Task 1.
3. **Geometry đã biến đổi (`down`, `up`, dải bụng ong) có cùng tham số với geometry gốc:** chúng phải là hai instance khác nhau, không được trả nhầm geometry gốc. Test ở Task 2 và Task 4.
4. **Ô tổ ong vẫn rơi khi ong bay đi:** `heights` được tween, sau đó `sync()` phải ghi vị trí mới vào matrix. Test ở Task 6.
5. **Bounding sphere cũ khi ô rơi xuống:** nếu để frustum culling dựa trên bounding sphere cũ thì cả cụm ô có thể biến mất cùng lúc. Ba `InstancedMesh` phải có `frustumCulled === false`. Test ở Task 6.

## File Structure

| File | Trạng thái | Trách nhiệm |
|---|---|---|
| `components/graduation/shared/three/outline-geometry.ts` | Tạo (chuyển từ `mesh-kit.ts`) | Thổi phồng geometry theo pháp tuyến để làm outline |
| `components/graduation/shared/three/geometry-cache.ts` | Tạo | Nhớ geometry theo key, nhớ outline theo (geometry, độ dày), giải phóng tất cả |
| `components/graduation/shared/three/primitives.ts` | Tạo | Hàm dựng sphere, box, cylinder… qua cache, key theo tham số |
| `components/graduation/shared/three/geometry-group.ts` | Tạo | Tách một nhóm (group) của geometry thành geometry riêng |
| `components/graduation/intro/honeycomb.ts` | Tạo | Tổ ong dạng instanced: matrix, màu mặt trên, dispose |
| `components/graduation/character/scene/mesh-kit.ts` | Sửa | Dùng cache cho outline, `down` và `up`; có thêm `geo` và `cache` |
| `components/graduation/character/scene/rig.ts` | Sửa | Lấy geometry qua `k.geo` thay vì `new THREE.*Geometry` |
| `components/graduation/character/scene/grad-character.ts` | Sửa | Tạo cache và giải phóng bằng cache |
| `components/graduation/shared/three/bee-model.ts` | Sửa | Nhận `GeometryCache`; chỉ giải phóng vật liệu |
| `components/graduation/wishes/bee-scene.ts` | Sửa | Tạo cache, truyền cho con ong, giải phóng cache |
| `components/graduation/intro/bee-intro-scene.ts` | Sửa | Dùng `createHoneycomb` và cache |
| `tests/components/graduation/three/find-duplicate-geometries.ts` | Tạo | Hàm hỗ trợ test: liệt kê geometry giống hệt nhau nhưng khác instance |
| `tests/components/graduation/three/*.test.ts` | Tạo | Test cho từng file mới hoặc file bị sửa |

---

### Task 1: Chuyển `outlineGeometry` ra file riêng và tạo `GeometryCache`

**Files:**
- Create: `components/graduation/shared/three/outline-geometry.ts`
- Create: `components/graduation/shared/three/geometry-cache.ts`
- Modify: `components/graduation/character/scene/mesh-kit.ts` (xóa hàm `outlineGeometry` ở dòng 12-21, import từ file mới)
- Modify: `components/graduation/shared/three/bee-model.ts:2` (đổi import)
- Modify: `components/graduation/intro/bee-intro-scene.ts:3` (đổi import)
- Test: `tests/components/graduation/three/geometry-cache.test.ts`

**Interfaces:**
- Produces: `outlineGeometry(geo: THREE.BufferGeometry, t: number): THREE.BufferGeometry`
- Produces: `type GeometryCache = { get<T extends THREE.BufferGeometry>(key: string, build: () => T): T; outline(geo: THREE.BufferGeometry, thickness: number): THREE.BufferGeometry; dispose(): void }`
- Produces: `createGeometryCache(): GeometryCache`

- [ ] **Step 1: Kiểm tra trước**

Run: `grep -rn "outlineGeometry" components tests`
Expected: chỉ có 3 file import là `mesh-kit.ts` (nơi định nghĩa), `bee-model.ts` và `bee-intro-scene.ts`. Nếu còn file khác thì dừng lại và báo, không tự sửa.

- [ ] **Step 2: Viết test (sẽ fail)**

`tests/components/graduation/three/geometry-cache.test.ts`:
```ts
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
```

- [ ] **Step 3: Chạy test để thấy fail**

Run: `npx vitest run tests/components/graduation/three/geometry-cache.test.ts`
Expected: FAIL vì không tìm thấy module `geometry-cache`.

- [ ] **Step 4: Tạo `outline-geometry.ts`**

Chuyển nguyên văn hàm từ `mesh-kit.ts`, giữ nguyên doc comment:
```ts
import * as THREE from "three";

/** Inflates a geometry along its normals for the inverted-hull outline. */
export function outlineGeometry(geo: THREE.BufferGeometry, t: number): THREE.BufferGeometry {
  const o = geo.clone();
  const p = o.attributes.position;
  const n = o.attributes.normal;
  for (let i = 0; i < p.count; i++) {
    p.setXYZ(i, p.getX(i) + n.getX(i) * t, p.getY(i) + n.getY(i) * t, p.getZ(i) + n.getZ(i) * t);
  }
  return o;
}
```
Trong `mesh-kit.ts`: xóa hàm `outlineGeometry` và thêm `import { outlineGeometry } from "../../shared/three/outline-geometry";`.
Trong `bee-model.ts` và `bee-intro-scene.ts`: đổi `import { outlineGeometry } from "../../character/scene/mesh-kit";` (với intro là `"../character/scene/mesh-kit"`) thành import từ `outline-geometry`. Đường dẫn tương đối là `"./outline-geometry"` cho `bee-model.ts` và `"../shared/three/outline-geometry"` cho `bee-intro-scene.ts`.

- [ ] **Step 5: Tạo `geometry-cache.ts`**

```ts
import * as THREE from "three";
import { outlineGeometry } from "./outline-geometry";

/** One instance per distinct shape in a scene; the owner disposes them all at once. */
export type GeometryCache = {
  get<T extends THREE.BufferGeometry>(key: string, build: () => T): T;
  outline(geo: THREE.BufferGeometry, thickness: number): THREE.BufferGeometry;
  dispose(): void;
};

export function createGeometryCache(): GeometryCache {
  const byKey = new Map<string, THREE.BufferGeometry>();
  const outlines = new Map<THREE.BufferGeometry, Map<number, THREE.BufferGeometry>>();

  return {
    get<T extends THREE.BufferGeometry>(key: string, build: () => T): T {
      let geo = byKey.get(key);
      if (!geo) {
        geo = build();
        byKey.set(key, geo);
      }
      return geo as T;
    },
    outline(geo, thickness) {
      let byThickness = outlines.get(geo);
      if (!byThickness) {
        byThickness = new Map();
        outlines.set(geo, byThickness);
      }
      let hull = byThickness.get(thickness);
      if (!hull) {
        hull = outlineGeometry(geo, thickness);
        byThickness.set(thickness, hull);
      }
      return hull;
    },
    dispose() {
      byKey.forEach((geo) => geo.dispose());
      outlines.forEach((byThickness) => byThickness.forEach((hull) => hull.dispose()));
      byKey.clear();
      outlines.clear();
    },
  };
}
```

- [ ] **Step 6: Chạy test, tsc**

Run: `npx vitest run tests/components/graduation/three/geometry-cache.test.ts` → PASS (4 test).
Run: `npx tsc --noEmit -p .` → 0 lỗi.

- [ ] **Step 7: Commit**

```bash
git add components/graduation/shared/three/outline-geometry.ts components/graduation/shared/three/geometry-cache.ts components/graduation/character/scene/mesh-kit.ts components/graduation/shared/three/bee-model.ts components/graduation/intro/bee-intro-scene.ts tests/components/graduation/three/geometry-cache.test.ts
git commit -m "refactor(graduation): geometry cache with shared outline hulls"
```

---

### Task 2: Hàm dựng primitive qua cache

**Files:**
- Create: `components/graduation/shared/three/primitives.ts`
- Test: `tests/components/graduation/three/primitives.test.ts`

**Interfaces:**
- Consumes: `GeometryCache` (Task 1)
- Produces:
  ```ts
  type Primitives = {
    sphere(...args: ConstructorParameters<typeof THREE.SphereGeometry>): THREE.SphereGeometry;
    box(...args: ConstructorParameters<typeof THREE.BoxGeometry>): THREE.BoxGeometry;
    cylinder(...args: ConstructorParameters<typeof THREE.CylinderGeometry>): THREE.CylinderGeometry;
    cone(...args: ConstructorParameters<typeof THREE.ConeGeometry>): THREE.ConeGeometry;
    torus(...args: ConstructorParameters<typeof THREE.TorusGeometry>): THREE.TorusGeometry;
    circle(...args: ConstructorParameters<typeof THREE.CircleGeometry>): THREE.CircleGeometry;
    plane(...args: ConstructorParameters<typeof THREE.PlaneGeometry>): THREE.PlaneGeometry;
  };
  function createPrimitives(cache: GeometryCache): Primitives;
  ```

- [ ] **Step 1: Viết test (sẽ fail)**

`tests/components/graduation/three/primitives.test.ts`:
```ts
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
```

- [ ] **Step 2: Chạy test để thấy fail**

Run: `npx vitest run tests/components/graduation/three/primitives.test.ts`
Expected: FAIL vì không tìm thấy module `primitives`.

- [ ] **Step 3: Tạo `primitives.ts`**

```ts
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
```
`never[]` và `unknown[]` là cố ý: `CylinderGeometry` và `ConeGeometry` có tham số `openEnded` kiểu `boolean`, nên khai báo `number[]` sẽ không qua được `tsc`. Kiểu đúng cho người gọi đã có sẵn trong `Primitives`. Nếu `tsc` vẫn báo lỗi ở file này thì dừng lại và báo nguyên văn lỗi, không đổi chữ ký trong `Primitives`.

- [ ] **Step 4: Chạy test, tsc**

Run: `npx vitest run tests/components/graduation/three/primitives.test.ts` → PASS (3 test).
Run: `npx tsc --noEmit -p .` → 0 lỗi.

- [ ] **Step 5: Commit**

```bash
git add components/graduation/shared/three/primitives.ts tests/components/graduation/three/primitives.test.ts
git commit -m "feat(graduation): cached three primitives"
```

---

### Task 3: Con ong dùng cache

**Files:**
- Create: `tests/components/graduation/three/find-duplicate-geometries.ts`
- Modify: `components/graduation/shared/three/bee-model.ts`
- Modify: `components/graduation/wishes/bee-scene.ts`
- Modify: `components/graduation/intro/bee-intro-scene.ts` (chỉ phần tạo con ong và `dispose`)
- Modify: `components/graduation/character/scene/rig.ts:93` (lời gọi `createBeeModel`)
- Modify: `components/graduation/character/scene/grad-character.ts` (tạo cache, `dispose`)
- Test: `tests/components/graduation/three/bee-model.test.ts`

**Interfaces:**
- Consumes: `GeometryCache`, `createGeometryCache` (Task 1); `createPrimitives` (Task 2)
- Produces: `createBeeModel(gradient: THREE.DataTexture, outline: THREE.Material, palette: RisoPalette, geometries: GeometryCache): BeeModel`. Từ task này, `BeeModel.dispose()` chỉ giải phóng 4 vật liệu.
- Produces (test helper): `findDuplicateGeometries(root: THREE.Object3D): string[]`

- [ ] **Step 1: Tạo hàm hỗ trợ test**

`tests/components/graduation/three/find-duplicate-geometries.ts`:
```ts
import * as THREE from "three";

const signature = (geo: THREE.BufferGeometry) => {
  const p = geo.attributes.position.array;
  let weighted = 0;
  for (let i = 0; i < p.length; i++) weighted += p[i] * ((i % 7) + 1);
  return `${geo.type}:${p.length}:${weighted.toFixed(4)}`;
};

/** Shapes that appear under `root` as more than one geometry instance. */
export function findDuplicateGeometries(root: THREE.Object3D): string[] {
  const bySignature = new Map<string, Set<THREE.BufferGeometry>>();
  root.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    const key = signature(o.geometry);
    bySignature.set(key, (bySignature.get(key) ?? new Set()).add(o.geometry));
  });
  return [...bySignature].filter(([, set]) => set.size > 1).map(([key, set]) => `${set.size}× ${key}`);
}
```

- [ ] **Step 2: Viết test (sẽ fail)**

`tests/components/graduation/three/bee-model.test.ts`:
```ts
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
```

- [ ] **Step 3: Chạy test để thấy fail**

Run: `npx vitest run tests/components/graduation/three/bee-model.test.ts`
Expected: test 1 FAIL và liệt kê 5 dòng `2× …` (2 mắt, 2 thân râu, 2 đầu râu, 2 cánh, 2 outline cánh). Test 3 cũng FAIL vì `dispose` hiện vẫn giải phóng geometry. Có thể có thêm lỗi kiểu do tham số thứ 4; điều đó không sao.

- [ ] **Step 4: Sửa `bee-model.ts`**

Thêm import:
```ts
import type { GeometryCache } from "./geometry-cache";
import { createPrimitives } from "./primitives";
```
Bỏ import `outlineGeometry`.
Đổi chữ ký thành `export function createBeeModel(gradient: THREE.DataTexture, outline: THREE.Material, palette: RisoPalette, geometries: GeometryCache): BeeModel {`, rồi thêm ngay đầu thân hàm `const geo = createPrimitives(geometries);`.
Trong hàm `add`, đổi `outlineGeometry(geo, line)` thành `geometries.outline(geometry, line)`, và đổi tên tham số thứ hai của `add` từ `geo` thành `geometry` để khỏi trùng với biến `geo` mới. Thân `add` sau khi sửa:
```ts
  const add = (parent: THREE.Object3D, geometry: THREE.BufferGeometry, mat: THREE.Material, pos?: Vec3 | null, rot?: Vec3 | null, scale?: Vec3 | null, line = 1.3) => {
    const mesh = new THREE.Mesh(geometry, mat);
    if (line) mesh.add(new THREE.Mesh(geometries.outline(geometry, line), outline));
    if (pos) mesh.position.set(...pos);
    if (rot) mesh.rotation.set(...rot);
    if (scale) mesh.scale.set(...scale);
    parent.add(mesh);
    return mesh;
  };
```
Thay phần dựng hình (giữ nguyên mọi số):
```ts
  const group = new THREE.Group();
  add(group, geo.sphere(14, 24, 18), yellow, null, null, [1.35, 1, 1]);
  for (const [x, r] of [[-1, 14.3], [-9.5, 12.4]] as const) {
    const band = geometries.get(`bee-band:${r}`, () => new THREE.CylinderGeometry(r, r, 5, 24).rotateZ(Math.PI / 2));
    add(group, band, ink, [x, 0, 0], null, null, 0);
  }
  const head = add(group, geo.sphere(BEE_HEAD_RADIUS, 20, 16), ink, [19, 1, 0]);
  const eyes = [5, -5].map((z) => add(group, geo.sphere(2.4, 10, 8), eye, [25.5, 3.5, z], null, null, 0));
  const stinger = geometries.get("bee-stinger", () => new THREE.ConeGeometry(3, 8, 10).rotateZ(Math.PI / 2));
  add(group, stinger, ink, [-21.5, 0, 0], null, null, 0.8);
  const stalk = geometries.get("bee-stalk", () => new THREE.CylinderGeometry(0.7, 0.7, 11, 6).translate(0, 5.5, 0));
  for (const z of [4, -4]) {
    const antenna = add(group, stalk, ink, [22, 8, z], [z > 0 ? 0.35 : -0.35, 0, -0.45], null, 0);
    add(antenna, geo.sphere(1.8, 8, 6), ink, [0, 11, 0], null, null, 0);
  }
  const wings = ([1, -1] as const).map((side) => {
    const pivot = new THREE.Group();
    pivot.position.set(3, 11, side * 4);
    group.add(pivot);
    add(pivot, geo.sphere(10, 16, 12), wing, [-2, 0, side * 9], null, [0.75, 0.14, 1], 1);
    return { pivot, side };
  });
```
Đổi `dispose` thành:
```ts
    dispose() {
      [yellow, ink, eye, wing].forEach((m) => m.dispose());
    },
```
Đổi doc comment của `dispose` trong type `BeeModel` (nếu chưa có thì thêm một dòng ngay trên `dispose(): void;`):
```ts
  /** Releases the bee's materials; its geometry belongs to the cache passed in. */
```

- [ ] **Step 5: Sửa ba nơi gọi `createBeeModel`**

`components/graduation/wishes/bee-scene.ts`:
- Thêm `import { createGeometryCache } from "../shared/three/geometry-cache";`.
- Ngay trước `const model = createBeeModel(…)`, thêm `const geometries = createGeometryCache();`.
- Đổi lời gọi thành `createBeeModel(grad, outM, palette, geometries)`.
- Trong `dispose`, ngay sau `model.dispose();`, thêm `geometries.dispose();`.

`components/graduation/intro/bee-intro-scene.ts`:
- Thêm `import { createGeometryCache } from "../shared/three/geometry-cache";`.
- Ngay sau `const gradient = toonGradient(…)`, thêm `const geometries = createGeometryCache();`.
- Đổi lời gọi thành `createBeeModel(gradient, outM, opts.palette, geometries)`.
- Trong `dispose`, ngay sau `bee.dispose();`, thêm `geometries.dispose();`. Giữ nguyên `scene.traverse(...)` ở task này; Task 7 sẽ thay.

`components/graduation/character/scene/rig.ts`: ở task này chưa có `k.cache`, nên tạm thêm tham số. Đổi chữ ký thành `export function buildRig(scene: THREE.Scene, k: MeshKit, M: Materials, palette: RisoPalette, geometries: GeometryCache): Rig`, thêm `import type { GeometryCache } from "../../shared/three/geometry-cache";`, và đổi lời gọi thành `createBeeModel(M.gradient, M.outline, palette, geometries)`. Task 4 sẽ bỏ tham số này.

`components/graduation/character/scene/grad-character.ts`:
- Thêm `import { createGeometryCache } from "../../shared/three/geometry-cache";`.
- Ngay trước `const rig = buildRig(...)`, thêm `const geometries = createGeometryCache();`.
- Đổi lời gọi thành `buildRig(scene, createMeshKit(M.outline), M, palette, geometries)`.
- Trong `dispose`, giữ dòng `scene.traverse(...)` (vì rig vẫn dựng geometry không qua cache), rồi thêm `geometries.dispose();` ngay sau `rig.beeModel.dispose();`.

- [ ] **Step 6: Chạy test, tsc**

Run: `npx vitest run tests/components/graduation/three` → PASS.
Run: `npx tsc --noEmit -p .` → 0 lỗi.

- [ ] **Step 7: Commit**

```bash
git add tests/components/graduation/three/find-duplicate-geometries.ts tests/components/graduation/three/bee-model.test.ts components/graduation/shared/three/bee-model.ts components/graduation/wishes/bee-scene.ts components/graduation/intro/bee-intro-scene.ts components/graduation/character/scene/rig.ts components/graduation/character/scene/grad-character.ts
git commit -m "perf(graduation): bee shares geometry through the scene cache"
```

---

### Task 4: Mesh kit và nhân vật dùng cache

**Files:**
- Modify: `components/graduation/character/scene/mesh-kit.ts`
- Modify: `components/graduation/character/scene/rig.ts`
- Modify: `components/graduation/character/scene/grad-character.ts`
- Test: `tests/components/graduation/three/mesh-kit.test.ts`, `tests/components/graduation/three/rig.test.ts`

**Interfaces:**
- Consumes: `GeometryCache` (Task 1), `Primitives`/`createPrimitives` (Task 2), `findDuplicateGeometries` (Task 3)
- Produces: `MeshKit` có thêm hai trường `geo: Primitives` và `cache: GeometryCache`. Chữ ký mới là `createMeshKit(outline: THREE.Material, cache: GeometryCache): MeshKit`. `buildRig(scene, k, M, palette)` quay lại 4 tham số (bỏ tham số `geometries` tạm thêm ở Task 3).

- [ ] **Step 1: Viết test (sẽ fail)**

`tests/components/graduation/three/mesh-kit.test.ts`:
```ts
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
```

`tests/components/graduation/three/rig.test.ts`:
```ts
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
```

- [ ] **Step 2: Chạy test để thấy fail**

Run: `npx vitest run tests/components/graduation/three/mesh-kit.test.ts tests/components/graduation/three/rig.test.ts`
Expected: FAIL. `tsc`/vitest báo `createMeshKit` thiếu tham số hoặc không có `k.geo`, và `rig.test.ts` liệt kê các dòng `2× …`.

- [ ] **Step 3: Sửa `mesh-kit.ts`**

Nội dung đầy đủ sau khi sửa:
```ts
import * as THREE from "three";
import type { GeometryCache } from "../../shared/three/geometry-cache";
import { createPrimitives, type Primitives } from "../../shared/three/primitives";

type Vec3 = [number, number, number];

export type MeshKit = {
  add(parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, pos?: Vec3 | null, rot?: Vec3 | null, line?: number): THREE.Mesh;
  group(parent: THREE.Object3D, pos?: Vec3): THREE.Group;
  down(rt: number, rb: number, h: number, segments?: number): THREE.CylinderGeometry;
  up(rt: number, rb: number, h: number, segments?: number): THREE.CylinderGeometry;
  geo: Primitives;
  cache: GeometryCache;
};

export function createMeshKit(outline: THREE.Material, cache: GeometryCache): MeshKit {
  const shifted = (name: string, rt: number, rb: number, h: number, s: number, dy: number) =>
    cache.get(`${name}:${rt},${rb},${h},${s}`, () => new THREE.CylinderGeometry(rt, rb, h, s).translate(0, dy, 0));

  return {
    add(parent, geo, mat, pos, rot, line = 0.022) {
      const mesh = new THREE.Mesh(geo, mat);
      if (line) mesh.add(new THREE.Mesh(cache.outline(geo, line), outline));
      if (pos) mesh.position.set(...pos);
      if (rot) mesh.rotation.set(...rot);
      parent.add(mesh);
      return mesh;
    },
    group(parent, pos) {
      const g = new THREE.Group();
      if (pos) g.position.set(...pos);
      parent.add(g);
      return g;
    },
    down: (rt, rb, h, s = 18) => shifted("down", rt, rb, h, s, -h / 2),
    up: (rt, rb, h, s = 20) => shifted("up", rt, rb, h, s, h / 2),
    geo: createPrimitives(cache),
    cache,
  };
}
```
`translate` trả về chính geometry đó, nên `.translate(...)` nối thẳng sau `new` là đúng.

- [ ] **Step 4: Sửa `rig.ts`**

Thay từng chỗ dựng geometry, giữ nguyên mọi tham số:

| Dòng | Trước | Sau |
|---|---|---|
| 21 | `new THREE.SphereGeometry(0.3, 28, 20)` | `k.geo.sphere(0.3, 28, 20)` |
| 22 | `new THREE.SphereGeometry(0.318, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.52)` | `k.geo.sphere(0.318, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.52)` |
| 24 | `new THREE.SphereGeometry(0.036, 12, 10)` | `k.geo.sphere(0.036, 12, 10)` |
| 25 | `new THREE.SphereGeometry(0.05, 12, 10)` | `k.geo.sphere(0.05, 12, 10)` |
| 27 | `new THREE.TorusGeometry(0.06, 0.014, 6, 14, Math.PI)` | `k.geo.torus(0.06, 0.014, 6, 14, Math.PI)` |
| 29 | `new THREE.CylinderGeometry(0.29, 0.31, 0.16, 24)` | `k.geo.cylinder(0.29, 0.31, 0.16, 24)` |
| 30 | `new THREE.BoxGeometry(0.84, 0.045, 0.84)` | `k.geo.box(0.84, 0.045, 0.84)` |
| 31 | `new THREE.SphereGeometry(0.04, 10, 8)` | `k.geo.sphere(0.04, 10, 8)` |
| 43 | `new THREE.SphereGeometry(0.075, 14, 10)` | `k.geo.sphere(0.075, 14, 10)` |
| 49 | `new THREE.BoxGeometry(0.42, 0.28, 0.015)` | `k.geo.box(0.42, 0.28, 0.015)` |
| 50 | `new THREE.CircleGeometry(0.045, 14)` | `k.geo.circle(0.045, 14)` |
| 53 | `new THREE.BoxGeometry(w, 0.19, 0.58)` | `k.geo.box(w, 0.19, 0.58)` |
| 56 | `new THREE.BoxGeometry(0.62, 0.035, 0.42)` | `k.geo.box(0.62, 0.035, 0.42)` |
| 59 | `new THREE.BoxGeometry(0.62, 0.03, 0.42)` | `k.geo.box(0.62, 0.03, 0.42)` |
| 60 | `new THREE.PlaneGeometry(0.54, 0.34)` | `k.geo.plane(0.54, 0.34)` |
| 66 | `new THREE.CircleGeometry(0.62, 32)` | `k.geo.circle(0.62, 32)` |
| 77 | `new THREE.BoxGeometry(0.2, 0.12, 0.32)` | `k.geo.box(0.2, 0.12, 0.32)` |
| 83 | `new THREE.BoxGeometry(0.1, 0.72, 0.04)` | `k.geo.box(0.1, 0.72, 0.04)` |
| 84 | `new THREE.BoxGeometry(0.1, 0.72, 0.04)` | `k.geo.box(0.1, 0.72, 0.04)` |

Số dòng tính theo file trước Task 3. Nếu lệch thì tìm theo nội dung ở cột "Trước". Sau khi thay xong, chạy `grep -n "new THREE\.[A-Za-z]*Geometry" components/graduation/character/scene/rig.ts`; kết quả phải rỗng.

Bỏ tham số `geometries` đã tạm thêm ở Task 3:
- đổi chữ ký về `export function buildRig(scene: THREE.Scene, k: MeshKit, M: Materials, palette: RisoPalette): Rig`;
- xóa import `GeometryCache`;
- đổi lời gọi thành `createBeeModel(M.gradient, M.outline, palette, k.cache)`.

- [ ] **Step 5: Sửa `grad-character.ts`**

- Đổi lời gọi thành `const rig = buildRig(scene, createMeshKit(M.outline, geometries), M, palette);`.
- Trong `dispose`, xóa dòng `scene.traverse((o) => (o as THREE.Mesh).geometry?.dispose());`, vì giờ mọi geometry của nhân vật đều nằm trong cache. Thứ tự còn lại là: `rig.beeModel.dispose(); geometries.dispose(); disposeMaterials(M);`, sau đó là các dòng renderer như cũ.
- Kiểm tra: chạy `grep -n "Geometry(" components/graduation/character/scene/*.ts`. Chỉ được còn các chỗ nằm trong hàm `build` của `mesh-kit.ts`. Nếu còn chỗ nào khác thì geometry đó sẽ không được giải phóng; dừng lại và báo.

- [ ] **Step 6: Chạy test, tsc**

Run: `npx vitest run tests/components/graduation` → mọi test trong `three/` PASS, các test cũ giữ nguyên kết quả.
Run: `npx tsc --noEmit -p .` → 0 lỗi.

- [ ] **Step 7: Commit**

```bash
git add components/graduation/character/scene/mesh-kit.ts components/graduation/character/scene/rig.ts components/graduation/character/scene/grad-character.ts tests/components/graduation/three/mesh-kit.test.ts tests/components/graduation/three/rig.test.ts
git commit -m "perf(graduation): character builds each shape and outline once"
```

---

### Task 5: Tách một nhóm của geometry

**Files:**
- Create: `components/graduation/shared/three/geometry-group.ts`
- Test: `tests/components/graduation/three/geometry-group.test.ts`

**Interfaces:**
- Produces: `geometryGroup(source: THREE.BufferGeometry, groupIndex: number): THREE.BufferGeometry`. Hàm trả về geometry chứa các tam giác của nhóm `groupIndex`, attribute được clone (không dùng chung với `source`), và ném `Error` nếu `source` không có nhóm đó hoặc không có index.

- [ ] **Step 1: Viết test (sẽ fail)**

`tests/components/graduation/three/geometry-group.test.ts`:
```ts
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
```

- [ ] **Step 2: Chạy test để thấy fail**

Run: `npx vitest run tests/components/graduation/three/geometry-group.test.ts`
Expected: FAIL vì không tìm thấy module.

- [ ] **Step 3: Tạo `geometry-group.ts`**

```ts
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
```

- [ ] **Step 4: Chạy test, tsc**

Run: `npx vitest run tests/components/graduation/three/geometry-group.test.ts` → PASS (4 test).
Run: `npx tsc --noEmit -p .` → 0 lỗi.

- [ ] **Step 5: Commit**

```bash
git add components/graduation/shared/three/geometry-group.ts tests/components/graduation/three/geometry-group.test.ts
git commit -m "feat(graduation): split one group out of a geometry"
```

---

### Task 6: Tổ ong dạng instanced

**Files:**
- Create: `components/graduation/intro/honeycomb.ts`
- Test: `tests/components/graduation/three/honeycomb.test.ts`

**Interfaces:**
- Consumes: `GeometryCache` (Task 1), `geometryGroup` (Task 5)
- Produces:
  ```ts
  type HoneycombCell = { x: number; y: number; z: number; top: number };
  type Honeycomb = {
    group: THREE.Group;
    heights: { y: number }[];
    sync(): void;
    applyTopColors(colors: readonly string[]): void;
    dispose(): void;
  };
  function createHoneycomb(
    cells: readonly HoneycombCell[],
    look: { radius: number; outline: number; side: THREE.Material; top: THREE.Material; outlineMaterial: THREE.Material },
    geometries: GeometryCache,
  ): Honeycomb;
  ```
  `top` là chỉ số màu trong mảng truyền cho `applyTopColors`. `heights[i].y` khởi tạo bằng `cells[i].y`. `sync()` ghi `heights` vào matrix của cả ba mesh.

- [ ] **Step 1: Viết test (sẽ fail)**

`tests/components/graduation/three/honeycomb.test.ts`:
```ts
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
```

- [ ] **Step 2: Chạy test để thấy fail**

Run: `npx vitest run tests/components/graduation/three/honeycomb.test.ts`
Expected: FAIL vì không tìm thấy module.

- [ ] **Step 3: Tạo `honeycomb.ts`**

```ts
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
```
Ghi chú cho người làm (không đưa vào code):
- Vật liệu `top` phải có màu trắng, vì màu thật lấy từ instance color nhân với màu vật liệu.
- Outline dùng hull của lăng trụ kín, giống hệt hiện nay, nên viền không đổi.

- [ ] **Step 4: Chạy test, tsc**

Run: `npx vitest run tests/components/graduation/three/honeycomb.test.ts` → PASS (5 test).
Run: `npx tsc --noEmit -p .` → 0 lỗi.

- [ ] **Step 5: Commit**

```bash
git add components/graduation/intro/honeycomb.ts tests/components/graduation/three/honeycomb.test.ts
git commit -m "feat(graduation): instanced honeycomb for the intro"
```

---

### Task 7: Intro dùng tổ ong instanced

**Files:**
- Modify: `components/graduation/intro/bee-intro-scene.ts`

**Interfaces:**
- Consumes: `createHoneycomb`, `HoneycombCell` (Task 6); `GeometryCache` (Task 1)
- Produces: không đổi API `BeeIntroScene`.

- [ ] **Step 1: Chụp ảnh "trước" để so sánh (bắt buộc)**

Trên trình duyệt, mở `http://localhost:3000/graduation/<link khách bất kỳ>`. Lấy link bằng nút "Xem thiệp" trong `/admin/graduation`. Chụp màn hình intro tổ ong ở cửa sổ 1280×720 trong cả hai theme sáng và tối, khi ong còn đang ngủ (chưa bấm), rồi lưu vào thư mục scratchpad. Không commit ảnh.

- [ ] **Step 2: Sửa import và vật liệu**

Thêm `import { createHoneycomb } from "./honeycomb";`. Bỏ import `outlineGeometry` (sau task này intro không còn dùng). Thay:
```ts
  const sideM = toon();
  const tops = [toon(), toon(), toon(), toon()];
```
bằng:
```ts
  const sideM = toon();
  const topM = new THREE.MeshToonMaterial({ gradientMap: gradient, color: 0xffffff });
```

- [ ] **Step 3: Thay phần dựng ô**

Thay toàn bộ khối từ `const cellGeo = new THREE.CylinderGeometry(...)` đến hết `const cells = hexGrid(4).map(...)` bằng đoạn dưới. Thứ tự gọi `rnd()` giữ nguyên: mỗi ô gọi phần `top` trước, rồi đến phần `y`.
```ts
  const cells = hexGrid(4).map(({ q, r, d }) => {
    const centre = q === 0 && r === 0;
    const top = centre ? 0 : rnd() < 0.32 ? 0 : rnd() < 0.08 ? 3 : rnd() < 0.5 ? 1 : 2;
    return { x: Math.sqrt(3) * CELL_R * (q + r / 2), y: centre ? 0.72 : 0.3 + rnd() * 0.42 - d * 0.03, z: 1.5 * CELL_R * r, top, d };
  });
  const honeycomb = createHoneycomb(cells, { radius: CELL_R * 0.95, outline: 0.022, side: sideM, top: topM, outlineMaterial: outM }, geometries);
  rig.add(honeycomb.group);
```
Dòng `const geometries = createGeometryCache();` (thêm ở Task 3) phải nằm trước đoạn này. Nếu đang nằm sau thì chuyển lên ngay sau `const gradient = toonGradient(...)`.

- [ ] **Step 4: Sửa `applyPalette`**

Thay dòng:
```ts
    [p.canary, p.paper, p.paper2, p.tomato].forEach((color, i) => tops[i].color.set(color));
```
bằng:
```ts
    honeycomb.applyTopColors([p.canary, p.paper, p.paper2, p.tomato]);
```

- [ ] **Step 5: Đồng bộ matrix mỗi khung hình**

Trong `tick`, ngay trước `renderer.render(scene, camera);`, thêm `honeycomb.sync();`.

- [ ] **Step 6: Sửa timeline rơi ô trong `wake`**

Thay:
```ts
      cells.forEach((c) => tl.to(c.mesh.position, { y: c.mesh.position.y - 2.6 - rnd() * 1.5, duration: 1.4, ease: "power3.in" }, 1.5 + c.d * 0.12));
```
bằng:
```ts
      honeycomb.heights.forEach((h, i) => tl.to(h, { y: h.y - 2.6 - rnd() * 1.5, duration: 1.4, ease: "power3.in" }, 1.5 + cells[i].d * 0.12));
```

- [ ] **Step 7: Sửa `dispose`**

Đổi `gsap.killTweensOf([cam, S, flight]);` thành `gsap.killTweensOf([cam, S, flight, ...honeycomb.heights]);`.
Thay khối `scene.traverse(...)` cùng dòng giải phóng vật liệu bằng:
```ts
      honeycomb.dispose();
      trailGeo.dispose();
      geometries.dispose();
      [sideM, topM, outM, trailM].forEach((m) => m.dispose());
```
Giữ nguyên `bee.dispose();`, `gradient.dispose();` và các dòng renderer.

- [ ] **Step 8: Kiểm tra code**

Run: `grep -n "tops\|cellGeo\|cellOutline\|c\.mesh" components/graduation/intro/bee-intro-scene.ts` → rỗng.
Run: `npx tsc --noEmit -p .` → 0 lỗi.
Run: `npx vitest run tests/components/graduation` → kết quả như Task 6.
Run: `npx eslint components/graduation` → không có lỗi mới.

- [ ] **Step 9: Kiểm tra trên trình duyệt (bắt buộc)**

Trên cùng trang và kích thước cửa sổ như Step 1:
1. Chụp lại intro ở theme sáng và tối, rồi so với ảnh "trước". Bố cục ô, màu mặt trên, viền và sương mù phải giống hệt. Nếu khác thì dừng lại và báo, không commit.
2. Khi intro đang hiện, đổi theme bằng nút trên thanh trên: màu mặt trên của ô phải đổi theo ngay.
3. Bấm đánh thức con ong: ong bay đi, các ô rơi xuống theo từng vòng từ tâm ra ngoài, không có ô nào biến mất đột ngột.
4. Mở DevTools Console: không có lỗi hay cảnh báo WebGL mới.
5. Bật "prefers-reduced-motion" (DevTools → Rendering) rồi tải lại trang: intro vẫn hiện tổ ong và không lỗi.

- [ ] **Step 10: Commit**

```bash
git add components/graduation/intro/bee-intro-scene.ts
git commit -m "perf(graduation): intro honeycomb in three draw calls"
```

---

### Task 8: Đo lại và kiểm tra toàn trang

**Files:** không tạo file nào trong repo. Script đo chỉ là file tạm và phải xóa trước khi commit.

- [ ] **Step 1: Đo lại bằng script tạm**

Tạo file `./_stats.mts` ở gốc repo (cần đặt ở đó để alias `@/` hoạt động):
```ts
import * as THREE from "three";
import { createMaterials } from "@/components/graduation/character/scene/materials";
import { createMeshKit } from "@/components/graduation/character/scene/mesh-kit";
import { buildRig } from "@/components/graduation/character/scene/rig";
import { createBeeModel } from "@/components/graduation/shared/three/bee-model";
import { createGeometryCache } from "@/components/graduation/shared/three/geometry-cache";
import { toonGradient } from "@/components/graduation/shared/three/toon";
import { createHoneycomb } from "@/components/graduation/intro/honeycomb";

const P = { paper: "#f6f1e7", paper2: "#efe8da", paper3: "#e5dccb", ink: "#1c1b1f", tomato: "#e8543a", canary: "#f2c230", blue: "#2f5fb3", jade: "#2e9e7a" };
const count = (label: string, root: THREE.Object3D) => {
  const geos = new Set<THREE.BufferGeometry>();
  let draws = 0;
  root.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    geos.add(o.geometry);
    draws += Array.isArray(o.material) ? o.geometry.groups.length : 1;
  });
  console.log(`${label}: geometries ${geos.size}, draw calls ${draws}`);
};
const M = createMaterials(P);
const scene = new THREE.Scene();
buildRig(scene, createMeshKit(M.outline, createGeometryCache()), M, P);
count("Character", scene);
count("Bee", createBeeModel(toonGradient([1, 2, 3]), new THREE.MeshBasicMaterial(), P, createGeometryCache()).group);
const cells = Array.from({ length: 61 }, (_, i) => ({ x: i, y: 0, z: 0, top: i % 4 }));
const m = new THREE.MeshBasicMaterial();
count("Honeycomb", createHoneycomb(cells, { radius: 0.475, outline: 0.022, side: m, top: m, outlineMaterial: m }, createGeometryCache()).group);
```
Run: `npx tsx ./_stats.mts`, rồi `rm ./_stats.mts`.
Expected:
```
Character: geometries 64, draw calls 85
Bee: geometries 13, draw calls 18
Honeycomb: geometries 3, draw calls 3
```
Nếu số khác với kết quả trên thì ghi lại nguyên văn và báo; không chỉnh code chỉ để khớp số.

- [ ] **Step 2: Test, kiểu, lint**

```bash
npx vitest run
npx tsc --noEmit -p .
npx eslint components/graduation tests/components/graduation
```
Expected: chỉ còn 2 test lỗi có sẵn, `tsc` 0 lỗi, eslint không có lỗi mới.

- [ ] **Step 3: Kiểm tra nhân vật trên trình duyệt (bắt buộc)**

Mở trang thiệp ở cửa sổ 1280×720 rồi cuộn hết trang, lần lượt ở theme sáng và tối:
1. Nhân vật lần lượt vẫy tay, cúi chào, ngồi gõ laptop (đùi lộ ra, có chồng sách), chỉ tay, tung mũ, cổ vũ, và chơi với con ong ở tường lời chúc. Viền đen quanh mọi bộ phận phải dày như trước, không mất viền.
2. Bấm một ô lời chúc: ong đưa thư bay đến thẻ, vỗ cánh và đậu lại bình thường.
3. Đổi theme khi đang ở giữa trang: màu áo, khăn và con ong đổi theo.
4. Mở trang khác rồi quay lại thiệp, lặp lại 3 lần: Console không có cảnh báo "Too many active WebGL contexts" hay lỗi dispose.
5. Ở khổ 390×844 (DevTools device mode): nhân vật và intro hiển thị bình thường.

- [ ] **Step 4: Commit**

Chỉ commit khi có sửa lỗi ở các bước trên, sửa đúng file gây lỗi:
```bash
git commit -m "fix(graduation): <mô tả lỗi đã sửa>"
```
Nếu không có gì phải sửa thì không tạo commit.
