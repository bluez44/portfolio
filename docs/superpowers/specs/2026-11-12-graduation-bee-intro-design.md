# Graduation: Màn mở đầu "Chú ong" (Design Spec)

- **Ngày:** 2026-11-12
- **Branch:** `feat/bee-wall-design-sync`
- **Design gốc:** Claude Design, dự án `b80db96d-a298-4481-b2c5-f918cefba74d`, gồm `Graduation Invitation.dc.html` (khối `#intro`, `openIntro`, `startCine`) và `intro-cinema.js` (builder `bee`).
- **Thay thế:** phần hình ảnh của màn mở thư trong `2026-11-12-graduation-storytelling-design.md` §3.1. Phần hợp đồng của §3.1 vẫn giữ nguyên: chờ tài nguyên, cú click là user activation để phát nhạc, khóa cuộn, `inert` trang phía sau, chuyển focus về `#stage`.

## 1. Mục tiêu

Màn mở đầu dùng option "Chú ong" của design: một cảnh điện ảnh có tổ ong 3D và chú ong đang ngủ ở ô giữa. Khi khách đánh thức, ong bay lên, camera bay theo, tổ ong rơi xuống, hai dải đen khép lại rồi mở ra để lộ thiệp.

Bốn thay đổi so với design (theo yêu cầu):

1. Mỗi chuỗi chỉ hiển thị một ngôn ngữ, lấy theo ngôn ngữ đang chọn. Design gốc ghi song ngữ kiểu "Vào không nhạc · Enter silently".
2. Có nút đổi ngôn ngữ ở góc phải trên, nằm trong dải đen phía trên.
3. Bỏ thanh "Phương án · Review" (dùng để chuyển giữa seal, vinyl, press và bee). Chỉ giữ bee.
4. Bỏ dòng "00 · Mở đầu · Overture".

**Tiêu chí thành công**

- Vào trang thì thấy cảnh tổ ong và ong đang ngủ (thở nhẹ, camera trôi theo chuột), hai dải đen trượt vào, tiêu đề hiện từng ký tự.
- Trong lúc tài nguyên chưa tải xong, nút chính bị khóa và hiện "Đang chuẩn bị…".
- Bấm "Đánh thức" hoặc chạm vào khung hình: nhạc phát có tiếng và ong bay. Bấm "Vào không nhạc": vào trang nhanh, không phát nhạc.
- Đổi ngôn ngữ ngay trên màn mở đầu thì toàn bộ chữ đổi theo, kể cả phần trang phía sau.
- Mọi kiểm tra của bản hiện tại vẫn đạt: khóa cuộn, Tab không thoát ra trang phía sau, focus về `#stage` sau khi mở, reduced motion vẫn dùng được.

**Không làm**

- Nút "↺ Xem lại mở đầu" của design. Nếu muốn có thì làm sau.
- Ba biến thể seal, vinyl, press.
- Tiếng nứt sáp: cảnh mới không còn con dấu nên bỏ tiếng này. Các tiếng khác được đổi cho khớp cảnh ong (§3.5).

## 2. Quyết định

| Chủ đề | Quyết định |
|---|---|
| Phần còn giữ | `gate-phase.ts` (reducer), `useLetterGate` (khóa cuộn, `scrollRestoration`), contract `ready / onOpen / onOpened`, wrapper `inert`, focus `#stage`. |
| Thời điểm kết thúc | Độ dài animation mở thay đổi theo đường vào (có nhạc khoảng 5s, không nhạc khoảng 2s). Vì vậy `useLetterGate` bỏ `openMs`; timeline GSAP gọi `finish()` khi chạy xong, tức dispatch `openFinished`. |
| Hai đường vào | "Đánh thức" và chạm khung hình: gọi `onOpen()` (phát nhạc) rồi chạy cảnh ong bay. "Vào không nhạc": không gọi `onOpen`, chạy thẳng phần dải đen khép/mở. Cả hai đều là `open` của reducer. |
| Ngôn ngữ | Dùng lại `LangToggle` có sẵn, đặt cuối dải đen phía trên. Màn mở đầu nằm ngoài `inert` nên toggle bấm được. |
| Copy | Tiêu đề dùng lại `stage.cover` (vi: "Ngày / tốt nghiệp.", en: "Graduation / day."), nên tùy biến `coverLead/coverAccent` của từng khách áp dụng luôn. "Gửi" dùng lại `envelope.to`. Nhãn thương hiệu là `QV — ${header.title}`. Các chuỗi mới nằm trong `gate` (§3.4). |
| Mô hình ong | Tách mô hình ong 3D đang nằm trong `wishes/bee-scene.ts` ra thành `shared/three/bee-model.ts`. Ong đưa thư và ong ở màn mở đầu dùng chung một mô hình (cùng hình học trong design). |
| Helper 3D | Export `outlineGeometry` từ `character/scene/mesh-kit.ts` và tạo `toonGradient()` dùng chung, thay cho ba bản copy hiện có. |
| Reduced motion | Cảnh đứng yên (không thở, không parallax), không có hiệu ứng vào. Bấm nút thì màn mở đầu mờ đi trong 0.45s, không có ong bay. |
| Âm thanh hiệu ứng | Giữ `playSfx` (tổng hợp bằng Web Audio, không cần file). Đổi bộ tiếng: thêm `buzz` (ong vỗ cánh), giữ `rustle` (giấy), bỏ `crack`. Chỉ phát trên đường "Đánh thức" và khi không bật reduced motion. |
| Không có WebGL | Không vẽ cảnh 3D, phần còn lại (nền chấm, dải đen, chữ, nút) vẫn hoạt động. Đường "Đánh thức" lúc đó chạy như đường không nhạc nhưng vẫn phát nhạc. |

## 3. Các phần

### 3.1 Hình học dùng chung

**`components/graduation/shared/three/toon.ts` (mới)**: `toonGradient(steps: [number, number, number])` trả về `DataTexture` 3×1 dùng `NearestFilter`.

**`components/graduation/character/scene/mesh-kit.ts`**: export `outlineGeometry`, không đổi hành vi.

**`components/graduation/shared/three/bee-model.ts` (mới)**:

```ts
export type BeeModel = { group: THREE.Group; wings: { pivot: THREE.Group; side: 1 | -1 }[]; eyes: THREE.Mesh[] };
export function createBeeModel(gradient: THREE.DataTexture, outline: THREE.Material): BeeModel;
```

Hình học lấy đúng theo design: thân, hai vòng đen, đầu, mắt, ngòi, râu, cánh. Kích thước theo đơn vị của design (thân bán kính 14); bên gọi tự scale.

**`wishes/bee-scene.ts`**: dùng `createBeeModel`. Hành vi giữ nguyên.

### 3.2 Cảnh mở đầu 3D

**`components/graduation/intro/bee-intro-scene.ts` (mới)**: port builder `bee` cùng runtime chung của `intro-cinema.js`, gồm renderer, camera parallax theo chuột, `setViewOffset` lệch khung, fog, grain và timecode.

```ts
export type BeeIntroScene = {
  /** Thêm cảnh ong thức dậy và bay vào `tl`; trả về thời điểm (giây) cảnh kết thúc. */
  wake(tl: gsap.core.Timeline): number;
  pause(): void;
  dispose(): void;
};
export function createBeeIntroScene(host: HTMLElement, opts: { reduced: boolean; timecode?: HTMLElement | null; grain?: HTMLElement | null; onFlap?: () => void }): BeeIntroScene;
```

- Tổ ong là lưới lục giác bán kính 4 (61 ô); màu nắp ô và chiều cao lấy ngẫu nhiên theo seed cố định 7.
- Ong ở ô giữa, mắt nhắm (`scale.y = 0.18`).
- `wake()` gồm: mở mắt, rung mình, vỗ cánh, bay theo `CatmullRomCurve3` để lại vệt chấm, camera bám theo, các ô rơi xuống lần lượt từ tâm ra ngoài. Thời gian theo đúng design.
- Hàm thuần `hexGrid(radius)`, tức danh sách `{ q, r, d }`, đặt trong `intro/hex-grid.ts` để test.

**`components/graduation/intro/use-bee-intro-scene.ts` (mới)**: tạo cảnh khi mount (bỏ qua nếu không có WebGL), dọn dẹp khi unmount, trả về ref tới cảnh.

### 3.3 Màn mở đầu (DOM và timeline)

**`components/graduation/gate/letter-gate.tsx`** được viết lại theo layout `#intro` của design, giữ nguyên tên component và props:

- **Lớp nền:** nền chấm halftone, hai quầng màu (blooms), canvas 3D (chạm vào thì cũng tính là "Đánh thức"), vignette và grain.
- **Dải đen trên:** bên trái là `QV — {header.title}`; bên phải là chấm tomato kèm timecode, rồi tới `LangToggle`.
- **Dải đen dưới:** bên trái là nút `gate.silent`; bên phải là `gate.soundHint`.
- **Khối chữ (góc dưới trái):**
  - `h1` gồm hai dòng `stage.cover.lead` và `stage.cover.accent` (dòng accent in nghiêng, màu tomato), mỗi ký tự là một span để làm hiệu ứng.
  - Dưới đó là dòng `envelope.to` cùng tên khách.
  - **Không** có dòng "00 · Mở đầu".
- **Khối nút (góc dưới phải):**
  - `RisoButton` primary size lg, icon "→", chữ `gate.wake`. Khi `phase === "arriving"` nút bị khóa và hiện `gate.preparing`.
  - Bên dưới là gợi ý `gate.tapHint`.
- **Toast** `gate.nowPlaying` ở giữa phía trên, chỉ hiện trên đường có nhạc.

**`components/graduation/gate/use-intro-timeline.ts` (mới)**: dựng GSAP timeline, scoped bằng `gsap.context`.

- `enter()`: chạy khi mount, sau `document.fonts.ready`.
  - Hai dải đen scaleY từ 0 lên 1.
  - Các ký tự trượt từ `yPercent: 115` về 0.
  - Dòng "Gửi" và khối nút hiện dần.
- `exit(withScene)`:
  - Chữ trượt lên và mờ đi.
  - Nếu có cảnh 3D và đi đường có nhạc: thêm `scene.wake()` và toast.
  - Hai dải đen phóng to che kín màn hình, rồi ẩn các lớp nền, nhả khóa cuộn và tạm dừng cảnh.
  - Hai dải đen thu về 0. `onComplete` gọi `finish()`.
- Reduced motion: `exit` chỉ fade `opacity` của overlay trong 0.45s rồi gọi `finish()`.

**`useLetterGate`**: đổi chữ ký thành `useLetterGate(ready, { animate }) → { phase, open, finish }`. Khóa cuộn được nhả khi `phase === "done"` như hiện tại. Lúc dải đen mở ra thì trang đã ở `scrollY = 0`.

### 3.4 Copy

`gate` thay bằng các khóa dưới đây. Khóa `youHaveMail` và `tapToOpen` bị bỏ, `preparing` giữ nguyên.

| khóa | vi | en |
|---|---|---|
| `dialogLabel` | Mở thiệp | Open invitation |
| `wake` | Đánh thức | Wake |
| `tapHint` | hoặc chạm vào khung hình | or tap the frame |
| `silent` | Vào không nhạc → | Enter silently → |
| `soundHint` | ♪ Nên bật âm thanh | ♪ Sound on |
| `nowPlaying` | ♪ Đang phát | ♪ Now playing |
| `preparing` | Đang chuẩn bị lá thư… | Preparing your letter… |

### 3.5 Âm thanh hiệu ứng

**`lib/graduation/sfx.ts`** giữ nguyên cách tổng hợp bằng Web Audio, chỉ đổi bộ tiếng thành `playSfx(name: "buzz" | "rustle", delaySec?)`:

- **`buzz` (mới):** tiếng ong vo ve kéo dài khoảng 2.6s.
  - Nguồn là oscillator răng cưa khoảng 190 Hz, qua bộ lọc lowpass khoảng 1.2 kHz.
  - Một LFO khoảng 28 Hz điều biên để ra cảm giác cánh đập.
  - Cao độ nhích lên nhẹ lúc cất cánh, âm lượng to dần trong 0.15s đầu rồi nhỏ dần về 0 khi ong bay xa.
  - Đường âm lượng là hàm thuần `buzzGain(t, duration)` trong `lib/graduation/sfx-envelope.ts` để test được.
- **`rustle` (giữ):** tiếng giấy sột soạt.
- **`crack`:** bỏ.

Thời điểm phát (chỉ trên đường "Đánh thức", không bật reduced motion):
- `buzz`: lúc ong bắt đầu vỗ cánh, giây 0.45 của timeline. `wake()` gọi qua callback `onFlap` trong `opts` của cảnh.
- `rustle`: lúc hai dải đen bắt đầu mở ra để lộ thiệp.

Đường "Vào không nhạc" không phát âm thanh hiệu ứng.

### 3.6 Xóa

- Markup phong bì và con dấu trong `letter-gate.tsx`. `WaxSeal`, `EnvelopeBody` và prop `id/sealed` của `EnvelopeFlap` vẫn giữ vì phong bì chính dùng, và màn khép lại (§3.6 của spec trước) sẽ dùng.
- Keyframes `gate-drop` và `gate-out` trong `globals.css`.

## 4. Trường hợp biên

- **Chạm khung hình hoặc bấm nút khi `phase !== "ready"`:** không làm gì. Phần này đã được reducer và guard xử lý.
- **Đổi ngôn ngữ giữa chừng:** chữ được render lại, không chạy lại hiệu ứng vào. Cảnh 3D không bị ảnh hưởng.
- **Resize:** cảnh tự resize qua `ResizeObserver`. Khi màn hình hẹp (aspect < 1.15) camera bỏ lệch khung để ong nằm giữa, giống design.
- **Bấm "Đánh thức" khi player chưa sẵn sàng (timeout 8s):** dùng cơ chế `wantsPlay` đã có.
- **Unmount khi timeline đang chạy:** `gsap.context().revert()` cùng `scene.dispose()`.

## 5. Kiểm thử

**Vitest:**
- `hexGrid(4)` có 61 ô, có ô tâm `d = 0`, và mọi ô đều có `d ≤ 4`.
- `buzzGain`: bằng 0 lúc bắt đầu và lúc kết thúc, đạt đỉnh sau 0.15s, không bao giờ âm.
- Reducer: thêm trường hợp `finish` đến trước `open` thì bị bỏ qua (đã có test "stray openFinished"; giữ nguyên).
- Copy: test i18n kiểm tra đủ các khóa `gate` ở cả hai ngôn ngữ.

**Kiểm tra trên trình duyệt:**
1. Hiệu ứng vào: dải đen, chữ, ong thở.
2. Nút bị khóa khi chưa tải xong.
3. "Đánh thức": nhạc có tiếng, nghe tiếng vo ve lúc ong cất cánh và tiếng giấy lúc dải đen mở, ong bay, ô rơi, dải đen khép/mở, trang ở đầu, focus về `#stage`.
4. "Vào không nhạc": không có nhạc, không có âm thanh hiệu ứng, vào trang nhanh.
5. Chạm khung hình tương đương "Đánh thức".
6. Đổi vi/en ngay trên màn mở đầu.
7. Tab không thoát ra ngoài màn mở đầu.
8. Reduced motion.
9. Màn hình hẹp (390px).
10. Ong đưa thư ở tổ ong vẫn bay đúng (sau khi tách mô hình).
