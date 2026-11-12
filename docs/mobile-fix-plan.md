# Plan sửa lỗi mobile

Nguồn: `docs/mobile-ux-audit.md`. Mỗi task ghi mã lỗi tương ứng (G*, H*, X*).

## Nguyên tắc

- **Reuse trước khi viết mới.** Dùng lại những thứ đã có: `RisoButton`, `RisoIconButton`, `RisoPill`, `useScrollLock`, `useCopy`, `MOBILE_BREAKPOINT`. Chỉ tạo primitive mới khi có từ 2 nơi trở lên cần dùng.
- **SOLID:**
  - Mỗi hook hoặc helper chỉ làm một việc.
  - Component mở rộng qua props hoặc data-attribute, không sửa logic bên trong.
  - Logic tính toán là pure function, đặt trong `lib/`.
- **Comment:** chỉ viết khi giải thích *vì sao*, không mô tả lại code đang làm gì.
- **Không viết test** cho các fix này.
- **Cách kiểm tra mỗi task:** mở DevTools device mode ở 360 × 780 và 390 × 844, so sánh với triệu chứng ghi trong audit.

---

## Phase 0 — Nền tảng dùng chung

Các task phase sau phụ thuộc vào phase này.

### T0.1 `useMediaQuery` dùng chung
- Tạo `lib/hooks/use-media-query.ts`, tổng quát hoá từ `useReducedMotion`: `useSyncExternalStore` với `matchMedia(query)`, server snapshot trả về `false`.
- Viết lại `lib/hooks/use-reduced-motion.ts` thành `useMediaQuery("(prefers-reduced-motion: reduce)")`.
- Thêm `useCoarsePointer()` = `useMediaQuery("(pointer: coarse)")`, đặt cùng file.

### T0.2 Utility `hit-area` cho vùng chạm tối thiểu 44px
- `app/globals.css`: thêm `@utility hit-area`. Phần tử nhận `position: relative`, và `::after` có `content: ""`, `position: absolute`, nằm giữa phần tử, `min-width: 44px`, `min-height: 44px`, `width: 100%`, `height: 100%`.
- Viết comment 1 dòng giải thích *vì sao*: mở rộng vùng chạm mà không đổi kích thước hiển thị.

### T0.3 Áp `hit-area` vào primitive
Sửa một chỗ, nhiều nơi dùng được hưởng:
- `components/ui/riso/button.tsx`: thêm `hit-area` vào `cls`.
- `components/ui/riso/icon-button.tsx`: thêm `hit-area` vào `className`.
- `components/ui/riso/theme-toggle.tsx`: thêm `hit-area`.

### T0.4 Hằng số kích thước phong bì dùng chung
- Tạo `components/graduation/shared/envelope-size.ts`, export `ENVELOPE_SIZE` (stage) và `FINALE_ENVELOPE_SIZE` (finale).
- Xoá 2 hằng số trùng lặp ở `envelope/envelope-stage.tsx:12` và `finale/finale-section.tsx:16`, import từ file mới.
- Chỉ di chuyển code, chưa đổi giá trị.

### T0.5 Helper `fitScale` (pure)
- Tạo `lib/graduation/fit-scale.ts`:
  ```ts
  export function fitScale({ width, height, availW, availH, max }): number
  ```
  Trả về `min(max, availW / width, availH / height)`.

### T0.6 Hook `useTapToEngage`
- Tạo `lib/hooks/use-tap-to-engage.ts`, nhận `ref`, trả về `{ engaged, engage }`.
- Tự đặt lại `engaged = false` khi phần tử ra khỏi viewport (IntersectionObserver).
- Comment 1 dòng giải thích *vì sao*: trên cảm ứng không có sự kiện "mouse leave" để nhả tương tác.

### T0.7 Cho phép `RisoPill` xuống dòng
- `components/ui/riso/pill.tsx`: thêm prop `wrap?: boolean`.
  - Khi `true`: thay `whitespace-nowrap` bằng `whitespace-normal text-left`.
  - Luôn thêm `max-w-full`.
- Mặc định giữ nguyên hành vi cũ, để không ảnh hưởng nơi khác.

### T0.8 Copy i18n bổ sung
- `lib/graduation/i18n/types.ts` cùng `copy/en.ts` và `copy/vi.ts`:
  - Thêm `common.loading` ("Loading…" / "Đang tải…").
  - Thêm `guide.map.touchHint` ("Tap to use the map" / "Chạm để dùng bản đồ").

---

## Phase 1 — Lỗi nặng 🔴

### G0 — Thiệp mời bị cắt nội dung

**T1.1 Thiệp cao theo nội dung khi đã mở**
- `components/graduation/envelope/use-envelope-timeline.ts`, tween `#card` cuối cùng (vị trí 0.65):
  - đổi thành `fromTo` với `{ height: "88%" }` → `{ height: "auto" }`, để thiệp giãn hết nội dung sau khi rời phong bì;
  - lúc scrub ngược thì quay về chiều cao cũ.

**T1.2 `scale` khi mở tính theo màn hình**
- Trong cùng file, thay `scale: 1.32` bằng function value:
  ```ts
  scale: () => openedCardScale()
  ```
  và bật `invalidateOnRefresh: true` cho `scrollTrigger`.
- Đặt `openedCardScale()` trong `components/graduation/envelope/opened-card.ts`. Hàm đọc `#card` (`offsetWidth` và `scrollHeight`) rồi gọi `fitScale`:
  - `availW = innerWidth - 32`
  - `availH = innerHeight - headerH - 48`
  - `max = 1.32`

**T1.3 Nhân vật dùng cùng `scale` với thiệp**
- `character/choreography/placement.ts:13`: thay `OPENED_CARD_SCALE` bằng `openedCardScale()`.
- Xoá `OPENED_CARD_SCALE` khỏi `character/choreography/constants.ts`.

**T1.4 Nhánh reduced-motion không cắt thiệp**
- `envelope/envelope-stage.tsx`, nhánh `reduced`: render `InvitationCard` trong luồng bình thường, rộng bằng `ENVELOPE_SIZE` nhưng không có `aspect` và không `absolute inset-0`.
- Như vậy thiệp có chiều cao tự nhiên.

**T1.5 Chữ trong thiệp dễ đọc hơn**
- `envelope/invitation-card.tsx`:
  - body: `text-[clamp(13px,1.05vw,14px)]`;
  - nhãn 9px → 10px.
- Làm sau T1.1, vì lúc đó thiệp đã có chỗ cho chữ to hơn.

**T1.6 Phong bì cao hơn trên mobile** *(tuỳ chọn, cần kiểm tra mắt)*
- `shared/envelope-size.ts`: thêm `aspect-[1.35/1] min-[760px]:aspect-[1.6/1]`.
- Kiểm tra nắp phong bì (`envelope-flap`), túi (`envelope-pocket`) và mặt trước (G7) vẫn cân đối.
- Nếu hình vẽ phong bì bị lệch thì bỏ task này, vì T1.1–T1.2 đã đủ sửa lỗi.

### G2 / H1 — Tràn ngang

**T1.7 Chặn tràn ngang toàn trang**
- `app/globals.css`: thêm `body { overflow-x: clip; }`.
- Dùng `clip` thay vì `hidden`, để không phá `position: sticky` và ScrollTrigger. Viết 1 dòng comment giải thích điều này.

**T1.8 Pill kết quả RSVP xuống dòng**
- `components/graduation/rsvp/rsvp-result.tsx:9`: thêm `wrap` cho `RisoPill` (dùng prop từ T0.7).

### G1 — Nhân vật 3D che nội dung

**T1.9 Thu nhỏ nhân vật trên mobile**
- `character/scene/constants.ts`: `MOBILE_SCALE` 0.7 → 0.55.

**T1.10 Gom nhân vật và bóng thoại vào một layer**
- `components/graduation/invitation.tsx`: bọc `canvasHost` và `NarratorBubble` trong một `div` có `ref={characterLayer}` và `transition-opacity`.
- Opacity của layer này độc lập với opacity mà bóng thoại tự set mỗi frame.

**T1.11 Hook `useCharacterAvoid`**
- Tạo `components/graduation/character/use-character-avoid.ts`, nhận `layerRef`.
- Chỉ chạy khi `innerWidth < MOBILE_BREAKPOINT`.
- Dùng IntersectionObserver theo dõi mọi `[data-character-avoid]`, với `rootMargin: "-55% 0px 0px 0px"` (tức là vùng 45% dưới màn hình, nơi nhân vật đứng).
- Có phần tử nào giao với vùng đó thì set `opacity: 0` cho layer.
- Gọi hook trong `InvitationContent`.

**T1.12 Đánh dấu các vùng cần tránh**
Chỉ thêm attribute `data-character-avoid` (Open/Closed: thêm vùng mới không phải sửa hook):
- `ends/ticket-where.tsx`: hàng nút Directions / Add to calendar.
- `rsvp/rsvp-section.tsx`: thẻ postcard.
- `finale/finale-section.tsx`: khối footer có nút Download.

### G4 — Tổ ong chặn cuộn trang

**T1.13 Tổ ong chỉ bắt thao tác khi đã chạm vào**
- `wishes/honeycomb-viewport.tsx`: dùng `useTapToEngage(viewportRef)` (T0.6) và `useCoarsePointer()` (T0.1).
- Trên cảm ứng, khi chưa `engaged`:
  - class là `touch-pan-y` thay vì `touch-none`, để vuốt dọc vẫn cuộn trang;
  - `onPointerDown` đầu tiên gọi `engage()`.
- Khi `engaged`: dùng `touch-none` như hiện tại.
- Desktop giữ nguyên.

**T1.14 Giảm chiều cao tổ ong trên mobile**
- Cùng file: `h-[clamp(360px,52svh,600px)] min-[760px]:h-[clamp(440px,64vh,600px)]`.

---

## Phase 2 — Lỗi trung bình 🟠 (thiệp)

### G5 — Bản đồ giữ cuộn sau lần chạm đầu
**T2.1**
- `ends/venue-guide/scroll-shield.tsx`: thay state `engaged` tự quản bằng `useTapToEngage(rootRef)`.
- Giữ logic `modifier` và `hovering` cho chuột.
- Xoá nhánh `pointerType !== "mouse"` trong `onPointerLeave`, vì hook đã tự nhả khi map rời viewport.

### G11 — Hint bản đồ chỉ hợp với desktop
**T2.2**
- `ends/venue-guide/venue-guide.tsx:49`: truyền `hint={coarse ? t.map.touchHint : t.map.hint}`, với `coarse` lấy từ `useCoarsePointer()`.
- `ScrollShield`: hint đang chỉ hiện qua `group-hover`. Thêm hiển thị khi `!engaged && coarse` để người dùng cảm ứng thấy được.

### G6 — iOS tự zoom khi focus ô RSVP
**T2.3**
- `rsvp/rsvp-field.tsx:12`: `text-[15px]` → `text-[16px]`.

**T2.4**
- `RsvpField`: thêm prop `autoComplete?: string` và `enterKeyHint?`, truyền thẳng vào `props`.
- Ở `rsvp-attend-fields.tsx` / `rsvp-decline-fields.tsx`: truyền `autoComplete="name"` cho ô tên (nếu có) và `"tel"` cho ô số điện thoại (nếu có).

### G7 — Chữ trên phong bì chồng nhau
**T2.5**
- `envelope/envelope-front.tsx`: bỏ `absolute` của "From".
- Đưa "Cordially invited" và "From" vào một hàng `flex flex-wrap items-end justify-between gap-x-3 gap-y-1` ở đáy thẻ.
- Đặt `max-w-[78%]` chỉ cho khối tên.

### G3 — Bóng thoại bị cắt ở mép màn hình
**T2.6**
- `character/narrator-bubble.tsx`: trong `update`, kẹp toạ độ `x` vào `[w/2 + 12, innerWidth - w/2 - 12]`, với `w = root.offsetWidth`.
- Viết helper `clampCenter(x, w, viewportW, margin)` đặt cùng file, vì chỉ có một nơi dùng.

**T2.7**
- Phần thân bóng thoại: thêm `max-w-[calc(100vw-24px)]`.

### G8 — Header thiệp chật
**T2.8**
- `chrome/invitation-header.tsx`:
  - container: `px-4 sm:px-6`, `gap-2 sm:gap-4`;
  - nhóm control: `gap-2 sm:gap-3.5`.

**T2.9**
- Link Portfolio: thêm `whitespace-nowrap hit-area`.
- Dưới `sm` chỉ hiện "←", phần chữ để `sr-only`.

### G9 — Vùng chạm nhỏ trên thiệp
**T2.10**
- `i18n/lang-toggle.tsx`: nút con thêm `hit-area`.
- `ends/venue-guide/guide-tabs.tsx`: nút tab thêm `hit-area`.

**T2.11**
- `rsvp/rsvp-result.tsx`: nút "Change answer" thêm `hit-area`.
- `gate/letter-gate.tsx` (hoặc `bee-intro.tsx`): nút "Enter silently" thêm `hit-area`.

**T2.12**
- `wishes/honeycomb-viewport.tsx`: 3 nút zoom đổi `size="md"` → `size="lg"` (44px, đã có sẵn trong `RisoIconButton`).

### G10 — "Đang tải..." hard-code tiếng Việt
**T2.13**
- `ends/venue-guide/embed-frame.tsx:30`: dùng `useCopy().common.loading` (key từ T0.8).

---

## Phase 3 — Trang chủ

### H2 — Menu mobile
**T3.1** `components/portfolio/header.tsx`: khi `menuOpen` thì luôn coi `hidden = false`, tức `transform` dùng `hidden && !menuOpen`.

**T3.2** Nút menu:
- `aria-label` đổi theo trạng thái ("Open menu" / "Close menu");
- 2 gạch xoay thành ✕ khi mở;
- kích thước `h-11 w-11`.

**T3.3** Tạo `lib/hooks/use-dismiss.ts`: `useDismiss(open, onClose)`, bắt phím `Escape`. Dùng trong header.

**T3.4** Header: khi `menuOpen`, render backdrop `fixed inset-0 bg-ink/30`, bấm vào thì đóng menu.

**T3.5** Header: gọi `useScrollLock(menuOpen)`. Dùng lại hook có sẵn; hook này đã an toàn khi không có Lenis.

### H3 — Vùng chạm nhỏ trên trang chủ
**T3.6**
- `portfolio/education.tsx:185`: nút Verify thêm `hit-area`.
- `portfolio/projects.tsx:218`: link Source Code dạng chữ thêm `hit-area`.

**T3.7**
- `portfolio/footer.tsx:60`, `:80`: link sitemap / socials thêm `py-2.5`, vì các link xếp sát nhau và `hit-area` sẽ chồng lên nhau.

**T3.8**
- `portfolio/header.tsx`: theme toggle của trang chủ thêm `hit-area`.

### H4 — Ảnh About lặp lại
**T3.9**
- `portfolio/about.tsx` (~dòng 150): với panel `index > 0`, khối ảnh thêm `max-lg:hidden`.

### H5 — Form contact
**T3.10**
- `portfolio/contact.tsx`:
  - input tên: `autoComplete="name"`;
  - input email: `autoComplete="email"` và `inputMode="email"`;
  - textarea: `enterKeyHint="send"`.

### H6 — Skills 3D trên điện thoại
**T3.11**
- `portfolio/skills.tsx:175`: ẩn nút "Enable hand control" khi `useCoarsePointer()` trả về true.

**T3.12**
- `portfolio/skills.tsx:105`: "click a node or chip" → "select a node or chip", dùng được cho cả chuột và cảm ứng.

### H7 — Chữ quá nhỏ (chỉ nhãn mang thông tin)
**T3.13**
- `portfolio/contact.tsx`: nhãn form `text-[10px]` → `text-[12px]`.
- Thông báo lỗi `text-[11px]` → `text-[12px]`.

**T3.14**
- `portfolio/hero.tsx`: nhãn BASED / STACK / CURRENTLY từ `text-[10px]` → `text-[11px]`.
- Không đổi các nhãn trang trí như "01 · Intro" hay "Fig · 01".

---

## Phase 4 — Chung và hoàn thiện 🟢

### X1 — Anchor, safe-area, đơn vị chiều cao viewport
**T4.1**
- `app/globals.css`: `html { scroll-padding-top: 5rem; }`.

**T4.2**
- `app/layout.tsx`: thêm `export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" }`.

**T4.3** Thêm `pb-[env(safe-area-inset-bottom)]` cho các thanh cố định:
- thanh dưới của intro: `gate/bee-intro.tsx:15` (biến `bar`);
- header thiệp và header trang chủ: thêm `pt-[env(safe-area-inset-top)]`.

**T4.4** Đổi `vh` → `svh` ở các vị trí có chiều cao lớn:
- `portfolio/hero.tsx:77`, `:85`;
- `portfolio/skills.tsx:22`, `:152`;
- `envelope/envelope-stage.tsx` (`h-screen` của khối sticky → `h-svh`);
- kiểm tra lại cả ScrollTrigger sau khi đổi.

### Ngoài lề
**T4.5**
- `portfolio/projects.tsx:42`: sửa câu "Two case studies from the last twelve months" cho khớp với 6 project.

---

## Thứ tự và phụ thuộc

```
Phase 0 (T0.1 → T0.8)
  ├─ T0.4, T0.5 ─→ T1.1 – T1.6 (G0)
  ├─ T0.7       ─→ T1.8
  ├─ T0.1, T0.6 ─→ T1.13, T2.1, T2.2, T3.11
  ├─ T0.2, T0.3 ─→ T2.9 – T2.12, T3.6 – T3.8
  └─ T0.8       ─→ T2.2, T2.13
Phase 1 → Phase 2 → Phase 3 → Phase 4
```

- Các task trong cùng một phase, nếu không sửa chung file, có thể làm song song.
- Nên commit theo từng phase (hoặc từng mã lỗi) để dễ revert khi một thay đổi hình ảnh không như ý, nhất là T1.6 và T1.11.

---

## Trạng thái thực hiện (12/11/2026)

Đã làm xong Phase 0–4. Typecheck, lint (các file đã sửa) và `vitest` đều qua. Đã kiểm tra trên trình duyệt ở 340px và 390px.

**Khác với plan:**
- T0.2: `hit-area` chỉ thêm `::after`, không tự đặt `position`. Lý do là utility `relative` có thể đè lên `absolute` của phần tử; nơi dùng phải tự thêm `relative`.
- T0.8: chữ "Đang tải…" đặt ở `ends.guide.loading`, không phải `common.loading`, vì chỉ venue guide dùng.
- T1.7: `overflow-x: clip` phải đặt cho **cả** `html` lẫn `body`. Nếu chỉ đặt một trong hai, giá trị bị đẩy lên viewport và trang vẫn cuộn ngang được.
- T1.13: tổ ong chỉ bật chế độ tương tác khi **tap** (`onClickCapture`), không phải khi `pointerdown`. Nếu bật ở `pointerdown` thì cú vuốt cuộn trang đầu tiên cũng sẽ khoá tổ ong.
- T1.6: đã làm. Ở mobile phong bì dùng tỉ lệ `1.4/1`, hình vẽ phong bì không bị vỡ.
- T2.4: không thêm `autoComplete` cho ô "Phone or email", vì không có token nào phù hợp cho trường hợp này. Chỉ thêm `enterKeyHint="send"` cho textarea.
- T3.x: theme toggle của trang chủ được thay bằng `RisoThemeToggle` (vốn bị trùng lặp). `useDismiss` cũng được dùng lại trong `wish-postcard.tsx`, thay cho đoạn xử lý Escape viết riêng.
- T4.4: không đổi `vh` ở 2 blob trang trí của hero, vì chúng `pointer-events-none` và không ảnh hưởng layout.

**Còn tồn đọng:**
- Ở cuối bước mở thiệp (G0/G1), bóng thoại của nhân vật vẫn đè lên dòng chữ ký trên mobile. Không đánh dấu `#card` bằng `data-character-avoid`, vì như vậy nhân vật sẽ bị ẩn suốt cả stage phong bì.
- G4: hành vi `touch-pan-y` chỉ kiểm chứng được trên thiết bị cảm ứng thật. Chrome desktop báo `pointer: fine`, nên chưa thử được.
