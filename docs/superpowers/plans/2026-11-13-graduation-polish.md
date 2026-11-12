# Thiệp tốt nghiệp: bốn cải tiến hoàn thiện — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polaroid kể chuyện + ảnh chụp chung, khoảnh khắc "Sẽ đến" (dấu, tiếng, rung, thêm vào lịch), dải halftone giữa các section, và chế độ tối hoàn chỉnh cho thiệp tốt nghiệp.

**Architecture:** Bốn phần độc lập, làm theo thứ tự 1 → 4. Mỗi task là một đơn vị nhỏ, một trách nhiệm. Hàm thuần (`calendarLinks`, `calendarTargetFor`, `seamLayers`) tách khỏi component để test được. Màu cho cảnh 3D đi qua một kiểu `RisoPalette` duy nhất, đồng bộ theme bằng một hook dùng chung.

**Tech Stack:** Next.js 16 (App Router), React 19, GSAP 3 + ScrollTrigger, three.js, Tailwind v4, zod, vitest.

**Spec:** `docs/superpowers/specs/2026-11-13-graduation-polish-design.md`

## Global Constraints

- Áp dụng cho điện thoại (< 760px, `MOBILE_BREAKPOINT`) và màn rộng.
- Giữ `prefers-reduced-motion`: phần nào có hiệu ứng phải có trạng thái tĩnh tương ứng.
- Không thêm thư viện mới.
- Copy mới có cả `vi` và `en`, khai báo trong `lib/graduation/i18n/types.ts`.
- Dùng token trong `app/globals.css`, không viết cứng màu trong `components/graduation` (trừ ngoại lệ có comment).
- Dùng lại: `RisoButton`, `Tape`, `ImageUploader`, `useIsDark`, `useMediaQuery`, `buildIcs`, `lib/graduation/sfx.ts`.
- Comment chỉ khi thật sự cần (giải thích *vì sao*). Không comment lan man.
- Mỗi task: tự review diff một lần → `npx tsc --noEmit` + `npm run lint` + `npm test` (khi có liên quan) → commit. Chỉ `git add` file của task (không đụng `docs/mobile-fix-plan.md`).

## Review Focus

1. Khách không có `togetherPhoto` (hoặc chuỗi rỗng sau khi admin xoá ảnh) → đúng 4 ảnh, không có ô trống. (Task 4)
2. Admin tuỳ chỉnh số moment khác 4 (1 hoặc 6) → 4 ô ảnh vẫn có ảnh + chú thích, ảnh chung vẫn là ô thứ 5. (Task 3, 4)
3. Hồi âm "Không đến" và lần tải lại trang với hồi âm có sẵn → không phát tiếng, không rung, giữ dấu tròn cũ. (Task 12, 13)
4. Đổi theme khi cảnh 3D chưa tạo xong hoặc WebGL không có → không lỗi. (Task 18–21)
5. Hai section cùng màu (wishes → finale) → dải vẫn thấy được. (Task 15)

---

## Phần 1: Ảnh ký ức kể chuyện

### Task 1: Trường `togetherPhoto` trong dữ liệu khách

**Files:**
- Modify: `lib/graduation/types.ts` (`MetCustomization`)
- Modify: `lib/graduation/guest-custom-schema.ts` (`met`)
- Test: `tests/lib/graduation/guest-custom-schema.test.ts`

**Interfaces:** Produces `MetCustomization.togetherPhoto?: string`.

- [ ] Thêm test: schema giữ `met.togetherPhoto` (đã trim) và chấp nhận khi thiếu.
- [ ] Chạy `npx vitest run tests/lib/graduation/guest-custom-schema.test.ts` → FAIL (zod strip trường lạ).
- [ ] Thêm `togetherPhoto?: string;` vào `MetCustomization`, `togetherPhoto: z.string().trim().optional(),` vào schema `met`.
- [ ] Chạy lại → PASS. Review, commit `feat(graduation): guests can carry a together photo`.

### Task 2: Copy `met.togetherCaption`

**Files:** `lib/graduation/i18n/types.ts`, `copy/vi.ts`, `copy/en.ts`, test `tests/lib/graduation/i18n/i18n.test.ts`

**Interfaces:** Produces `met.togetherCaption: (name: string) => string`.

- [ ] Test: `vi.met.togetherCaption("Lan") === "Mình & Lan"`, `en.met.togetherCaption("Lan") === "Us · Lan"`. FAIL.
- [ ] Thêm vào type và hai file copy. PASS. Commit `copy(graduation): caption for the together photo`.

### Task 3: Ô ảnh `TOGETHER_PHOTO` và `memorySlot(i)`

**Files:** `components/graduation/met/finale/constants.ts`, `components/graduation/met/finale/finale-timeline.ts`

**Interfaces:** Produces
```ts
export type MemorySlot = { width: string; rot: number; phone: Spot; wide: Spot; drift: number; spin: number; enter: readonly [number, number] };
export const MEMORY_PHOTOS: readonly MemorySlot[];
export const TOGETHER_PHOTO: MemorySlot; // enter: [0.72, 0.96]
export const memorySlot: (i: number) => MemorySlot; // MEMORY_PHOTOS[i] ?? TOGETHER_PHOTO
```

- [ ] Gắn kiểu `MemorySlot` cho `MEMORY_PHOTOS` (bỏ `as const`), thêm `TOGETHER_PHOTO` (căn giữa, `rest` ngay trên mép trên của thiệp, width chặn theo `vh` để không chạm header) và `memorySlot`.
- [ ] `finale-timeline.ts`: thay `MEMORY_PHOTOS[i % MEMORY_PHOTOS.length]` bằng `memorySlot(i)`. Không đổi độ dài pin.
- [ ] `tsc` + `npm test`. Commit `feat(graduation): a fifth memory slot for the together photo`.

### Task 4: Polaroid có đế + chú thích, ảnh chung có washi

**Files:**
- Create: `components/graduation/met/components/memory-polaroid.tsx`
- Modify: `met/components/finale-memory-photos.tsx`, `met/components/note-finale-stage.tsx`, `met/met-section.tsx`, `components/graduation/invitation.tsx`

**Interfaces:**
```tsx
MemoryPolaroid({ slot: MemorySlot; image: string; caption: string; children?: ReactNode })
FinaleMemoryPhotos({ memories: Moment[]; together?: string; guestName: string })
NoteFinaleStage({ guestName, label, note, memories: Moment[], together?: string })
MetSection({ guestName, note, togetherPhoto?: string })
```

- [ ] `MemoryPolaroid`: `figure[data-memory-photo]`, viền mỏng ba cạnh `p-1.5`, đế `pb-6 min-[760px]:pb-8`; `figcaption` heading nghiêng `text-[10.5px] min-[760px]:text-[12.5px]`, `truncate`; vị trí qua CSS var như hiện tại.
- [ ] `FinaleMemoryPhotos`: 4 ô `MEMORY_PHOTOS` lấy `memories[i % memories.length]`, chú thích `${year} · ${title}`; nếu có `together` render ô thứ 5 (sau cùng trong DOM) với `Tape` ở góc và chú thích `t.met.togetherCaption(guestName)`. `memories.length === 0` → `null`.
- [ ] Nối dây: `invitation.tsx` truyền `guest.customContent?.met?.togetherPhoto`; `MetSection` truyền `memories={reduced ? [] : t.moments}` và `together`.
- [ ] `tsc`, lint. Commit `feat(graduation): memory photos become captioned polaroids, with an optional together photo`.

### Task 5: Admin upload ảnh chụp chung

**Files:** `app/admin/graduation/components/tabs/moments-tab.tsx`

- [ ] Thêm khối "3. Ảnh chụp chung với khách" dùng `ImageUploader`, `onChange={(url) => onChange({ ...met, togetherPhoto: url || undefined })}`.
- [ ] `tsc`, lint. Commit `feat(admin): upload a together photo per guest`.

### Task 6: Đo và chỉnh vị trí trên trình duyệt

- [ ] Chạy dev, mở thiệp có `togetherPhoto`, cuộn tới ~95% quãng pin ở 340×720 và 1024×720. Đo bằng `getBoundingClientRect`: ảnh chung lộ ≥ 95%, mỗi ảnh ký ức ≥ 50%, không ảnh nào dưới header, chú thích không tràn. Chỉnh số trong `constants.ts` nếu cần. Commit `style(graduation): ...` nếu có thay đổi.

---

## Phần 2: Khoảnh khắc "Sẽ đến"

### Task 7: Âm `"stamp"`

**Files:** `lib/graduation/sfx.ts`

**Interfaces:** `type Sfx = "buzz" | "rustle" | "stamp"`.

- [ ] Tách `noiseBurst(ac, duration)` (bộ đệm nhiễu tắt dần) dùng chung cho `rustle` và tiếng tách.
- [ ] `stamp(ac, at)`: sine 140→60Hz trong 0,12s + nhiễu ngắn qua highpass.
- [ ] `playSfx` tra bảng `PLAYERS: Record<Sfx, Player>` thay cho toán tử ba ngôi.
- [ ] `tsc`, lint. Commit `feat(graduation): synthesized rubber-stamp thud`.

### Task 8: `calendarLinks`

**Files:** Create `lib/graduation/calendar.ts`; modify `lib/graduation/ics.ts` (export `toIcsDate`), `lib/graduation/event.ts` (`eventLocation`); test `tests/lib/graduation/calendar.test.ts`

**Interfaces:**
```ts
export type CalendarTarget = "apple" | "google";
export const ICS_PATH = "/graduation/calendar.ics";
export function calendarLinks(event: GraduationEvent): Record<CalendarTarget, string>;
export const eventLocation: (event: GraduationEvent) => string; // event.ts
```

- [ ] Test: `apple === ICS_PATH`; Google URL có `action=TEMPLATE`, `text` = title, `dates=20261128T163000Z/20261128T183000Z`, `location` = `venue, address`. FAIL.
- [ ] Cài đặt, dùng lại `toIcsDate` và `eventLocation` (cũng dùng trong `buildIcs`). PASS + `ics.test.ts` vẫn PASS. Commit `feat(graduation): Google and Apple calendar links for the event`.

### Task 9: Route `/graduation/calendar.ics`

**Files:** Create `app/graduation/calendar.ics/route.ts`; test `tests/app/graduation/calendar-ics-route.test.ts`

- [ ] Test: `GET()` → 200, `content-type` `text/calendar; charset=utf-8`, `content-disposition` inline + filename, body bắt đầu bằng `BEGIN:VCALENDAR` và chứa `DTSTART:20261128T163000Z`. FAIL.
- [ ] Cài đặt. PASS. Commit `feat(graduation): serve the event as an .ics file`.

### Task 10: Nhận diện lịch theo hệ điều hành

**Files:** Create `lib/browser/calendar-target.ts`, `lib/hooks/use-calendar-target.ts`; test `tests/lib/browser/calendar-target.test.ts`

**Interfaces:**
```ts
calendarTargetFor(nav: { userAgent: string; userAgentData?: { platform: string } }): CalendarTarget
useCalendarTarget(): CalendarTarget // server snapshot "google"
```

- [ ] Test: UA iPhone/iPad/Macintosh → apple; Android/Windows → google; `userAgentData.platform` được ưu tiên ("macOS" → apple, "Windows" thắng UA Mac). FAIL.
- [ ] Cài đặt (iPadOS báo Mac cũng ra `"apple"`, nên không cần kiểm tra `maxTouchPoints`). PASS. Commit `feat(graduation): pick the guest's calendar from their platform`.

### Task 11: `AddToCalendar` và dùng ở vé

**Files:** Create `components/graduation/shared/add-to-calendar.tsx`; modify i18n types/vi/en (`ends.calendar`), `ends/ticket-where.tsx`; delete `lib/browser/download-text-file.ts` nếu không còn ai dùng.

**Interfaces:** `ends.calendar: { google: string; apple: string; orOther: (name: string) => string }`; `AddToCalendar()`.

- [ ] Copy: vi `Google Calendar` / `Lịch Apple` / `hoặc dùng ${name}`; en `Google Calendar` / `Apple Calendar` / `or use ${name}`.
- [ ] Component: `RisoButton` (href) theo `useCalendarTarget()`, link chữ nhỏ cho lịch còn lại; Google mở tab mới `rel="noopener noreferrer"`.
- [ ] `ticket-where.tsx` thay nút tải `.ics`. `tsc`, lint, test. Commit `feat(graduation): add-to-calendar opens Apple or Google Calendar`.

### Task 12: Con dấu "Sẽ đến"

**Files:** Create `rsvp/attending-stamp.tsx`, `rsvp/stamp-timing.ts`; modify `app/globals.css` (`@keyframes attending-stamp`), i18n (`rsvp.stamp`), `rsvp/reply-postcard.tsx`, `rsvp/rsvp-section.tsx`

**Interfaces:** `STAMP_SLAM_S = 0.4`, `STAMP_IMPACT_S` (lúc dấu chạm); `AttendingStamp({ label, className })`; `ReplyPostcard({ ..., status?: RsvpStatus })`.

- [ ] Copy `rsvp.stamp`: `Sẽ đến · 28.11.2026` / `Attending · Nov 28` (in hoa bằng CSS).
- [ ] Dấu chữ nhật bo góc, viền kép `--tomato`, chữ mono, mask chấm halftone; animation scale 1,6→1, xoay về −8°, ease back-out, `STAMP_SLAM_S`. Giảm chuyển động: rule toàn cục đưa animation về trạng thái cuối.
- [ ] `ReplyPostcard` hiện `AttendingStamp` khi `status === "yes"`, giữ `Postmark` cho trường hợp khác. Commit `feat(graduation): an "attending" rubber stamp on yes replies`.

### Task 13: Cú chạm — tiếng, rung, rung thẻ

**Files:** Create `rsvp/stamp-impact.ts`; modify `rsvp/use-reply-sendoff.ts`, `rsvp/rsvp-section.tsx`, `invitation.tsx`

**Interfaces:**
```ts
stampFeedback(sound: boolean): void       // playSfx("stamp") khi sound, navigator.vibrate?.([12, 40, 18])
shakeCard(card: HTMLElement): gsap.core.Tween // x ±3px trong 0,12s
useReplySendoff(cardRef, hasInitialSaved, soundOn: boolean) → startSendoff(status: RsvpStatus)
RsvpSection({ ..., soundOn: boolean })
```

- [ ] Chỉ khi `status === "yes"`: bình thường → `gsap.delayedCall(STAMP_IMPACT_S, …)` gọi feedback + shake; giảm chuyển động → chỉ feedback, không shake.
- [ ] `soundOn` đọc qua ref để `startSendoff` không bị closure cũ. `invitation.tsx` truyền `soundOn={musicStatus === "playing"}`.
- [ ] `tsc`, lint. Commit `feat(graduation): the attending stamp lands with a thud and a buzz`.

### Task 14: Thêm vào lịch trong kết quả hồi âm

**Files:** `rsvp/rsvp-result.tsx`

- [ ] `status === "yes"` → `AddToCalendar` cạnh nút "Đổi ý". Commit `feat(graduation): attending guests can add the event to their calendar`.

---

## Phần 3: Dải halftone giữa các section

### Task 15: `seamLayers` + `HalftoneSeam`

**Files:** Create `components/graduation/shared/seam-layers.ts`, `components/graduation/shared/halftone-seam.tsx`; test `tests/components/graduation/shared/seam-layers.test.ts`

**Interfaces:**
```ts
seamLayers(rows: number, cell: string, color: string): { backgroundImage: string; backgroundSize: string; backgroundPosition: string; backgroundRepeat: string }
export type Tone = "paper" | "paper-2" | "paper-3";
HalftoneSeam({ from: Tone; to: Tone })
```

- [ ] Test: 6 lớp; bán kính giảm tuyến tính từ 90% closest-side (= 45% ô) xuống 0; hàng lẻ lệch nửa ô; hàng `r` ở y = `cell * r`. FAIL.
- [ ] Cài đặt; component cao `clamp(28px, 4vw, 48px)`, nền `var(--to)`, chấm `var(--from)` (hoặc `paper-3` khi trùng), `aria-hidden`. `GraduationSection` dùng lại `Tone`. PASS. Commit `feat(graduation): halftone seam component`.

### Task 16: Đặt dải, bỏ đường kẻ

**Files:** `invitation.tsx`, `shared/graduation-section.tsx`, `wishes/wishes-section.tsx`, `finale/finale-section.tsx`

- [ ] Chèn 5 dải theo bảng trong spec; bỏ `border-t-[1.5px] border-ink` ở ba file.
- [ ] Kiểm tra trình duyệt: `scrollWidth === innerWidth`, nhân vật đi đúng nhịp. Commit `style(graduation): halftone seams replace the rules between sections`.

---

## Phần 4: Chế độ tối

### Task 17: `RisoPalette` + hook đồng bộ theme

**Files:** Create `components/graduation/shared/three/palette.ts`, `components/graduation/shared/three/use-palette-sync.ts`

**Interfaces:**
```ts
export type RisoPalette = { paper; paper2; paper3; ink; tomato; canary; blue; jade: string };
readRisoPalette(): RisoPalette
isDarkPalette(p: RisoPalette): boolean          // paper tối hơn ink
export type Repaintable = { applyPalette(p: RisoPalette): void };
usePaletteSync(ref: RefObject<Repaintable | null>): void // rAF sau khi useIsDark đổi
```
(`blue`, `jade` thêm vào vì nhân vật dùng.) Commit `feat(graduation): shared riso palette for 3D scenes`.

### Task 18: Nhân vật dùng `RisoPalette`

**Files:** `character/scene/materials.ts`, `character/scene/grad-character.ts`, `character/use-grad-character.ts`

- [ ] `createMaterials(p)`, `applyPalette(m, p)` (dark suy ra từ `isDarkPalette`); màu cố định của nhân vật (da, tóc…) giữ trong `FIXED` có comment; `GradCharacter.applyPalette(p)`; hook dùng `usePaletteSync`. Hành vi không đổi. Commit `refactor(graduation): character reads the shared riso palette`.

### Task 19: Ong dùng `RisoPalette`

**Files:** `shared/three/bee-model.ts`

- [ ] `createBeeModel(gradient, outline, p)` + `applyPalette(p)`; thân canary ở cả hai chế độ, sọc/đầu lấy màu tối hơn giữa ink/paper (comment giải thích). Commit `feat(graduation): bee model follows the theme`.

### Task 20: Cảnh intro theo theme

**Files:** `intro/bee-intro-scene.ts`, `intro/use-bee-intro-scene.ts`

- [ ] Bỏ `C`; tạo bằng `readRisoPalette()`; `applyPalette(p)` đổi mặt tổ, cạnh, viền, `scene.fog`, clear color, vệt bay, ong. Hook dùng `usePaletteSync`. Commit `feat(graduation): intro honeycomb follows the theme`.

### Task 21: Ong lời chúc theo theme

**Files:** `wishes/bee-scene.ts`, `courier/courier-bee-provider.tsx`

- [ ] `createBeeScene(host, p)` + `applyPalette(p)`; provider dùng `usePaletteSync(sceneRef)`. Commit `feat(graduation): courier bee follows the theme`.

### Task 22: Token mới, bỏ màu viết cứng trong giao diện

**Files:** `app/globals.css`, `wishes/honeycomb-viewport.tsx`, `wishes/hex-cell.tsx`, `wishes/types.ts`, `wishes/wish-postcard.tsx`, `gate/bee-intro.tsx`, `gate/bee-pulse.tsx`

- [ ] Token `--scrim`, `--vignette`, `--halo`, `--memory-brightness`, `--on-canary` trong `:root` và `[data-theme="dark"]`.
- [ ] Chữ trên ô canary dùng `--on-canary` (ink ở chế độ sáng, paper ở chế độ tối) thay vì `--ink` như bảng trong spec, vì ink sáng màu trên canary ở chế độ tối không đọc được.
- [ ] `rg -n "#[0-9a-fA-F]{6}|rgba?\(" components/graduation` chỉ còn ngoại lệ có comment. Commit `style(graduation): theme tokens replace hard-coded colours`.

### Task 23: Độ sáng ảnh ký ức

**Files:** `met/components/finale-memory-photos.tsx`

- [ ] Đặt `filter: brightness(var(--memory-brightness))` lên lớp ảnh thay vì nhét vào `MEMORY_LOOK`: GSAP không nội suy được `var()`, và để ở lớp cha thì đổi theme có hiệu lực ngay, không cần chờ ScrollTrigger refresh. Commit `style(graduation): memory photos dim slightly in dark mode`.

### Task 24: Rà soát chế độ tối

- [ ] Tính tương phản WCAG cho `--ink`/`--paper`, `--ink-2`/`--paper`, `--ink-2`/`--paper-2` ở cả hai theme (script node); chỉnh token nếu < 4,5.
- [ ] Chụp từng section ở dark 340×720 và 1024×720; sửa lỗi tìm được. Commit theo từng sửa.
