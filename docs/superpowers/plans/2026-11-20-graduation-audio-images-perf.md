# Graduation: Audio thay YouTube, ảnh Met nét hơn, scroll mượt trên mobile — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
> Khi bắt đầu thực thi: copy plan này sang `docs/superpowers/plans/2026-11-20-graduation-audio-images-perf.md`.

**Goal:** Trang `/graduation` phát nhạc từ file MP3 tự host (không còn iframe YouTube), ảnh Met section hiển thị nét, và scroll mượt hơn trên điện thoại yếu.

**Architecture:**
- **Audio:** route proxy `/api/graduation/audio` stream blob private (hỗ trợ `Range` cho iOS) → `AudioTrack` (interface) do `createGainTrack` cài đặt bằng `<audio>` + Web Audio `GainNode` (iOS bỏ qua `audio.volume`) → hook `useAudioPlayer` giữ đúng API của `useYouTubePlayer` nên `invitation.tsx`, `useMusicCues`, `MusicToggle` gần như không đổi.
- **Ảnh:** bỏ blur còn sót ở trạng thái nghỉ, tăng `quality` next/image cho ảnh kỷ niệm; sau đó kiểm tra độ phân giải gốc trên production và chỉ upscale/upload lại những ảnh thực sự nhỏ.
- **Perf:** một nguồn duy nhất `perfTierFor()` quyết định `"full" | "lite"`, gắn `data-perf` lên `<html>`; CSS variant `lite:` và các hàm thuần (`memoryLook`, `rendererOptions`) đọc tier này để tắt filter/backdrop-blur, hạ pixel ratio WebGL, tắt Lenis trên màn cảm ứng.

**Tech Stack:** Next.js 16.2 (App Router), React, GSAP + ScrollTrigger, Lenis, three.js, `@vercel/blob` 2.8 (`get(..., { headers })`), Tailwind v4, Vitest.

**Spec:** yêu cầu của user trong hội thoại (3 mục: audio-only, ảnh Met mờ, scroll giật trên mobile). File nhạc: blob pathname `audio/underwater-city.mp3`, store `BLOB_ACCESS=private`.

## Global Constraints

- SOLID: mỗi file một trách nhiệm; hook phụ thuộc interface `AudioTrack`, không phụ thuộc `HTMLAudioElement` trực tiếp.
- Không comment lan man: chỉ comment khi giải thích "vì sao" không hiển nhiên (ví dụ: iOS bỏ qua `audio.volume`). Không comment mô tả lại code.
- Không còn bất kỳ request nào tới `youtube.com` / `youtube-nocookie.com` từ trang `/graduation`.
- Track mặc định: `audio/underwater-city.mp3`. Chỉ phục vụ pathname khớp `^audio/[A-Za-z0-9._-]+\.(mp3|m4a)$`.
- Ngưỡng lite: `prefers-reduced-motion: reduce` **hoặc** (`pointer: coarse` **và** (`hardwareConcurrency ≤ 6` **hoặc** `deviceMemory ≤ 4`)).
- Pixel ratio WebGL: full `min(dpr, 2)`, lite `min(dpr, 1.25)`; lite tắt `antialias`.
- Next/image quality cho ảnh kỷ niệm: `90`; phải thêm `images.qualities: [75, 90]` vào `next.config.ts` (Next 16 bắt buộc allowlist).
- Mỗi task: `npm test` + `npx tsc --noEmit` + `npm run lint` xanh; commit sau khi user review (theo memory "Task review/commit flow").

## Review Focus

1. iOS Safari: bấm nút nhạc lần đầu phải phát được (AudioContext `resume()` + `play()` gọi đồng bộ trong click) → test `createGainTrack` gọi `context.resume` trước `element.play` (Task 3).
2. Seek/loop trên iOS cần `206 Partial Content` → test route trả 206 + `Content-Range` khi có header `Range` (Task 2).
3. Route audio không được thành proxy đọc blob tuỳ ý (ví dụ `graduation/…jpg`, `../`) → test `isAudioPathname` từ chối (Task 1).
4. Dữ liệu cũ trong DB còn `musicYoutubeId` / `music.youtubeId` → phải bị bỏ qua, rơi về track mặc định, không crash → test `resolveEvent` (Task 5).
5. Máy desktop (pointer fine) không bị đẩy vào lite chỉ vì ít core → test `perfTierFor` (Task 8).

---

## Phần A — Audio thay YouTube

### Task 1: Pathname track + URL builder

**Files:**
- Create: `lib/graduation/audio-track.ts`
- Test: `tests/lib/graduation/audio-track.test.ts`

**Interfaces:**
- Produces: `DEFAULT_TRACK = "audio/underwater-city.mp3"`, `isAudioPathname(p: string): boolean`, `audioUrl(pathname: string): string` → `/api/graduation/audio?pathname=<encoded>`, `trackPathnameSchema` (zod, dùng regex ở Global Constraints, message `"Đường dẫn phải dạng audio/ten-file.mp3"`).

- [ ] **Step 1: Viết test fail**
```ts
expect(isAudioPathname("audio/underwater-city.mp3")).toBe(true);
expect(isAudioPathname("audio/a.m4a")).toBe(true);
expect(isAudioPathname("graduation/1-photo.jpg")).toBe(false);
expect(isAudioPathname("audio/../secret.mp3")).toBe(false);
expect(isAudioPathname("/audio/x.mp3")).toBe(false);
expect(audioUrl("audio/underwater-city.mp3")).toBe("/api/graduation/audio?pathname=audio%2Funderwater-city.mp3");
```
- [ ] **Step 2:** `npx vitest run tests/lib/graduation/audio-track.test.ts` → FAIL (module not found)
- [ ] **Step 3:** Implement. Regex không cho `/` sau `audio/` nên `..` không lọt.
- [ ] **Step 4:** Chạy lại → PASS
- [ ] **Step 5:** Commit `feat(graduation): add audio track pathname rules`

### Task 2: Route stream audio có hỗ trợ Range

**Files:**
- Create: `app/api/graduation/audio/route.ts`
- Create: `lib/blob/stream-response.ts`
- Test: `tests/lib/blob/stream-response.test.ts`

**Interfaces:**
- Consumes: `isAudioPathname` (Task 1).
- Produces: `toStreamResponse(result: { statusCode: number; stream: ReadableStream | null; headers: Headers; blob: { contentType?: string } }): Response` — chuyển kết quả `get()` thành `Response`, giữ nguyên status `200/206`, copy `Content-Range`, `Content-Length`, `Accept-Ranges: bytes`, `Content-Type` (mặc định `audio/mpeg`), `Cache-Control: public, max-age=31536000, immutable`.

- [ ] **Step 1: Test fail** cho `toStreamResponse`: input `statusCode: 206` với header `content-range: bytes 0-99/1000` → response `status === 206`, `headers.get("content-range") === "bytes 0-99/1000"`, `headers.get("accept-ranges") === "bytes"`; input `200` không có `content-range` → không set header đó.
- [ ] **Step 2:** Chạy → FAIL
- [ ] **Step 3:** Implement `toStreamResponse`. Route `GET`: thiếu/sai pathname (`!isAudioPathname`) → `400`; `get(pathname, { access: "private", token, headers: range ? { range } : undefined })`; `null`/status ≥ 400 → `404`; còn lại `toStreamResponse`. Kiểm tra field header thực tế của `GetBlobResult` trong `node_modules/@vercel/blob/dist/index.d.ts` và chỉnh kiểu input cho khớp.
- [ ] **Step 4:** Chạy test → PASS. Thủ công: `npm run dev`, `curl -I -H "Range: bytes=0-99" "http://localhost:3000/api/graduation/audio?pathname=audio%2Funderwater-city.mp3"` → `206`, `Content-Range` có mặt; `?pathname=graduation%2Fx.jpg` → `400`.
- [ ] **Step 5:** Commit `feat(graduation): stream private audio with range support`

### Task 3: `AudioTrack` interface + cài đặt Web Audio

**Files:**
- Create: `components/graduation/music/audio-track.ts` (interface + `createGainTrack`)
- Test: `tests/components/graduation/music/audio-track.test.ts`

**Interfaces:**
- Produces:
```ts
export type TrackState = "loading" | "ready" | "playing" | "paused" | "error";
export interface AudioTrack {
  play(): Promise<void>;          // reject khi trình duyệt từ chối
  pause(): void;
  fadeTo(level: number, ms: number, onDone?: () => void): void; // level 0..1
  setLevel(level: number): void;
  readonly playing: boolean;
  subscribe(listener: (s: TrackState) => void): () => void;
  dispose(): void;
}
export function createGainTrack(src: string, deps?: { createElement?: () => HTMLAudioElement; createContext?: () => AudioContext }): AudioTrack;
```
- `<audio>`: `loop = true`, `preload = "auto"`, `playsInline`, không gắn vào DOM, `crossOrigin` không cần (same-origin). Graph `MediaElementSource → GainNode → destination` tạo **lười** ở lần `play()` đầu tiên (AudioContext chỉ hợp lệ sau user gesture). Fade dùng `gain.setValueAtTime` + `linearRampToValueAtTime`, `onDone` qua `setTimeout(ms)`; fade mới huỷ fade cũ (`cancelScheduledValues`).
- Event map: `canplaythrough`→`ready`, `playing`→`playing`, `pause`→`paused`, `error`→`error`.

- [ ] **Step 1: Test fail** với fake element/context (deps injection):
  - `play()` gọi `context.resume()` **trước** `element.play()`, và chỉ tạo `createMediaElementSource` một lần qua 2 lần `play()`.
  - `element.play()` reject → `play()` reject.
  - fake element dispatch `"error"` → listener nhận `"error"`.
  - `fadeTo(0.35, 600)` gọi `gain.gain.linearRampToValueAtTime(0.35, now + 0.6)`.
  - `dispose()` pause element, `removeAttribute("src")`, `context.close()`.
- [ ] **Step 2:** Chạy → FAIL
- [ ] **Step 3:** Implement. Comment duy nhất: vì sao dùng GainNode (iOS bỏ qua `HTMLMediaElement.volume`).
- [ ] **Step 4:** Chạy → PASS
- [ ] **Step 5:** Commit `feat(graduation): add gain-controlled audio track`

### Task 4: Hook `useAudioPlayer` thay `useYouTubePlayer`

**Files:**
- Create: `components/graduation/music/use-audio-player.ts`
- Create: `components/graduation/music/music-status.ts` (chuyển `MusicStatus` ra file riêng)
- Modify: `components/graduation/music/use-music-cues.ts:6` (import `MusicStatus` từ `music-status`)
- Modify: `components/graduation/invitation.tsx:23,64-66,135-138` (dùng hook mới, xoá `<div ref={musicMountRef}>` sr-only)
- Delete: `components/graduation/music/use-youtube-player.ts`, `components/graduation/music/playback-state.ts`, `tests/components/graduation/music/playback-state.test.ts`, `lib/youtube/` (cả thư mục — chỉ hook cũ dùng)

**Interfaces:**
- Consumes: `AudioTrack`, `createGainTrack` (Task 3), `audioUrl` (Task 1).
- Produces: `useAudioPlayer(pathname: string, onError: () => void, onReady?: () => void, createTrack: (src: string) => AudioTrack = createGainTrack): { status: MusicStatus; start(); toggle(); fadeTo(volume0to100: number, ms?: number); fadePause(); fadeResume() }` — giữ thang 0–100 để `useMusicCues`/`volumeFor` không đổi; chia 100 khi gọi `track.fadeTo`.
- Giữ nguyên hành vi hook cũ: `start`/`toggle` gọi đồng bộ trong gesture; bắt đầu từ level 0 rồi fade lên 1 trong `FADE_MS = 1200`; tạm dừng khi `document.hidden`, phát lại khi quay lại; `wantsPlay` khi chưa `ready`; `onReady` gọi cả khi lỗi (gate không bị treo); `play()` reject → `onError`.
- Thêm `navigator.mediaSession.metadata = new MediaMetadata({ title: "Underwater City" })` khi bắt đầu phát (nếu có API) để màn khoá không hiện gì liên quan YouTube.

- [ ] **Step 1:** Implement hook + sửa `invitation.tsx`, `use-music-cues.ts`; xoá file YouTube.
- [ ] **Step 2:** `npx tsc --noEmit` và `npm test` → PASS; `grep -rn "youtube" components/graduation lib/youtube` → không còn kết quả (trừ Task 5 chưa làm ở `lib/graduation/content`).
- [ ] **Step 3:** Thủ công trên `npm run dev`, mở `/graduation/<guest_id>`: mở thiệp → nhạc fade in; nút ♪ bật/tắt; cuộn qua `#met` nghe dip; focus form RSVP nhỏ lại; chuyển tab thì dừng. DevTools Network: không có request `youtube`. Tab qua trang: không còn phần tử focus vô hình.
- [ ] **Step 4:** Commit `feat(graduation): play background music from self-hosted audio`

### Task 5: Đổi model dữ liệu nhạc từ YouTube ID sang track pathname

**Files:**
- Modify: `lib/graduation/event.ts:21,40` (`musicYoutubeId` → `musicTrack: DEFAULT_TRACK`)
- Modify: `lib/graduation/content/settings-types.ts:24,43` (`musicTrack?: string`; `music?: { track?: string }`)
- Modify: `lib/graduation/content/settings-rules.ts:25,49,79` (thay `youtubeIdSchema` bằng `trackPathnameSchema` từ Task 1)
- Modify: `lib/graduation/content/resolve-event.ts:29`, `resolve-content.ts:29`, `guest-content-summary.ts:17`
- Modify: `components/graduation/invitation.tsx:64` (`event.musicTrack`)
- Modify tests: `tests/lib/graduation/content/{guest-content-summary,legacy-guest-content,resolve-content}.test.ts`

**Interfaces:**
- Consumes: `DEFAULT_TRACK`, `trackPathnameSchema` (Task 1).
- Produces: `GraduationEvent.musicTrack: string`; `EventSettings.musicTrack?`; `GuestContent.music?.track?`.

- [ ] **Step 1: Test fail** trong `resolve-content.test.ts`: guest có `music: { track: "audio/other.mp3" }` → `event.musicTrack === "audio/other.mp3"`; settings cũ chỉ có `{ musicYoutubeId: "hfavqkBrwXI" }` → `event.musicTrack === "audio/underwater-city.mp3"`. Cập nhật summary test dùng `music: { track: "audio/a.mp3" }`.
- [ ] **Step 2:** Chạy → FAIL
- [ ] **Step 3:** Đổi type/schema/resolver như trên.
- [ ] **Step 4:** `npm test` + `npx tsc --noEmit` → PASS
- [ ] **Step 5:** Commit `refactor(graduation): store music as audio track pathname`

### Task 6: Admin nhập track thay YouTube ID

**Files:**
- Modify: `app/admin/graduation/settings/components/event-panel.tsx:11,18` (`LinkKey` dùng `musicTrack`; label `"File nhạc nền"`, hint `"Đường dẫn trong Vercel Blob, ví dụ audio/underwater-city.mp3"`)
- Modify: `app/admin/graduation/components/tabs/music-tab.tsx` (tiêu đề `"Nhạc nền tuỳ chỉnh"`, field `music.track`, placeholder `audio/ten-file.mp3 (bỏ trống để dùng nhạc mặc định)`)

- [ ] **Step 1:** Sửa hai component.
- [ ] **Step 2:** `npx tsc --noEmit`, `npm run lint` → PASS; thủ công: `/admin/graduation/settings` lưu `audio/underwater-city.mp3` thành công, nhập `abc` báo lỗi validation.
- [ ] **Step 3:** Commit `feat(admin): edit graduation music as audio track`

## Phần B — Ảnh Met section

### Task 7: Bỏ blur trạng thái nghỉ + tăng quality ảnh kỷ niệm

**Files:**
- Create: `components/graduation/met/photo-quality.ts` (`export const PHOTO_QUALITY = 90;`)
- Modify: `next.config.ts` (`images.qualities: [75, 90]`)
- Modify: `components/graduation/met/finale/constants.ts:93` (`dimmed` bỏ `blur(1.5px)` → `filter: "blur(0px) sepia(0.7)"` để GSAP nội suy cùng cấu trúc với `to`)
- Modify: `components/graduation/met/components/moment-card.tsx:38`, `memory-polaroid.tsx:26` (`quality={PHOTO_QUALITY}`), và chỗ render ảnh trong `PolaroidFrame` (tìm `<Image` của note photo trong `met-section.tsx`/`personal-note-card.tsx`)
- Test: `tests/components/graduation/met/finale/memory-look.test.ts`

- [ ] **Step 1: Test fail:** `expect(MEMORY_LOOK.dimmed.filter).not.toMatch(/blur\((?!0px)/)` và `MEMORY_LOOK.to.filter` cũng vậy.
- [ ] **Step 2:** Chạy → FAIL
- [ ] **Step 3:** Áp dụng các thay đổi.
- [ ] **Step 4:** `npm test`, `npx tsc --noEmit` → PASS; thủ công: ảnh kỷ niệm khi đã "dim" vẫn nét, card Met đang active nét; Network: URL `_next/image` có `q=90`.
- [ ] **Step 5:** Commit `fix(graduation): sharpen met photos at rest and raise image quality`

### Task 8 (ops, không commit code): Kiểm tra độ phân giải gốc, upscale & nối lại trên production

Điều kiện: user đã đăng nhập `/admin` trên Chrome; mọi thao tác ghi lên production phải được user xác nhận trước.

- [ ] **Step 1:** Mở trang admin production `/admin/graduation/images` bằng claude-in-chrome, với mỗi ảnh đang được dùng ở moments/memories/together/note photo: ghi `pathname`, `naturalWidth × naturalHeight` (qua `javascript_tool` đọc `img.naturalWidth` từ URL gốc `/api/graduation/image?pathname=…`) và nơi đang dùng (settings moment nào / guest nào). Lưu bảng vào `<scratchpad>/met-images.md`.
- [ ] **Step 2:** Báo bảng cho user. Ảnh có cạnh dài ≥ 1200px → không cần xử lý (Task 7 đã đủ). Ảnh nhỏ hơn → ưu tiên xin ảnh gốc từ user.
- [ ] **Step 3:** Nếu không có ảnh gốc: tải về `<scratchpad>/met-src/`, script `<scratchpad>/upscale.mjs` dùng `sharp` (có sẵn qua Next) `resize` ×2 kernel `lanczos3` + `sharpen({ sigma: 0.8 })`, xuất JPEG q90 vào `<scratchpad>/met-out/`. Cho user xem trước/sau.
- [ ] **Step 4:** Sau khi user duyệt: upload từng ảnh qua `ImageUploader` trong admin, gán lại đúng field đã ghi ở Step 1, lưu. Kiểm tra trang guest tương ứng hiển thị ảnh mới.

## Phần C — Scroll mượt trên mobile

### Task 9: Đo baseline

- [ ] **Step 1:** Chrome DevTools Performance, CPU throttling 6×, viewport 390×844, cuộn từ envelope đến finale. Ghi lại: FPS trung bình, các long task, thời gian Paint/Composite lớn nhất ở `#met`, header. Lưu vào `<scratchpad>/perf-baseline.md` để so sánh ở Task 14.

### Task 10: `perfTierFor` + gắn `data-perf` + Tailwind variant `lite:`

**Files:**
- Create: `lib/browser/perf-tier.ts`
- Create: `lib/hooks/use-perf-tier.ts`
- Modify: `app/graduation/layout.tsx` (mở rộng inline script: tính tier trước paint, `documentElement.dataset.perf = tier`)
- Modify: `app/globals.css` (`@custom-variant lite (&:where([data-perf="lite"], [data-perf="lite"] *));`)
- Test: `tests/lib/browser/perf-tier.test.ts`

**Interfaces:**
- Produces: `type PerfTier = "full" | "lite"`; `type PerfSignals = { cores?: number; memoryGb?: number; coarsePointer: boolean; reducedMotion: boolean }`; `perfTierFor(s: PerfSignals): PerfTier`; `readPerfSignals(): PerfSignals` (đọc `navigator`/`matchMedia`); `usePerfTier(): PerfTier` (đọc `document.documentElement.dataset.perf`, mặc định `"full"` khi SSR).
- Inline script trong layout phải dùng cùng ngưỡng: export `PERF_TIER_SCRIPT: string` từ `perf-tier.ts` được sinh từ cùng hằng số `LITE_MAX_CORES = 6`, `LITE_MAX_MEMORY_GB = 4` (một nguồn sự thật).

- [ ] **Step 1: Test fail:**
```ts
expect(perfTierFor({ cores: 4, memoryGb: 8, coarsePointer: true, reducedMotion: false })).toBe("lite");
expect(perfTierFor({ cores: 8, memoryGb: 3, coarsePointer: true, reducedMotion: false })).toBe("lite");
expect(perfTierFor({ cores: 8, memoryGb: 8, coarsePointer: true, reducedMotion: false })).toBe("full");
expect(perfTierFor({ cores: 2, coarsePointer: false, reducedMotion: false })).toBe("full");
expect(perfTierFor({ cores: 16, coarsePointer: false, reducedMotion: true })).toBe("lite");
expect(perfTierFor({ coarsePointer: true, reducedMotion: false })).toBe("full");
```
- [ ] **Step 2:** Chạy → FAIL
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** PASS; thủ công: DevTools device mode + CPU 6× → `<html data-perf="lite">` khi giả lập cores (override `navigator.hardwareConcurrency` trong console rồi reload không được — kiểm tra bằng `reducedMotion` emulation thay thế).
- [ ] **Step 5:** Commit `feat(graduation): detect low-end devices as lite perf tier`

### Task 11: Bỏ filter/backdrop-blur đắt đỏ ở tier lite

**Files:**
- Modify: `components/graduation/chrome/invitation-header.tsx:18` (thêm `lite:backdrop-blur-none lite:backdrop-saturate-100 lite:bg-paper`)
- Modify: `components/graduation/met/components/moment-card.tsx:37` (thêm class `lite:filter-none!`)
- Modify: `components/graduation/met/finale/constants.ts` (thêm `memoryLook(tier: PerfTier)`: `full` → `MEMORY_LOOK`; `lite` → cùng opacity, **không** có `filter`)
- Modify: `components/graduation/met/finale/finale-timeline.ts` (nhận `tier: PerfTier` trong options; dùng `memoryLook(tier)`; tween `photo` ở lite chỉ animate `opacity`)
- Modify: nơi gọi `createFinaleTimeline` (truyền `usePerfTier()`)
- Modify: `components/graduation/met/components/finale-memory-photos.tsx:26,39` (`lite:filter-none!` cho layer brightness)
- Test: `tests/components/graduation/met/finale/memory-look.test.ts`

**Interfaces:**
- Consumes: `PerfTier`, `usePerfTier` (Task 10).
- Produces: `memoryLook(tier: PerfTier): { from; to; dimmed }`; `FinaleElements`/options của `createFinaleTimeline` có thêm `tier: PerfTier`.

- [ ] **Step 1: Test fail:** mọi state của `memoryLook("lite")` không có key `filter`; `memoryLook("full")` bằng `MEMORY_LOOK`.
- [ ] **Step 2:** Chạy → FAIL
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** PASS; thủ công ở tier lite: header nền đặc, card Met không blur nhưng vẫn có lớp veil opacity, ảnh kỷ niệm chỉ fade.
- [ ] **Step 5:** Commit `perf(graduation): drop animated filters and backdrop blur on lite devices`

### Task 12: Renderer WebGL dùng chung, hạ pixel ratio ở lite

**Files:**
- Create: `components/graduation/shared/three/renderer.ts`
- Modify: `components/graduation/intro/bee-intro-scene.ts:39-40`, `components/graduation/wishes/bee-scene.ts:27-28`, `components/graduation/character/scene/grad-character.ts:22-27` (+ xoá `MAX_PIXEL_RATIO` khỏi `character/scene/constants.ts` nếu không còn dùng)
- Modify: các hook tạo scene (`use-bee-intro-scene.ts`, `use-grad-character.ts`, nơi gọi `createBeeScene`) truyền `usePerfTier()`
- Test: `tests/components/graduation/three/renderer.test.ts`

**Interfaces:**
- Consumes: `PerfTier` (Task 10).
- Produces: `rendererOptions(tier: PerfTier, dpr: number): { antialias: boolean; pixelRatio: number }`; `createRenderer(tier: PerfTier): THREE.WebGLRenderer` (`alpha: true`, áp dụng options).

- [ ] **Step 1: Test fail:**
```ts
expect(rendererOptions("full", 3)).toEqual({ antialias: true, pixelRatio: 2 });
expect(rendererOptions("lite", 3)).toEqual({ antialias: false, pixelRatio: 1.25 });
expect(rendererOptions("lite", 1)).toEqual({ antialias: false, pixelRatio: 1 });
```
- [ ] **Step 2:** Chạy → FAIL
- [ ] **Step 3:** Implement + thay 3 chỗ `new THREE.WebGLRenderer`.
- [ ] **Step 4:** PASS; thủ công: 3 scene vẫn render đúng ở cả hai tier.
- [ ] **Step 5:** Commit `perf(graduation): share webgl renderer setup and lower pixel ratio on lite`

### Task 13: Tắt Lenis trên màn cảm ứng

**Files:**
- Modify: `components/providers/smooth-scroll-provider.tsx:16-19` (điều kiện bỏ qua: `reduceMotion || matchMedia("(pointer: coarse)").matches`)

- [ ] **Step 1:** Implement (các consumer `useLenis()` đã xử lý `null`: `use-venue-guide.ts:18`, `use-scroll-lock.ts:13`).
- [ ] **Step 2:** Thủ công trên DevTools device mode (touch): cuộn native, ScrollTrigger pin ở `#met` và finale vẫn đúng vị trí; nút anchor trong header vẫn cuộn tới section (native `scroll-behavior` hoặc nhảy thẳng là chấp nhận được); desktop vẫn có smooth scroll.
- [ ] **Step 3:** Commit `perf: use native scrolling on touch devices`

### Task 14: Đo lại & xác nhận

- [ ] **Step 1:** Lặp đúng kịch bản Task 9, so sánh với `perf-baseline.md`, báo user số liệu trước/sau.
- [ ] **Step 2:** `npm test && npx tsc --noEmit && npm run lint && npm run build` → tất cả xanh.
- [ ] **Step 3:** Nếu vẫn còn long task lớn, ghi nguồn cụ thể (scene/timeline nào) và đề xuất task tiếp theo thay vì sửa ngoài plan.

## Cách thực thi: Claude review, Gemini code qua agy-mcp

Claude không tự code. Mỗi task giao cho Gemini qua `mcp__agy__agy_run` (cwd `D:\portfolio`). Prompt tự đủ ngữ cảnh: dán nguyên văn task, Global Constraints, Interfaces của các task liên quan; dặn **không commit, không đụng file ngoài danh sách**, chạy test của task và báo lại diff + kết quả test.

Chọn model theo độ khó (quota Gemini còn ~35% tuần, Argon gần cạn nên không dùng):
| Task | Model |
|---|---|
| 3, 4, 11, 12 (Web Audio, hook, GSAP timeline, three.js) | `gemini-4-neon-high` |
| 2, 5, 10 (route Range, đổi model dữ liệu, perf tier + script) | `gemini-4-neon-medium` |
| 1, 6, 7, 13 (nhỏ, cơ học) | `gemini-3.8-flash-high` |
| 8, 9, 14 (ops/đo đạc trên browser) | Claude tự làm bằng claude-in-chrome |

Vòng lặp mỗi task (tuần tự vì task sau dùng interface task trước):
1. Giao task → `agy_wait` tới khi xong.
2. Claude review: `git diff`, đối chiếu spec + Global Constraints (SOLID, không comment lan man, đúng signature), tự chạy `npm test`, `npx tsc --noEmit`, `npm run lint`.
3. Có lỗi → gửi feedback cụ thể bằng `conversation_id` cũ, lặp lại bước 2 (tối đa 2 vòng; quá thì Claude tự sửa phần còn lại).
4. Đạt → Claude commit với message của task (kèm `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`), sang task tiếp theo.

## Verification end-to-end

1. `npm run build && npm start`, mở `/graduation/<guest_id>` trên Chrome desktop và DevTools device mode (iPhone, CPU 6×).
2. Nhạc: bật được, fade, dip theo section, dừng khi ẩn tab; Network không có `youtube`; `/api/graduation/audio` trả `206` cho request có Range.
3. Ảnh Met: card active và ảnh kỷ niệm nét; URL ảnh `q=90`.
4. Mobile lite: `data-perf="lite"`, không còn `backdrop-filter`/`filter` animate trong Performance panel, FPS cải thiện so với baseline.
5. Thử trên iPhone thật (Safari) nếu có: nhạc phát được ở lần chạm đầu tiên.
