# Graduation Letter Gate & Music Activation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay màn loading của `/graduation` bằng màn "Bạn có thư": phong bì đóng kín, khách chạm con dấu để mở. Nhạc chỉ bắt đầu từ cú chạm đó, nên phát có tiếng và không còn bị dừng khi cuộn.

**Architecture:** Gồm ba lớp.
- Một reducer thuần quản lý các pha của màn mở thư (`arriving → ready → opening → done`), được bọc trong hook `useLetterGate`. Hook này lo khóa cuộn và hẹn giờ kết thúc animation.
- `useYouTubePlayer` được viết lại theo hướng "chỉ phát khi có user activation": bỏ toàn bộ autoplay/muted fallback, thêm `start()` và `fadeTo()`.
- `LetterGate` dựng từ các mảnh phong bì có sẵn (body, flap, con dấu sáp được tách thành component dùng chung). `invitation.tsx` chỉ nối dây giữa các phần.

**Tech Stack:** Next.js (App Router), React 19, Tailwind v4, GSAP/Lenis (có sẵn), YouTube IFrame API, Web Audio API, Vitest (env `node`).

**Spec:** `docs/superpowers/specs/2026-11-12-graduation-storytelling-design.md`, mục 3.1. Đây là task 1/6 trong mục 7 của spec.

## Global Constraints

- Làm trực tiếp trên branch `feat/bee-wall-design-sync`, không tạo worktree.
- Comment chỉ nêu ràng buộc mà code không tự thể hiện. Không giải thích lan man, không kể lịch sử.
- Mọi chuỗi hiển thị mới phải có ở cả `vi.ts` và `en.ts`, khai báo kiểu trong `lib/graduation/i18n/types.ts`.
- `prefers-reduced-motion`: không có animation, không có âm thanh hiệu ứng, luồng mở thư vẫn hoạt động.
- Nhạc chỉ được kích hoạt đồng bộ trong handler click/phím. Không thêm listener gesture toàn cục.
- Test nằm trong `tests/`, mô phỏng cây thư mục nguồn, import qua alias `@/`, môi trường vitest `node`, nên chỉ unit-test được hàm thuần.
- Lệnh kiểm tra: `npx tsc --noEmit`, `npm run lint`, `npm test`.
- Commit message kết thúc bằng dòng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Chạm con dấu khi player chưa sẵn sàng** (hết timeout 8s mà YouTube vẫn đang tải): nhạc phải tự phát ngay khi player `onReady`, không đòi khách chạm lần nữa. Kiểm tra tay ở Task 8, bước 4.
2. **Khách dùng bàn phím:** con dấu được focus tự động khi sẵn sàng; Enter/Space mở thư và phát nhạc. Kiểm tra ở Task 8, bước 3.
3. **Bấm đúp con dấu:** chỉ mở một lần, `start()` chỉ gọi một lần. Reducer test ở Task 1 cùng guard `phase !== "ready"` ở Task 7.
4. **Khách tự tắt nhạc rồi chuyển tab hoặc mở tour 360°:** quay lại thì nhạc **không** tự phát lại. Kiểm tra tay ở Task 8, bước 6.
5. **Trình duyệt từ chối phát** (iOS Safari, hoặc site bị chặn âm thanh): nút ♪ hiện "Không phát được nhạc", không thử lại liên tục, trang vẫn dùng được. Kiểm tra tay ở Task 8, bước 7.

---

### Task 1: Reducer pha của màn mở thư

**Files:**
- Create: `components/graduation/gate/gate-phase.ts`
- Test: `tests/components/graduation/gate/gate-phase.test.ts`

**Interfaces:**
- Produces:
  - `type GatePhase = "arriving" | "ready" | "opening" | "done"`
  - `type GateEvent = { type: "resourcesReady" } | { type: "open"; animate: boolean } | { type: "openFinished" }`
  - `gateReducer(phase: GatePhase, event: GateEvent): GatePhase`

- [ ] **Step 1: Viết test (failing)**

```ts
import { describe, expect, it } from "vitest";
import { gateReducer, type GateEvent, type GatePhase } from "@/components/graduation/gate/gate-phase";

const run = (events: GateEvent[], from: GatePhase = "arriving") => events.reduce(gateReducer, from);

describe("gateReducer", () => {
  it("becomes openable once resources are ready", () => {
    expect(run([{ type: "resourcesReady" }])).toBe("ready");
  });
  it("ignores opening before the letter is ready", () => {
    expect(run([{ type: "open", animate: true }])).toBe("arriving");
  });
  it("plays the opening animation, then finishes", () => {
    expect(run([{ type: "resourcesReady" }, { type: "open", animate: true }])).toBe("opening");
    expect(run([{ type: "resourcesReady" }, { type: "open", animate: true }, { type: "openFinished" }])).toBe("done");
  });
  it("skips the animation when motion is reduced", () => {
    expect(run([{ type: "resourcesReady" }, { type: "open", animate: false }])).toBe("done");
  });
  it("opens only once when the seal is pressed twice", () => {
    expect(run([{ type: "resourcesReady" }, { type: "open", animate: true }, { type: "open", animate: true }])).toBe("opening");
  });
  it("never reopens or regresses after done", () => {
    const events: GateEvent[] = [{ type: "resourcesReady" }, { type: "open", animate: true }, { type: "open", animate: false }, { type: "openFinished" }];
    expect(run(events, "done")).toBe("done");
  });
  it("ignores a stray openFinished", () => {
    expect(run([{ type: "openFinished" }], "ready")).toBe("ready");
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận fail**

Run: `npx vitest run tests/components/graduation/gate/gate-phase.test.ts`
Expected: FAIL, lỗi resolve module `@/components/graduation/gate/gate-phase`.

- [ ] **Step 3: Implement**

```ts
export type GatePhase = "arriving" | "ready" | "opening" | "done";

export type GateEvent = { type: "resourcesReady" } | { type: "open"; animate: boolean } | { type: "openFinished" };

/** The "you've got mail" cover: waits for resources, opens once, then gets out of the way. */
export function gateReducer(phase: GatePhase, event: GateEvent): GatePhase {
  switch (event.type) {
    case "resourcesReady":
      return phase === "arriving" ? "ready" : phase;
    case "open":
      if (phase !== "ready") return phase;
      return event.animate ? "opening" : "done";
    case "openFinished":
      return phase === "opening" ? "done" : phase;
  }
}
```

- [ ] **Step 4: Chạy test, xác nhận pass**

Run: `npx vitest run tests/components/graduation/gate/gate-phase.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add components/graduation/gate/gate-phase.ts tests/components/graduation/gate/gate-phase.test.ts
git commit -m "feat(graduation): letter gate phase reducer

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Tách `useScrollLock` để dùng chung

**Files:**
- Create: `lib/hooks/use-scroll-lock.ts`
- Modify: `app/admin/graduation/components/guest-editor-dialog.tsx:4` (import) và `:40-55` (effect khóa cuộn)

**Interfaces:**
- Produces: `useScrollLock(locked: boolean): void`. Khi `locked` thì khóa cả cuộn native lẫn Lenis.

Không có unit test vì đây là side-effect DOM trong môi trường `node`. Hành vi giữ nguyên với dialog hiện tại; kiểm chứng bằng tsc/lint và kiểm tra tay ở Task 8, bước 9.

- [ ] **Step 1: Tạo hook**

```ts
"use client";

import { useEffect } from "react";
import { useLenis } from "@/components/providers/lenis-context";

/** Freezes page scroll, native and Lenis, while `locked`. */
export function useScrollLock(locked: boolean) {
  const lenis = useLenis();
  useEffect(() => {
    if (!locked) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();
    return () => {
      document.body.style.overflow = previous;
      lenis?.start();
    };
  }, [locked, lenis]);
}
```

- [ ] **Step 2: Dùng hook trong dialog**

Trong `guest-editor-dialog.tsx`, xóa dòng `import { useLenis } from "@/components/providers/lenis-context";` và thêm `import { useScrollLock } from "@/lib/hooks/use-scroll-lock";`. Thay khối dòng 40–55 (từ comment `// Lock the page behind the modal…` đến hết `useEffect`) bằng:

```tsx
  useScrollLock(isOpen);
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);
```

- [ ] **Step 3: Kiểm tra kiểu và lint**

Run: `npx tsc --noEmit && npx eslint lib/hooks/use-scroll-lock.ts app/admin/graduation/components/guest-editor-dialog.tsx`
Expected: không có lỗi.

- [ ] **Step 4: Commit**

```bash
git add lib/hooks/use-scroll-lock.ts app/admin/graduation/components/guest-editor-dialog.tsx
git commit -m "refactor: extract useScrollLock from the guest editor dialog

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Con dấu sáp, thân phong bì và nắp dùng chung

**Files:**
- Create: `components/graduation/shared/wax-seal.tsx`
- Create: `components/graduation/envelope/envelope-body.tsx`
- Modify: `components/graduation/envelope/envelope-flap.tsx` (bỏ `Seal` nội bộ, thêm prop `id`, `sealed`)
- Modify: `components/graduation/envelope/envelope-back.tsx:11` (dùng `EnvelopeBody`)

**Interfaces:**
- Produces:
  - `WaxSeal({ className?: string; split?: boolean })`: không tự đặt `position`, caller tự truyền (`absolute …` hoặc `relative`). `split` tách con dấu thành hai nửa trôi ra và mờ dần trong 700ms.
  - `EnvelopeBody({ id?: string })`: thân phong bì chấm tomato, `absolute inset-0`.
  - `EnvelopeFlap({ id = "flap", sealed = true })`: `sealed={false}` thì vẽ nắp không có con dấu.

Đây là refactor thuần giao diện, nên kiểm chứng bằng mắt: màn phong bì hiện tại phải trông y hệt trước đó (Task 8, bước 8).

- [ ] **Step 1: Tạo `wax-seal.tsx`**

```tsx
const HALVES = [
  { clip: "[clip-path:polygon(0_0,58%_0,42%_100%,0_100%)]", apart: "-translate-x-4 -rotate-20 opacity-0" },
  { clip: "[clip-path:polygon(58%_0,100%_0,100%_100%,42%_100%)]", apart: "translate-x-4 rotate-20 opacity-0" },
] as const;

/** The "QV" wax seal, drawn as two halves so `split` can crack it open. */
export function WaxSeal({ className = "", split = false }: { className?: string; split?: boolean }) {
  return (
    <div className={`h-16 w-16 -rotate-10 ${className}`}>
      {HALVES.map(({ clip, apart }) => (
        <div
          key={clip}
          className={`absolute inset-0 grid place-items-center rounded-full border-[1.5px] border-ink bg-tomato transition-[transform,opacity] duration-700 ease-out ${clip} ${split ? apart : ""}`}
          style={{ boxShadow: "var(--offset-sm)" }}
        >
          <div className="grid h-12 w-12 place-items-center rounded-full border-[1.5px] border-dashed border-paper">
            <span className="font-heading text-lg font-bold text-paper">QV</span>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Tạo `envelope-body.tsx`** (chuyển nguyên markup từ `envelope-back.tsx:11`)

```tsx
export function EnvelopeBody({ id }: { id?: string }) {
  return (
    <div
      id={id}
      aria-hidden
      className="absolute inset-0 box-border rounded-lg border-[1.5px] border-ink bg-paper-2"
      style={{
        boxShadow: "var(--offset-lg)",
        backgroundImage: "radial-gradient(color-mix(in oklab, var(--tomato) 55%, transparent) 1.3px, transparent 1.6px)",
        backgroundSize: "11px 11px",
      }}
    />
  );
}
```

- [ ] **Step 3: Sửa `envelope-back.tsx`**

Thêm `import { EnvelopeBody } from "./envelope-body";` và thay dòng `<div id="envBody" aria-hidden … />` bằng `<EnvelopeBody id="envBody" />`.

- [ ] **Step 4: Sửa `envelope-flap.tsx`**

Xóa hàm `Seal` (dòng 6–15), thêm `import { WaxSeal } from "../shared/wax-seal";`, rồi đổi `EnvelopeFlap` thành:

```tsx
export function EnvelopeFlap({ id = "flap", sealed = true }: { id?: string; sealed?: boolean }) {
  return (
    <div id={id} aria-hidden className="pointer-events-none absolute top-0 left-0 z-3 h-[54%] w-full origin-top transform-3d">
      <div className={face}>
        <div className={`${shape} rounded-t-lg`}>
          <div className="absolute inset-0 bg-paper-2 [clip-path:polygon(0_0,100%_0,50%_100%)]" />
          <svg viewBox="0 0 160 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full"><polyline points="0,0 80,100 160,0" {...stroke} /></svg>
        </div>
        {sealed && <WaxSeal className="absolute top-full left-1/2 -mt-8.5 -ml-8" />}
      </div>
      {/* Inner face: pre-flipped, so its base is the local bottom edge and its tip the local top. */}
      <div className={`${face} -top-0.75 transform-[rotateX(180deg)]`}>
        <div className={`${shape} rounded-b-lg`}>
          <div className="absolute inset-0 bg-paper-2 [clip-path:polygon(0_100%,100%_100%,50%_0)]" style={{ backgroundImage: "repeating-linear-gradient(-45deg, color-mix(in oklab, var(--tomato) 70%, transparent) 0 5px, transparent 5px 14px)" }} />
          <svg viewBox="0 0 160 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full"><polyline points="0,100 80,0 160,100" {...stroke} /></svg>
        </div>
        {sealed && <WaxSeal className="absolute bottom-full left-1/2 -mb-8.5 -ml-8" />}
      </div>
    </div>
  );
}
```

Xóa luôn comment "Wax seal on the flap tip…" vì nó đi theo hàm `Seal` đã bị xóa.

- [ ] **Step 5: Kiểm tra**

Run: `npx tsc --noEmit && npx eslint components/graduation/shared/wax-seal.tsx components/graduation/envelope`
Expected: không có lỗi.

- [ ] **Step 6: Commit**

```bash
git add components/graduation/shared/wax-seal.tsx components/graduation/envelope
git commit -m "refactor(graduation): shared wax seal and envelope body

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Viết lại `useYouTubePlayer` theo hướng chỉ phát khi có activation

**Files:**
- Modify (viết lại toàn bộ): `components/graduation/music/use-youtube-player.ts`
- Delete: `components/graduation/music/music-mini-player.tsx` (không còn được import ở đâu, và phụ thuộc `open`/`close` đã bị bỏ)

**Interfaces:**
- Produces: `useYouTubePlayer(videoId: string, onError: () => void, onReady?: () => void)` trả về:
  - `status: MusicStatus`
  - `mountRef: RefObject<HTMLDivElement | null>`
  - `start(): void`: gọi đồng bộ trong handler click. Nếu player chưa ready thì phát ngay khi ready.
  - `toggle(): void`: nút ♪.
  - `fadeTo(to: number, ms?: number, onDone?: () => void): void`: task 2 của spec dùng hàm này.
  - `fadePause(): void` / `fadeResume(): void`: tour 360°. Chỉ phát lại nếu trước khi duck nhạc đang phát.
- Breaking: bỏ tham số `autoStart` và các giá trị trả về `open`, `close`, `pause`, `resume`. `invitation.tsx` sẽ được sửa ở Task 7, nên tsc báo lỗi ở file đó cho tới Task 7 là bình thường.

Hook phụ thuộc YouTube iframe và rAF nên không unit-test được trong môi trường `node`. Hành vi được kiểm tra tay ở Task 8, bước 2–7.

- [ ] **Step 1: Thay toàn bộ nội dung file**

```ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadYouTubeIframeApi } from "@/lib/youtube/load-iframe-api";
import type { YTPlayer } from "@/lib/youtube/types";

export type MusicStatus = "idle" | "loading" | "playing" | "paused" | "error";

const FADE_MS = 1200;
const FULL_VOLUME = 100;
/** Still not playing this long after a gesture means the browser refused it (iOS Safari can). */
const START_CHECK_MS = 1500;
const YT_PLAYING = 1;

/**
 * Background track in a hidden YouTube iframe. Browsers only allow audible playback from a user
 * activation, so `start` and `toggle` must run synchronously inside a click or key handler.
 */
export function useYouTubePlayer(videoId: string, onError: () => void, onReady?: () => void) {
  const [status, setStatus] = useState<MusicStatus>(videoId ? "loading" : "idle");
  const mountRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  // getVolume() lags behind setVolume() over postMessage, so fades track the level themselves.
  const volume = useRef(FULL_VOLUME);
  const wantsPlay = useRef(false);
  const resumeAfterDuck = useRef(false);
  const fadeFrame = useRef<number | null>(null);
  const startCheck = useRef<number | undefined>(undefined);
  const onErrorRef = useRef(onError);
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onErrorRef.current = onError;
    onReadyRef.current = onReady;
  }, [onError, onReady]);

  const cancelFade = useCallback(() => {
    if (fadeFrame.current != null) cancelAnimationFrame(fadeFrame.current);
    fadeFrame.current = null;
  }, []);

  const setVolume = useCallback((p: YTPlayer, v: number) => {
    volume.current = v;
    p.setVolume(v);
  }, []);

  /** Ramp the volume to `to` (0–100); a later fade cancels this one. */
  const fadeTo = useCallback(
    (to: number, ms = FADE_MS, onDone?: () => void) => {
      const p = playerRef.current;
      if (!p) return;
      cancelFade();
      const from = volume.current;
      const t0 = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / ms);
        setVolume(p, Math.round(from + (to - from) * k));
        if (k < 1) fadeFrame.current = requestAnimationFrame(step);
        else {
          fadeFrame.current = null;
          onDone?.();
        }
      };
      fadeFrame.current = requestAnimationFrame(step);
    },
    [cancelFade, setVolume],
  );

  const begin = useCallback(
    (p: YTPlayer) => {
      wantsPlay.current = false;
      p.unMute();
      setVolume(p, 0);
      p.playVideo();
      fadeTo(FULL_VOLUME);
      window.clearTimeout(startCheck.current);
      startCheck.current = window.setTimeout(() => {
        if (p.getPlayerState() !== YT_PLAYING) onErrorRef.current();
      }, START_CHECK_MS);
    },
    [fadeTo, setVolume],
  );

  const fail = useCallback(() => {
    playerRef.current = null;
    setStatus("error");
    onErrorRef.current();
    // A failed player is still "done loading" for anyone awaiting readiness.
    onReadyRef.current?.();
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!videoId || !mount) return;
    let cancelled = false;
    let instance: YTPlayer | null = null;
    loadYouTubeIframeApi()
      .then((YT) => {
        if (cancelled) return;
        instance = new YT.Player(mount, {
          host: "https://www.youtube-nocookie.com",
          videoId,
          width: 200,
          height: 200,
          playerVars: { autoplay: 0, loop: 1, playlist: videoId, controls: 0, playsinline: 1, modestbranding: 1, rel: 0 },
          events: {
            onReady: (e) => {
              playerRef.current = e.target;
              setStatus("paused");
              if (wantsPlay.current) begin(e.target);
              onReadyRef.current?.();
            },
            onStateChange: (e) => {
              if (e.data === YT.PlayerState.PLAYING) setStatus("playing");
              else if (e.data === YT.PlayerState.PAUSED) setStatus("paused");
            },
            onError: fail,
          },
        });
      })
      .catch(() => !cancelled && fail());
    return () => {
      cancelled = true;
      cancelFade();
      window.clearTimeout(startCheck.current);
      instance?.destroy();
      playerRef.current = null;
    };
  }, [videoId, begin, fail, cancelFade]);

  useEffect(() => {
    let resume = false;
    const onVisibility = () => {
      const p = playerRef.current;
      if (!p) return;
      if (document.hidden) {
        resume = p.getPlayerState() === YT_PLAYING;
        if (resume) p.pauseVideo();
      } else if (resume) p.playVideo();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const start = useCallback(() => {
    const p = playerRef.current;
    if (p) begin(p);
    else wantsPlay.current = true;
  }, [begin]);

  const toggle = useCallback(() => {
    const p = playerRef.current;
    if (!p) {
      if (status === "loading") wantsPlay.current = true;
      else onErrorRef.current();
      return;
    }
    if (status === "playing") {
      cancelFade();
      p.pauseVideo();
    } else begin(p);
  }, [status, begin, cancelFade]);

  const fadePause = useCallback(() => {
    const p = playerRef.current;
    resumeAfterDuck.current = p?.getPlayerState() === YT_PLAYING;
    if (resumeAfterDuck.current) fadeTo(0, FADE_MS, () => p?.pauseVideo());
  }, [fadeTo]);

  const fadeResume = useCallback(() => {
    const p = playerRef.current;
    if (!p || !resumeAfterDuck.current) return;
    resumeAfterDuck.current = false;
    p.playVideo();
    fadeTo(FULL_VOLUME);
  }, [fadeTo]);

  return { status, mountRef, start, toggle, fadeTo, fadePause, fadeResume };
}
```

- [ ] **Step 2: Xóa mini player**

Run: `git rm components/graduation/music/music-mini-player.tsx`

- [ ] **Step 3: Lint file hook**

Run: `npx eslint components/graduation/music`
Expected: không có lỗi. (`npx tsc` lúc này sẽ báo lỗi ở `invitation.tsx`, Task 7 sửa.)

- [ ] **Step 4: Commit**

```bash
git add components/graduation/music
git commit -m "refactor(graduation): music plays only from a user activation

Drops muted autoplay and global gesture listeners: an unmute from a
wheel scroll is not an activation, so Chrome paused the track.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Overlay của `ResourceGateProvider` thay được, tách `HalftoneBackdrop`

**Files:**
- Create: `components/ui/halftone-backdrop.tsx`
- Modify: `components/ui/loading-overlay.tsx:17-26`
- Modify: `components/graduation/loading/resource-gate.tsx:35-73`

**Interfaces:**
- Produces:
  - `HalftoneBackdrop()`: lớp chấm halftone `absolute inset-0` bên trong parent đã định vị.
  - `ResourceGateProvider({ resources, overlay?, children })`, với `overlay?: (ready: boolean) => ReactNode` mặc định là `(ready) => <LoadingOverlay ready={ready} />`.

- [ ] **Step 1: Tạo `halftone-backdrop.tsx`**

```tsx
export function HalftoneBackdrop() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-40 mix-blend-multiply"
      style={{
        background: "radial-gradient(color-mix(in oklab, var(--ink) 8%, transparent) 1px, transparent 1.5px)",
        backgroundSize: "22px 22px",
      }}
    />
  );
}
```

- [ ] **Step 2: Dùng trong `loading-overlay.tsx`**

Thêm `import { HalftoneBackdrop } from "./halftone-backdrop";`. Thay khối `{/* halftone backdrop */}` cùng thẻ `<span … />` (dòng 17–26) bằng `<HalftoneBackdrop />`.

- [ ] **Step 3: Thêm prop `overlay`**

Trong `resource-gate.tsx`, thêm `const defaultOverlay = (ready: boolean) => <LoadingOverlay ready={ready} />;` phía trên provider, rồi thay doc comment, chữ ký và phần render:

```tsx
/**
 * Holds a full-screen cover (`overlay`, the riso LoadingOverlay by default) over `children` until
 * every id in `resources` has been resolved, with a hard timeout so a stuck resource can never
 * block the page forever.
 */
export function ResourceGateProvider({
  resources,
  overlay = defaultOverlay,
  children,
}: {
  resources: readonly string[];
  overlay?: (ready: boolean) => ReactNode;
  children: ReactNode;
}) {
```

và ở cuối hàm:

```tsx
  return (
    <ResourceGateContext.Provider value={value}>
      {children}
      {overlay(ready)}
    </ResourceGateContext.Provider>
  );
```

- [ ] **Step 4: Kiểm tra**

Run: `npx eslint components/ui components/graduation/loading`
Expected: không có lỗi.

- [ ] **Step 5: Commit**

```bash
git add components/ui/halftone-backdrop.tsx components/ui/loading-overlay.tsx components/graduation/loading/resource-gate.tsx
git commit -m "refactor: pluggable resource gate overlay, shared halftone backdrop

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Âm thanh hiệu ứng tổng hợp bằng Web Audio

**Files:**
- Create: `lib/graduation/sfx.ts`

**Interfaces:**
- Produces: `playSfx(name: "crack" | "rustle", delaySec?: number): void`. Chỉ gọi sau user activation. Không bao giờ throw.

Phụ thuộc `AudioContext` nên không test được trong môi trường `node`; nghe thử ở Task 8, bước 2.

- [ ] **Step 1: Tạo file**

```ts
type Sfx = "crack" | "rustle";

const SHAPES: Record<Sfx, { duration: number; freq: number; q: number; gain: number }> = {
  crack: { duration: 0.12, freq: 1800, q: 0.8, gain: 0.5 },
  rustle: { duration: 0.6, freq: 3200, q: 0.4, gain: 0.18 },
};

let ctx: AudioContext | null = null;

/** A short filtered-noise burst; decoration only, so any audio failure is swallowed. */
export function playSfx(name: Sfx, delaySec = 0) {
  try {
    ctx ??= new AudioContext();
    const { duration, freq, q, gain } = SHAPES[name];
    const length = Math.ceil(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = freq;
    filter.Q.value = q;
    const amp = ctx.createGain();
    amp.gain.value = gain;
    source.connect(filter).connect(amp).connect(ctx.destination);
    source.start(ctx.currentTime + delaySec);
  } catch {
    return;
  }
}
```

- [ ] **Step 2: Lint**

Run: `npx eslint lib/graduation/sfx.ts`
Expected: không có lỗi.

- [ ] **Step 3: Commit**

```bash
git add lib/graduation/sfx.ts
git commit -m "feat(graduation): synthesized seal-crack and paper sfx

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Copy, `useLetterGate`, `LetterGate` và nối dây trang

**Files:**
- Modify: `lib/graduation/i18n/types.ts` (thêm `gate`, bỏ `music`)
- Modify: `lib/graduation/i18n/copy/vi.ts`, `lib/graduation/i18n/copy/en.ts`
- Test: `tests/lib/graduation/i18n/i18n.test.ts`
- Create: `components/graduation/gate/use-letter-gate.ts`
- Create: `components/graduation/gate/letter-gate.tsx`
- Modify: `app/globals.css` (thêm keyframes ngay sau `@keyframes wish-pop`)
- Modify: `components/graduation/invitation.tsx` (viết lại)

**Interfaces:**
- Consumes:
  - `gateReducer` (Task 1)
  - `useScrollLock` (Task 2)
  - `WaxSeal`, `EnvelopeBody`, `EnvelopeFlap({ id, sealed })` (Task 3)
  - `useYouTubePlayer(...).start/toggle/fadePause/fadeResume/mountRef/status` (Task 4)
  - `ResourceGateProvider({ overlay })`, `HalftoneBackdrop` (Task 5)
  - `playSfx` (Task 6)
- Produces:
  - `GraduationCopy["gate"] = { youHaveMail: string; preparing: string; tapToOpen: string }`
  - `useLetterGate(ready: boolean, opts: { animate: boolean; openMs: number }): { phase: GatePhase; open: () => void }`
  - `LetterGate({ ready: boolean; onOpen: () => void })`

> Lưu ý: `vi.ts` và `en.ts` đang có sẵn thay đổi chưa commit của người dùng (`envelope.airMail`, `envelope.invitationNo`). Commit của task này sẽ gộp luôn các thay đổi đó, đúng như ý định của người dùng.

- [ ] **Step 1: Viết test copy (failing)**

Thêm vào khối `describe("GRADUATION_COPY", …)` trong `tests/lib/graduation/i18n/i18n.test.ts`:

```ts
  it("has the letter gate copy in every language", () => {
    for (const copy of Object.values(GRADUATION_COPY)) {
      expect(copy.gate.youHaveMail && copy.gate.preparing && copy.gate.tapToOpen).toBeTruthy();
    }
  });
```

- [ ] **Step 2: Chạy test, xác nhận fail**

Run: `npx vitest run tests/lib/graduation/i18n/i18n.test.ts`
Expected: FAIL, `TypeError: Cannot read properties of undefined (reading 'youHaveMail')`.

- [ ] **Step 3: Thêm kiểu và copy**

Trong `types.ts`, thay dòng `music: { nowPlaying: string; close: string };` bằng:

```ts
  gate: { youHaveMail: string; preparing: string; tapToOpen: string };
```

Trong `vi.ts`, thay dòng `music: { nowPlaying: "♪ Đang phát", close: "Tắt nhạc" },` bằng:

```ts
  gate: { youHaveMail: "Bạn có thư", preparing: "Đang chuẩn bị lá thư…", tapToOpen: "Chạm vào con dấu để mở thư" },
```

Trong `en.ts`, thay dòng `music: { nowPlaying: "♪ Now playing", close: "Close music" },` bằng:

```ts
  gate: { youHaveMail: "You've got mail", preparing: "Preparing your letter…", tapToOpen: "Tap the seal to open" },
```

- [ ] **Step 4: Chạy test, xác nhận pass**

Run: `npx vitest run tests/lib/graduation/i18n/i18n.test.ts`
Expected: PASS.

- [ ] **Step 5: Tạo `use-letter-gate.ts`**

Hook này khóa cuộn và đưa trang về đầu: câu chuyện luôn bắt đầu từ lá thư, kể cả khi reload ở giữa trang.

```ts
"use client";

import { useCallback, useEffect, useReducer } from "react";
import { useScrollLock } from "@/lib/hooks/use-scroll-lock";
import { gateReducer } from "./gate-phase";

export function useLetterGate(ready: boolean, { animate, openMs }: { animate: boolean; openMs: number }) {
  const [phase, dispatch] = useReducer(gateReducer, "arriving");

  useEffect(() => {
    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    return () => {
      history.scrollRestoration = previous;
    };
  }, []);

  useEffect(() => {
    if (ready) dispatch({ type: "resourcesReady" });
  }, [ready]);

  useEffect(() => {
    if (phase !== "opening") return;
    const timer = window.setTimeout(() => dispatch({ type: "openFinished" }), openMs);
    return () => window.clearTimeout(timer);
  }, [phase, openMs]);

  useScrollLock(phase !== "done");

  const open = useCallback(() => dispatch({ type: "open", animate }), [animate]);
  return { phase, open };
}
```

- [ ] **Step 6: Thêm keyframes vào `app/globals.css`** (ngay sau khối `@keyframes wish-pop { … }`)

```css
@keyframes gate-drop {
  from {
    opacity: 0;
    transform: translateY(-40vh) rotate(-8deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotate(-2deg);
  }
}

@keyframes gate-out {
  0%,
  45% {
    opacity: 1;
  }
  to {
    opacity: 0;
    transform: scale(1.04);
  }
}
```

- [ ] **Step 7: Tạo `letter-gate.tsx`**

```tsx
"use client";

import { useEffect, useRef } from "react";
import { HalftoneBackdrop } from "@/components/ui/halftone-backdrop";
import { playSfx } from "@/lib/graduation/sfx";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { EnvelopeBody } from "../envelope/envelope-body";
import { EnvelopeFlap } from "../envelope/envelope-flap";
import { useCopy } from "../i18n/lang-context";
import { WaxSeal } from "../shared/wax-seal";
import { useLetterGate } from "./use-letter-gate";

const OPEN_MS = 900;

/** "You've got mail": a sealed envelope whose seal is the user activation that starts the music. */
export function LetterGate({ ready, onOpen }: { ready: boolean; onOpen: () => void }) {
  const { gate: t } = useCopy();
  const reduced = useReducedMotion();
  const { phase, open } = useLetterGate(ready, { animate: !reduced, openMs: OPEN_MS });
  const sealRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (phase === "ready") sealRef.current?.focus({ preventScroll: true });
  }, [phase]);

  if (phase === "done") return null;

  const opening = phase === "opening";
  const handleOpen = () => {
    if (phase !== "ready") return;
    onOpen();
    if (!reduced) {
      playSfx("crack");
      playSfx("rustle", 0.15);
    }
    open();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.youHaveMail}
      className={`fixed inset-0 z-100 flex flex-col items-center justify-center gap-[clamp(24px,5vh,48px)] bg-paper px-6 ${
        opening ? "pointer-events-none animate-[gate-out_0.9s_ease-in_both]" : ""
      }`}
    >
      <HalftoneBackdrop />
      <p className="relative m-0 font-heading text-[clamp(32px,6vw,56px)] leading-none font-bold tracking-[-0.03em] text-ink">
        {t.youHaveMail}
      </p>
      <div className="relative aspect-[1.6/1] w-[min(420px,80vw)] motion-safe:animate-[gate-drop_0.8s_cubic-bezier(0.22,1,0.36,1)_both]">
        <EnvelopeBody />
        <EnvelopeFlap id="gateFlap" sealed={false} />
        <button
          ref={sealRef}
          type="button"
          onClick={handleOpen}
          disabled={phase !== "ready"}
          aria-label={t.tapToOpen}
          className="riso-focus absolute top-[54%] left-1/2 z-4 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-0 bg-transparent p-0 disabled:cursor-wait"
        >
          {phase === "ready" && (
            <span aria-hidden className="absolute -inset-2 rounded-full border-[1.5px] border-tomato motion-safe:animate-[pulse-dot_1.4s_ease-in-out_infinite]" />
          )}
          <WaxSeal split={opening} className="relative" />
        </button>
      </div>
      <p aria-live="polite" className="relative m-0 font-mono text-[12px] tracking-[0.22em] text-ink-2 uppercase">
        {phase === "arriving" ? t.preparing : t.tapToOpen}
      </p>
    </div>
  );
}
```

- [ ] **Step 8: Viết lại `invitation.tsx`**

`LangProvider` được đưa lên ngoài cùng vì `LetterGate` cần copy. `LetterGate` render trong `InvitationContent` vì nó cần `music.start`, và provider nhận overlay rỗng. Mount của YouTube được bọc trong một div `sr-only`, vì YouTube thay thế chính phần tử mount bằng iframe (iframe không giữ class của phần tử đó).

```tsx
"use client";

import { useEffect, useRef } from "react";
import { GRADUATION_EVENT } from "@/lib/graduation/event";
import type { Lang } from "@/lib/graduation/i18n";
import type { InvitationGuest, RsvpAnswer } from "@/lib/graduation/types";
import { useTransientFlag } from "@/lib/hooks/use-transient-flag";
import { useGradCharacter } from "./character/use-grad-character";
import { InvitationFooter } from "./chrome/invitation-footer";
import { InvitationHeader } from "./chrome/invitation-header";
import { SideRails } from "./chrome/side-rails";
import { EndsSection } from "./ends/ends-section";
import { EnvelopeStage } from "./envelope/envelope-stage";
import { LetterGate } from "./gate/letter-gate";
import { LangProvider } from "./i18n/lang-context";
import {
  GRADUATION_GATE_RESOURCES as GATE,
  ResourceGateProvider,
  useResourceGate,
} from "./loading/resource-gate";
import { MetSection } from "./met/met-section";
import { useYouTubePlayer } from "./music/use-youtube-player";
import { RsvpSection } from "./rsvp/rsvp-section";
import { WishesSection } from "./wishes/wishes-section";

type InvitationProps = {
  guest: InvitationGuest;
  initialRsvp: RsvpAnswer | null;
  initialLang: Lang;
  ownerPhone: string | null;
};

const NO_OVERLAY = () => null;

export function GraduationInvitation(props: InvitationProps) {
  return (
    <LangProvider initialLang={props.initialLang} customContent={props.guest.customContent}>
      <ResourceGateProvider resources={Object.values(GATE)} overlay={NO_OVERLAY}>
        <InvitationContent {...props} />
      </ResourceGateProvider>
    </LangProvider>
  );
}

function InvitationContent({ guest, initialRsvp, ownerPhone }: InvitationProps) {
  const gate = useResourceGate();
  const canvasHost = useRef<HTMLDivElement>(null);
  useGradCharacter(canvasHost, { onReady: () => gate?.resolve(GATE.character) });
  const [musicNote, flashMusicNote] = useTransientFlag(2600);
  const musicId = guest.customContent?.music?.youtubeId || GRADUATION_EVENT.musicYoutubeId;
  const music = useYouTubePlayer(musicId, flashMusicNote, () => gate?.resolve(GATE.music));

  // No track configured means there is no music to wait for.
  useEffect(() => {
    if (!musicId) gate?.resolve(GATE.music);
  }, [musicId, gate]);

  return (
    <div id="top" className="relative bg-paper font-sans text-ink">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-15" style={{ backgroundImage: "radial-gradient(var(--halftone) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <div ref={canvasHost} aria-hidden className="pointer-events-none fixed inset-0 z-25" />

      <LetterGate ready={!gate?.pending} onOpen={music.start} />
      <InvitationHeader musicPlaying={music.status === "playing"} musicNote={musicNote} onMusic={music.toggle} />
      <SideRails />

      <main>
        <EnvelopeStage guestName={guest.name} />
        <MetSection guestName={guest.name} note={guest.customContent?.met?.note ?? guest.note} />
        <EndsSection onTourOpen={music.fadePause} onTourClose={music.fadeResume} />
        <RsvpSection slug={guest.slug} guestName={guest.name} initialRsvp={initialRsvp} ownerPhone={ownerPhone} />
        <WishesSection />
      </main>

      <InvitationFooter />
      <div aria-hidden className="sr-only">
        <div ref={music.mountRef} />
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Kiểm tra toàn bộ**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: tsc và lint không có lỗi; mọi test pass (gồm 7 test của `gate-phase` và test copy mới).

- [ ] **Step 10: Commit**

```bash
git add lib/graduation/i18n tests/lib/graduation/i18n/i18n.test.ts components/graduation/gate app/globals.css components/graduation/invitation.tsx
git commit -m "feat(graduation): \"you've got mail\" letter gate starts the music

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Kiểm tra trên trình duyệt

Không có thay đổi code, trừ khi phát hiện lỗi. Nếu có lỗi thì sửa trong task tương ứng rồi commit `fix(graduation): …`.

Chạy `npm run dev`, lấy một slug khách từ `/admin/graduation`, mở `/graduation?to=<slug>` trong Chrome (dùng skill `run` hoặc `claude-in-chrome`). Theo dõi console bằng filter `YouTube|Autoplay|play\(\)`.

- [ ] **Step 1:** Reload trang. Phải thấy "Bạn có thư", phong bì rơi vào, dòng "Đang chuẩn bị lá thư…". Không cuộn được (thử cả lăn chuột lẫn kéo thanh cuộn).
- [ ] **Step 2:** Khi dòng chữ đổi sang "Chạm vào con dấu để mở thư", vòng tomato nhấp nháy. Click con dấu: con dấu tách đôi, có tiếng "tách" và tiếng giấy, overlay mờ đi khoảng 0.9s, nhạc nhỏ rồi to dần. Trang mở ở đầu (`#stage`).
- [ ] **Step 3:** Reload. Khi con dấu sẵn sàng, nó phải có focus ring. Nhấn Enter: kết quả như bước 2.
- [ ] **Step 4:** Throttle mạng sang "Slow 3G" trong DevTools, reload, đợi hết 8s rồi click con dấu ngay khi bấm được. Nhạc phải tự phát khi player tải xong, không cần click lại.
- [ ] **Step 5:** Cuộn liên tục qua toàn trang bằng con lăn chuột. Nhạc **không** dừng, console không có cảnh báo autoplay.
- [ ] **Step 6:** Bấm ♪ để tắt nhạc, chuyển sang tab khác rồi quay lại: nhạc vẫn tắt. Mở tour 360° rồi đóng: nhạc vẫn tắt. Bật ♪ lại: nhạc to dần.
- [ ] **Step 7:** Trong Chrome, vào Site settings, đặt Sound thành "Mute", reload, mở thư: trang vẫn hoạt động. Nếu `getPlayerState` không về `1`, phải thấy "Không phát được nhạc" dưới header đúng một lần.
- [ ] **Step 8:** Bật "Emulate prefers-reduced-motion: reduce": không có animation rơi/tách, click thì đóng overlay ngay, không có âm thanh hiệu ứng, nhạc vẫn phát. Tắt emulate và cuộn qua màn phong bì: nắp vẫn có con dấu, nhìn y hệt trước khi refactor.
- [ ] **Step 9:** Mở `/admin/graduation`, mở dialog sửa khách: trang phía sau không cuộn được, Escape đóng được dialog, đóng xong cuộn lại bình thường.
- [ ] **Step 10:** Chuyển ngôn ngữ sang EN rồi reload: hiện "You've got mail" và "Tap the seal to open".
