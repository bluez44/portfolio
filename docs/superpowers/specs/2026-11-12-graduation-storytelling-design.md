# Graduation Invitation: Storytelling Pass (Design Spec)

- **Ngày:** 2026-11-12
- **Branch:** `feat/bee-wall-design-sync` (làm trực tiếp, không tạo worktree)
- **Phạm vi:** sửa lỗi nhạc bằng màn "mở thư" + các ý tưởng storytelling 1, 3, 4, 5, 6, 7 đã chốt trong chat.
- **Spec gốc:** `2026-11-08-graduation-invitation-design.md`

## 1. Mục tiêu

Biến trang `/graduation` từ một trang cuộn có hiệu ứng thành một câu chuyện có mở đầu, người dẫn chuyện và kết thúc, đồng thời làm cho nhạc nền phát ổn định.

**Tiêu chí thành công**

- Lần đầu vào trang, khách thấy một phong bì đóng kín kèm dòng "Bạn có thư". Sau khi chạm vào con dấu, nhạc phát **có tiếng** và không bị dừng khi cuộn (Chrome/Edge/Firefox desktop, Chrome Android).
- Nhân vật 3D nói một câu ngắn ở mỗi chặng, có gọi tên khách.
- RSVP là hành động "viết thư hồi âm": gửi xong thì lá thư được gấp, đóng dấu, rồi chú ong mang đi. Lời chúc của khách xuất hiện trong tổ ong và được đánh dấu "Của bạn".
- Ghi chú riêng hiện lên như một tấm polaroid đang rửa ảnh.
- Cuối trang có màn khép lại: đếm ngược, phong bì gấp lại cùng lời hồi âm của khách, nhân vật vẫy tay chào.
- Âm lượng nhạc thay đổi theo mạch truyện.
- `prefers-reduced-motion` vẫn dùng được hết: không có animation, nội dung và luồng giữ nguyên.

**Không làm (non-goals)**

- Màn tiêu đề chương / thanh tem tiến trình (ý 2, không được chọn).
- Ảnh polaroid thật do admin upload (để sau nếu cần).
- i18n cho phần copy đang hardcode tiếng Việt trong `wishes-section.tsx`. Chỉ sửa chỗ nào spec này đụng tới.
- Thêm bài nhạc hoặc stem nhạc. Vẫn chỉ một video YouTube.

## 2. Quyết định chính

| Chủ đề | Quyết định |
|---|---|
| Kích hoạt nhạc | Chỉ gọi trong handler click của con dấu (user activation thật). Bỏ autoplay, muted fallback, listener `wheel`/`pointerdown`/…, và timer verify 400ms. |
| Màn mở thư so với màn loading | Màn mở thư **thay** `LoadingOverlay` trên trang này. Trong lúc chờ tài nguyên, con dấu chưa bấm được; tải xong thì nó sáng lên. `ResourceGateProvider` nhận overlay qua prop, mặc định vẫn là `LoadingOverlay` (Open/Closed). |
| Khóa cuộn | Khóa cuộn cho tới khi mở thư (`lenis.stop()` + `overflow:hidden`), giống pattern trong `guest-editor-dialog.tsx`. |
| Âm thanh hiệu ứng | Tổng hợp bằng Web Audio (tiếng nứt sáp, tiếng giấy) nên không cần file asset. Chỉ phát sau cú click. |
| Lời thoại nhân vật | Gắn vào beat của choreography đã có (`buildBeats`). Bong bóng thoại là DOM, vị trí cập nhật trong ticker sẵn có, không re-render React mỗi frame. |
| Chú ong đưa thư | Đưa `useBeeFlight` cùng overlay canvas từ `WishesSection` lên cấp trang (`CourierBeeProvider`) để cả RSVP lẫn tổ ong dùng chung. |
| Lời chúc "của bạn" | `WishesSection` nhận `guestId`. Ô có `id === guestId` được đánh dấu. Sau khi gửi RSVP có lời chúc thì refetch tổ ong. |
| Polaroid | Là khung bao `PersonalNoteCard`. Hiệu ứng "rửa ảnh" gắn vào timeline finale đã có của phần "Bốn năm". |
| Màn khép lại | Thêm section mới `#finale` giữa tổ ong và footer. Dùng lại các mảnh phong bì (pocket, flap, seal). |
| Nhạc theo mạch truyện | Bảng cue khai báo (`MUSIC_CUES`) + một hook gắn ScrollTrigger. Player có `fadeTo(volume)` dùng chung cho cả cue lẫn tour 360°. |

## 3. Các phần (units)

Mỗi unit có một nhiệm vụ. Hàm thuần nằm riêng file để test bằng vitest.

### 3.1 Nhạc và màn mở thư (ý 1 + sửa lỗi)

**`music/use-youtube-player.ts` (refactor, nhỏ đi)**
- Tạo player ngay khi mount (`autoplay: 0`) để gate chờ được `onReady`.
- Bỏ: `autoStart`, `GESTURE_EVENTS`, `armGestureStart`, `mutedFallback`, `mutedStartTimer`, `verifyTimer`, `unmuteIfNeeded`.
- API mới:
  - `start()`: phải gọi đồng bộ trong handler click. Thực hiện `unMute()`, `setVolume(0)`, `playVideo()`, rồi `fadeTo(FULL)`. Nếu player chưa ready thì ghi nhận ý định và phát ngay khi `onReady`.
  - `fadeTo(volume, ms?)`: tách từ `runFade`. `fadePause()` và `fadeResume()` viết lại dựa trên nó.
  - Giữ `toggle`, `status`, `mountRef`. Hành vi `visibilitychange` giữ nguyên.
- Nếu 1.5s sau `start()` vẫn chưa `PLAYING` (iOS Safari có thể chặn play qua postMessage): không thử lại, chỉ `flashMusicNote` để nút ♪ trên header nhắc người dùng.

**`loading/resource-gate.tsx` (mở rộng)**
- Thêm prop `overlay?: (ready: boolean) => ReactNode`, mặc định `(r) => <LoadingOverlay ready={r} />`.

**`gate/letter-gate.tsx` (mới)**: overlay toàn màn hình, máy trạng thái bốn pha:
- `arriving`: phong bì rơi vào, dòng "Bạn có thư", chấm loading trong lúc `!ready`.
- `ready`: con dấu nhấp nháy, hiện "Chạm vào con dấu để mở thư". Con dấu là `<button>` nên Enter/Space cũng mở được.
- `opening` (~900ms): con dấu tách làm hai nửa, tiếng nứt sáp và tiếng giấy, phong bì mờ dần. Ngay trong handler click gọi `onOpen()` (tức `music.start()`) **trước** khi chạy animation.
- `done`: unmount, mở khóa cuộn, focus về `#stage`.
- Với reduced motion: bỏ animation, click thì đóng overlay ngay.

**`gate/use-letter-gate.ts` (mới)**: reducer thuần `gateReducer(phase, event)` cùng side-effect khóa cuộn. Test reducer.

**`shared/wax-seal.tsx` (tách từ `envelope-flap.tsx`)**: `WaxSeal` có prop `split?: boolean` để vẽ hai nửa nứt. `EnvelopeFlap` import lại component này.

**`lib/graduation/sfx.ts` (mới)**: `playSfx("crack" | "rustle")` tổng hợp noise burst bằng Web Audio. Dùng chung một `AudioContext` lazy và nuốt lỗi.

**Copy mới:** `gate: { youHaveMail, tapToOpen, opening }`.

### 3.2 Nhạc theo mạch truyện (ý 7)

**`music/music-cues.ts` (mới, thuần)**

```ts
type CueId = "chapter-dip" | "writing" | "finale-swell";
type MusicCue = { id: CueId; volume: number; priority: number };
export const MUSIC_CUES: Record<CueId, MusicCue>;
export function volumeFor(active: ReadonlySet<CueId>): number; // không có cue nào active → 100; nhiều cue → priority cao nhất thắng
```

- Đổi chặng (`#met`, `#ends`, `#rsvp`, `#bee-wall`): dip xuống 60% trong ~1.2s rồi trở lại 100%.
- Đang viết hồi âm (focus trong form RSVP): 35%.
- `#finale` vào khung nhìn: 100% và giữ nguyên (swell).
- Tour 360° vẫn dùng `fadePause`/`fadeResume` như hiện tại.

**`music/use-music-cues.ts` (mới)**: bật/tắt các cue (ScrollTrigger `onEnter`/`onEnterBack` của từng chặng cho `chapter-dip` trong ~1.2s, `focusin`/`focusout` trên `#rsvp form` cho `writing`, ScrollTrigger của `#finale` cho `finale-swell`), rồi gọi `fadeTo(volumeFor(active))` mỗi khi tập cue đổi. Không làm gì nếu `status !== "playing"` hoặc người dùng đã tắt nhạc bằng nút ♪.

### 3.3 Nhân vật dẫn chuyện (ý 3)

**`character/types.ts`**: `Beat` thêm `say?: NarrationKey`, trong đó `NarrationKey = "wave" | "bow" | "desk" | "cheer" | "point" | "toss" | "read" | "farewell"`.

**`character/choreography/beats.ts`**: gắn `say` vào các beat đang đứng yên. Thêm beat `farewell` (hành động `wave`) tại `#finale`. `SectionMetrics` thêm `finaleTop`.

**`character/choreography/narration.ts` (mới, thuần)**: `lineAt(beats, y): NarrationKey | null` trả về câu thoại khi `y` nằm trong một khoảng giữ nguyên tư thế, trả `null` khi nhân vật đang đi.

**`character/scene/grad-character.ts`**: thêm `headScreen(): { x: number; y: number }`, chiếu vị trí đầu nhân vật ra pixel màn hình qua camera.

**`character/use-grad-character.ts`**: thêm option `onFrame?(head, line)`, được gọi trong tick hiện có.

**`character/narrator-bubble.tsx` (mới)**: bong bóng kiểu riso, đuôi chỉ xuống. Vị trí ghi thẳng vào `style.transform` qua ref. Chữ chỉ cập nhật bằng state khi `line` đổi, kèm hiệu ứng gõ chữ ngắn. `aria-live="polite"`. Ẩn khi không có nhân vật (reduced motion / không có WebGL).

**Copy mới:** `narrator: Record<NarrationKey, (name: string) => string>`. Bản nháp:

| key | vi | en |
|---|---|---|
| wave | Chào {name}! Lật thư ra xem nhé. | Hi {name}! Flip the letter over. |
| bow | Cảm ơn bạn đã ghé qua. | Thanks for stopping by. |
| desk | Bốn năm của mình đây, kéo xuống xem tiếp nha. | Here are my four years, keep scrolling. |
| cheer | Còn đây là phần dành riêng cho bạn! | And this part is just for you! |
| point | Hẹn bạn ở đây nhé, có bản đồ cả tour 360°. | Meet me here, there's a map and a 360° tour. |
| toss | Viết cho mình vài dòng hồi âm nha, {name}! | Write me a reply, {name}! |
| read | Lời chúc của mọi người đây. | Everyone's wishes, right here. |
| farewell | Hẹn gặp bạn ngày 28.11! | See you on Nov 28! |

### 3.4 Thư hồi âm (ý 4)

**`courier/courier-bee-provider.tsx` (mới)**: chuyển overlay canvas và trail SVG từ `WishesSection` lên đây, expose `useCourierBee()` gồm `{ flyOpen, flyAway, carryOff }`.

**`wishes/use-bee-flight.ts`**: tách hàm tính đường bay bezier thành `flight-path.ts` (thuần, test được). Thêm `carryOff(fromEl: HTMLElement)`: ong bay ra từ lá thư, đậu lên, rồi bay xuống góc dưới màn hình (hướng về tổ ong). Phần tử lá thư thu nhỏ và bay theo cùng đường.

**`rsvp/reply-postcard.tsx` (mới)**: khung bưu thiếp bao `RsvpForm` (form và `useRsvp` giữ nguyên). Header ghi "Gửi: Võ Lê Quang Vinh · Từ: {name}", tem `QV 2026` (tách từ `envelope-front.tsx` thành `shared/stamp.tsx`), nền kẻ dòng lấy từ `IndexCard`.

**`rsvp/use-reply-sendoff.ts` (mới)**: sau khi `submit` thành công, chạy timeline gồm gấp thư (`rotateX` + co lại), đóng `Postmark` ngày gửi, rồi `carryOff`. Xong thì hiện `RsvpResult`. Trang được load lại với RSVP đã có thì hiện thẳng `RsvpResult` dưới dạng thư đã đóng dấu, không có animation.

**`useRsvp`**: thêm callback `onSaved?(answer)`. Invitation dùng nó để báo cho `WishesSection` refetch.

**`wishes-section.tsx`**: nhận `guestId` và `refreshKey`. Ô của khách có badge "Của bạn" cùng viền canary. Nếu đó là lần đầu khách cuộn tới sau khi gửi, ô đó nảy nhẹ một lần.

**Copy mới:** `rsvp.letter: { to, from, sent }`, `wishes.mine`.

### 3.5 Polaroid đang rửa (ý 5)

**`met/components/polaroid-frame.tsx` (mới)**: khung trắng, mép dưới dày, caption "{name} · 2026" bằng `font-heading`, dán băng keo bằng `Tape` (shared). Bọc `PersonalNoteCard` bên trong `NoteFinaleStage`.

**`met/finale/finale-timeline.ts`**: thêm tween trên `[data-polaroid-photo]` từ `filter: sepia(1) blur(6px) brightness(1.6); opacity .35` về trạng thái rõ, chạy song song pha "grown" sẵn có. Selector thêm vào `met/elements.ts`. Kích thước không đổi nên `layout-outline` không bị ảnh hưởng. Viền tomato sẽ bao quanh khung polaroid.

### 3.6 Màn khép lại (ý 6)

**`finale/finale-section.tsx` (mới, `id="finale"`)**, chiều cao khoảng 220vh với khung nhìn sticky:
- **Đếm ngược** `ngày · giờ · phút` tới `GRADUATION_EVENT.startUtc`. Trong lúc diễn ra lễ hiện "Hôm nay là ngày ấy!", sau lễ hiện "Cảm ơn bạn đã đến".
- **Phong bì gấp lại** (scrub theo cuộn): thẻ "Thư hồi âm của {name}" (trạng thái tham dự + lời chúc, hoặc "Bạn chưa hồi âm" kèm link về `#rsvp`) trượt vào túi, nắp gập xuống, con dấu đóng lại.
- Dòng cuối: copy `footer` hiện tại được chuyển lên đây. Footer thu gọn chỉ còn tên.

**`finale/countdown.ts` (mới, thuần)**: `timeLeft(now, startUtc, endUtc)` trả về `{ phase: "before" | "during" | "after"; d; h; m }`.

**`finale/use-finale-timeline.ts` (mới)**: GSAP timeline scoped bằng `gsap.context(root)`.

**Dùng lại `EnvelopePocket`, `EnvelopeFlap`, `WaxSeal`**: `EnvelopeFlap` nhận prop `id` (mặc định `"flap"`) để hai phong bì không đụng `id`.

**Copy mới:** `finale: { heading, countdown: { days, hours, minutes, during, after }, replyOf: (name) => string, noReply, replyNow }`.

## 4. Luồng dữ liệu ở cấp trang (`invitation.tsx`)

```
ResourceGateProvider overlay={(ready) => <LetterGate ready={ready} onOpen={music.start} />}
  InvitationContent
    music = useYouTubePlayer(id, flashNote, onReady)
    useMusicCues(music)
    CourierBeeProvider
      useGradCharacter(host, { onReady, onFrame: narrator.place })
      NarratorBubble
      EnvelopeStage / MetSection / EndsSection
      RsvpSection onSaved={setReply}        → reply: RsvpAnswer | null
      WishesSection guestId refreshKey={reply}
      FinaleSection reply={reply}
```

`reply` khởi tạo từ `initialRsvp` và là nguồn dữ liệu duy nhất cho tổ ong lẫn màn khép lại. `invitation.tsx` chỉ làm nhiệm vụ nối các phần, không chứa logic.

## 5. Xử lý lỗi và trường hợp biên

- Player lỗi hoặc không có `musicId`: gate vẫn mở bình thường, `start()` không làm gì.
- Tài nguyên quá 8s (timeout có sẵn): con dấu vẫn sáng lên và bấm được.
- Không có WebGL hoặc bật reduced motion: không có bong bóng thoại, ong không bay (`carryOff` resolve ngay), phong bì ở màn cuối hiện ở trạng thái đã đóng.
- Gửi RSVP lỗi: không chạy sendoff, giữ thông báo lỗi như hiện tại.
- Khách đổi câu trả lời: chạy sendoff lại, refetch tổ ong.
- Khách tắt nhạc bằng nút ♪: các cue âm lượng ngừng tác động cho tới khi bật lại.

## 6. Kiểm thử

**Vitest (hàm thuần):** `gateReducer`, `lineAt`, `volumeFor`, `timeLeft`, `flight-path`. Cập nhật `beats.test.ts` cho `say` và beat `farewell`.

**Kiểm tra tay trên trình duyệt** (dev server, thông qua skill `run`):
1. Reload, chạm con dấu: nhạc phát có tiếng, cuộn nhiều lần vẫn không dừng.
2. Lời thoại đổi theo từng chặng và có tên khách.
3. Gửi RSVP có lời chúc: chạy hiệu ứng sendoff, ô "Của bạn" hiện trong tổ ong.
4. Màn khép lại: đếm ngược đúng, phong bì gập lại theo cuộn.
5. Bật reduced motion: toàn bộ luồng vẫn dùng được.
6. Đổi ngôn ngữ vi/en: mọi copy mới đều đã dịch.

**Cần thử trên thiết bị thật:** iOS Safari (rủi ro autoplay qua iframe, xem 3.1).

## 7. Thứ tự triển khai

Mỗi task có plan riêng và được review trước khi làm task tiếp theo.

1. **Nhạc và màn mở thư** (3.1): sửa lỗi gốc, nên làm trước.
2. **Nhạc theo mạch truyện** (3.2): phụ thuộc vào `fadeTo` từ task 1.
3. **Nhân vật dẫn chuyện** (3.3).
4. **Polaroid** (3.5).
5. **Thư hồi âm** (3.4): cần `CourierBeeProvider`.
6. **Màn khép lại** (3.6): cần `reply` từ task 5 và beat `farewell` từ task 3.

## 8. Việc phụ, chờ xác nhận

- `rsvp.result.yes` ghi "19.12" ở cả vi lẫn en, trong khi ngày lễ là 28.11. Đề xuất đổi thành 28.11.
- `en.ends.day` = `"Saturday, 2026"` thiếu ngày. Đề xuất `"Saturday, Nov 28, 2026"`.
