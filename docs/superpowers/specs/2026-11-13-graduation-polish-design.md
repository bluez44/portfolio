# Thiệp tốt nghiệp: bốn cải tiến hoàn thiện

**Ngày:** 13/11/2026
**Trạng thái:** đã thống nhất thiết kế, chờ duyệt spec

## Mục tiêu

Làm thiệp có cảm giác riêng tư và trọn vẹn hơn với từng khách. Cả bốn phần đều chỉ thêm vào, không thay đổi cách thiệp đang vận hành.

Bốn phần độc lập với nhau. Có thể lập plan và làm riêng từng phần theo thứ tự 1 → 4.

## Ràng buộc chung

- Áp dụng cho cả điện thoại (dưới 760px, `MOBILE_BREAKPOINT`) và màn rộng.
- Giữ hỗ trợ `prefers-reduced-motion`. Phần nào có hiệu ứng thì phải có trạng thái tĩnh tương ứng.
- Không thêm thư viện mới.
- Copy mới phải có cả `vi` và `en`, khai báo trong `lib/graduation/i18n/types.ts`.
- Dùng token của design system (`globals.css`), không viết cứng màu.
- Dùng lại những gì đã có: `RisoButton`, `Tape`, `ImageUploader`, `useIsDark`, `useMediaQuery`, `buildIcs`, `lib/graduation/sfx.ts`.

---

## Phần 1: Ảnh ký ức kể chuyện

### Hành vi

- Mỗi ảnh ký ức trong phần finale của section met trở thành polaroid đúng kiểu: viền mỏng ba cạnh, đế dưới dày hơn.
- Đế ảnh ghi chú thích từ chính moment đó: `{year} · {title}`, ví dụ `2022 · Nhập học Bách Khoa`.
- Nếu khách có ảnh chụp chung (`togetherPhoto`), ảnh này là **ảnh thứ 5**:
  - bay vào cuối cùng;
  - to hơn các ảnh khác một chút;
  - có một mảnh băng washi ở góc;
  - đế ghi `Mình & {tên khách}` (bản tiếng Anh: `Us · {name}`).
- Khách không có ảnh chung thì giữ 4 ảnh như hiện tại.

### Dữ liệu

- `lib/graduation/types.ts`: thêm `togetherPhoto?: string` (URL ảnh) vào `MetCustomization`. Vì `customContent` là cột JSON nên không cần migration.
- `components/graduation/invitation.tsx`: truyền `guest.customContent?.met?.togetherPhoto` xuống `MetSection`, giống cách `note` đang được truyền.
- `MetSection` → `NoteFinaleStage` → `FinaleMemoryPhotos`: thay prop `photos: string[]` bằng hai prop:
  - `memories: Moment[]`, lấy từ `t.moments`, đã tính cả phần admin tùy chỉnh;
  - `together?: string`.
- Copy mới `met.togetherCaption: (name: string) => string`.

### Bố cục và chuyển động

- `components/graduation/met/finale/constants.ts`: thêm `TOGETHER_PHOTO`, cùng cấu trúc với một mục của `MEMORY_PHOTOS` (`width`, `rot`, `phone`, `wide`, `drift`, `spin`, `enter`), với `enter` khoảng `[0.72, 0.96]`.
- **Vị trí dừng:** phía trên, sát mép trên của thiệp. Ảnh chung được vẽ đè lên các ảnh ký ức (đứng sau chúng trong DOM). Ảnh chỉ được chồng lên phần viền thiệp, không che chữ của thiệp.
- `finale-timeline.ts`: ảnh chung dùng cùng tween với các ảnh ký ức (trôi chéo, xoay, `MEMORY_LOOK`), chỉ khác vị trí và thời điểm. Không thay đổi độ dài quãng ghim.
- **Đế polaroid** (`finale-memory-photos.tsx`):
  - padding `p-1.5`, riêng đáy `pb-6` trên điện thoại, `pb-8` trên màn rộng;
  - chú thích chữ heading nghiêng, cỡ 10–11px trên điện thoại và 12–13px trên màn rộng;
  - một dòng, `truncate`.
- `Tape` dùng lại component có sẵn trong `components/graduation/shared/tape.tsx`.

### Admin

- `app/admin/graduation/components/tabs/moments-tab.tsx`: thêm ô "Ảnh chụp chung với khách", dùng `ImageUploader`, lưu vào `met.togetherPhoto`. Xoá ảnh thì xoá luôn trường này.

### Ngoài phạm vi

- Khi bật giảm chuyển động, cả lớp ảnh vẫn không render như hiện tại, nên cũng không thấy ảnh chung.

### Tiêu chí hoàn thành

Đo ở 340×720 và 1024×720, lúc đủ ảnh (khoảng 95% quãng ghim):

- Ảnh chung lộ ít nhất 95%.
- Mỗi ảnh ký ức lộ ít nhất 50%.
- Không ảnh nào bị header che.
- Chú thích không tràn ra ngoài đế.
- Khách không có `togetherPhoto` thì render đúng 4 ảnh.
- Admin upload, lưu, rồi xoá `togetherPhoto` đều được.

---

## Phần 2: Khoảnh khắc "Sẽ đến"

### Phạm vi

- Chỉ áp dụng khi hồi âm có `status: "yes"`. Hồi âm "Không đến" giữ nguyên.
- Chuỗi cảnh trong `use-reply-sendoff.ts` giữ nguyên: đóng dấu → giữ `STAMP_HOLD_S` → thẻ gập → ong mang đi → hiện kết quả.

### Con dấu

- Component mới `components/graduation/rsvp/attending-stamp.tsx` thay `Postmark` trong `reply-postcard.tsx` khi khách chọn "Sẽ đến".
- **Kiểu dáng:** chữ nhật bo góc, viền kép màu `--tomato`. Chữ mono, copy mới `rsvp.stamp`: `SẼ ĐẾN · 28.11.2026` / `ATTENDING · NOV 28`. Texture halftone nhẹ cho giống mực in.
- **Cú đập:** scale 1,6 → 1, xoay về −8°, ease có độ nảy (`back.out`), 0,35–0,45 giây.
- **Lúc chạm:** thẻ rung ngang 2–3px trong khoảng 120ms.
- **Giảm chuyển động:** dấu hiện ngay ở trạng thái cuối, không đập và không rung thẻ.

### Âm thanh

- `lib/graduation/sfx.ts`: thêm `"stamp"` vào kiểu `Sfx`. Âm thanh tổng hợp bằng WebAudio, theo cùng cách với `buzz` và `rustle`:
  - tiếng thịch trầm: sóng sine rơi tần số từ khoảng 140Hz xuống 60Hz trong 0,12 giây;
  - cộng một tiếng tách: nhiễu ngắn qua bộ lọc thông cao.
- **Chỉ phát khi đang có âm thanh.** `invitation.tsx` truyền `soundOn = musicStatus === "playing"` xuống `RsvpSection`, rồi tới `useReplySendoff`. Không tạo context mới.

### Rung

- `navigator.vibrate?.([12, 40, 18])` đúng lúc dấu chạm. Rung cả khi không có âm thanh. Trình duyệt không hỗ trợ (Safari trên iPhone) thì bỏ qua.

### Thêm vào lịch

- **Link lịch:** `lib/graduation/calendar.ts` với hàm `calendarLinks(event: GraduationEvent)` trả về `{ google, apple }`:
  - `google`: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=…&dates={startUtc}/{endUtc}&location=…`. Thời gian ở dạng `YYYYMMDDTHHMMSSZ`, các tham số được `encodeURIComponent`.
  - `apple`: `/graduation/calendar.ics`.
- **Route mới** `app/graduation/calendar.ics/route.ts`: trả về `buildIcs(GRADUATION_EVENT, new Date())` với header `Content-Type: text/calendar; charset=utf-8` và `Content-Disposition: inline; filename="tot-nghiep-quang-vinh.ics"`.
- **Nhận diện hệ điều hành:** `lib/hooks/use-calendar-target.ts`, trả về `"apple" | "google"`.
  - iPhone, iPad, macOS → `"apple"`. iPadOS tự nhận là Mac nên kiểm tra thêm `navigator.maxTouchPoints > 1`.
  - Các hệ khác → `"google"`.
  - Ưu tiên `navigator.userAgentData?.platform`, nếu không có thì đọc `navigator.userAgent`.
  - Server snapshot là `"google"`, dùng `useSyncExternalStore` giống `useMediaQuery`.
- **Component** `components/graduation/shared/add-to-calendar.tsx`:
  - một `RisoButton` chính "Thêm vào lịch" mở link theo hệ điều hành;
  - bên dưới là một link chữ nhỏ để chọn lịch còn lại ("hoặc dùng Lịch Apple" / "hoặc dùng Google Calendar");
  - link Google mở tab mới, có `rel="noopener noreferrer"`.
- **Dùng ở hai chỗ:**
  - `ends/ticket-where.tsx`: thay nút tải `.ics` hiện tại. `downloadTextFile` không còn được dùng ở đây.
  - `rsvp/rsvp-result.tsx`: hiện khi `status === "yes"`, cạnh link "Đổi câu trả lời".
- **Copy mới:** `ends.calendar.google`, `ends.calendar.apple`, `ends.calendar.orOther(name)`. Nút chính dùng lại `ends.addToCalendar`.

### Tiêu chí hoàn thành

- Hồi âm "Sẽ đến" hiện con dấu mới.
- Có tiếng "cộp" khi `soundOn`, không có tiếng khi khách vào không nhạc hoặc đã tắt nhạc.
- Rung trên Android.
- Hồi âm "Không đến" không thay đổi.
- Link Google có đúng tiêu đề, giờ UTC và địa điểm.
- `GET /graduation/calendar.ics` trả về `200`, `text/calendar`, và nội dung trùng với `buildIcs`.
- iOS và macOS thấy nút chính là Lịch Apple, Android và Windows thấy Google Calendar, và link dự phòng luôn hiện.
- Giảm chuyển động: không có cú đập.

---

## Phần 3: Dải halftone giữa các section

### Component

- `components/graduation/shared/halftone-seam.tsx`: `<HalftoneSeam from={Tone} to={Tone} />`, với `Tone = "paper" | "paper-2" | "paper-3"`. Có `aria-hidden`.
- **Kích thước và nền:** cao `clamp(28px, 4vw, 48px)`, nền `var(--{to})`.
- **Chấm:** màu `var(--{from})`. Nếu `from === to` thì chấm dùng `var(--paper-3)` để dải vẫn thấy được.
- **Cách vẽ:**
  - khoảng 6 lớp `radial-gradient`, mỗi lớp là một hàng chấm;
  - bán kính giảm tuyến tính từ khoảng 45% ô ở hàng trên cùng xuống 0 ở hàng dưới cùng;
  - các hàng lẻ lệch nửa ô;
  - danh sách lớp được dựng trong component bằng một hàm thuần (`seamLayers(rows, cell)`).
- Màu lấy từ token nên tự đổi theo chế độ tối.

### Vị trí

- `invitation.tsx` chèn dải giữa các section, theo đúng thứ tự:

| Sau | Trước | `from` → `to` |
|---|---|---|
| `EnvelopeStage` | `MetSection` | `paper` → `paper-2` |
| `MetSection` | `EndsSection` | `paper-2` → `paper` |
| `EndsSection` | `RsvpSection` | `paper` → `paper-2` |
| `RsvpSection` | `WishesSection` | `paper-2` → `paper` |
| `WishesSection` | `FinaleSection` | `paper` → `paper` (chấm `paper-3`) |

- Bỏ `border-t-[1.5px] border-ink` ở `shared/graduation-section.tsx`, `wishes/wishes-section.tsx` và `finale/finale-section.tsx`. Header và footer giữ nguyên.

### Ảnh hưởng

- `character/choreography/measure-sections.ts` đo section theo `id` mỗi lần ScrollTrigger refresh, nên chiều cao của các dải tự được tính vào.
- Phần ghim của section met và phần sticky của stage không bị ảnh hưởng, vì dải nằm giữa các section chứ không nằm bên trong.

### Tiêu chí hoàn thành

- Không còn đường kẻ giữa các section của thiệp.
- Có đủ 5 dải, kể cả dải nối hai section cùng màu.
- Dải liền mạch, không lộ vệt, ở cả chế độ sáng lẫn tối.
- `scrollWidth` bằng `innerWidth` (không cuộn ngang).
- Nhân vật vẫn đi đúng nhịp qua các section.

---

## Phần 4: Chế độ tối

### Bảng màu dùng chung cho cảnh 3D

- **Helper mới** `components/graduation/shared/three/palette.ts`:
  - `type RisoPalette = { paper; paper2; paper3; ink; tomato; canary }`;
  - `readRisoPalette(): RisoPalette` đọc các token từ `getComputedStyle(document.documentElement)`.
- **Nhân vật:** `character/scene/materials.ts` chuyển sang dùng `readRisoPalette()`. Hành vi giữ nguyên, kể cả màu viền riêng cho chế độ tối.
- **Mô hình chú ong** `shared/three/bee-model.ts`:
  - nhận bảng màu, bỏ các màu viết cứng;
  - có thêm `applyPalette(palette)`;
  - thân giữ màu canary ở cả hai chế độ, vì đó là màu nhận diện. Chỗ này có comment giải thích.
- **Cảnh intro** `intro/bee-intro-scene.ts`:
  - bỏ hằng số `C`;
  - thêm `applyPalette(palette)` để đổi màu mặt tổ ong, viền, sương mù (`scene.fog`), clear color của renderer và vệt bay.
- **Chú ong ở phần lời chúc** `wishes/bee-scene.ts`: tương tự.
- **Cập nhật khi đổi theme:** `use-bee-intro-scene.ts` và nơi tạo `bee-scene` gọi `applyPalette(readRisoPalette())` khi `useIsDark()` đổi, theo cùng cách `use-grad-character.ts` đang làm (`requestAnimationFrame` sau khi đổi theme).

### Bỏ màu viết cứng trong giao diện

Thay bằng token:

| File | Màu hiện tại | Thay bằng |
|---|---|---|
| `wishes/honeycomb-viewport.tsx` | `#fbf8f2` | `var(--paper)` |
| `wishes/hex-cell.tsx`, `wishes/types.ts` | `#1c1b1f` | `var(--ink)` |
| `wishes/wish-postcard.tsx` | `rgba(20,18,14,0.6)` | token mới `--scrim` |
| `gate/bee-intro.tsx` | `rgba(28,27,31,0.12)` | token mới `--vignette` |

Token mới được định nghĩa trong `:root` và `[data-theme="dark"]`.

### Chi tiết

- **Quầng sáng chú ong** (`gate/bee-pulse.tsx`): thêm token `--halo`.
  - Chế độ sáng: giữ màu kem, tức `var(--paper)` như hiện tại.
  - Chế độ tối: canary ấm, mờ.
  - Gradient của quầng dùng `--halo` thay cho `--paper`.
- **Ảnh ký ức:**
  - trạng thái cuối của `MEMORY_LOOK.to` thêm `brightness(var(--memory-brightness))`, với giá trị `1` ở chế độ sáng và `0.9` ở chế độ tối;
  - `MEMORY_LOOK.from` cũng phải có `brightness(...)` cùng thứ tự hàm, để GSAP nội suy được chuỗi `filter`;
  - nếu GSAP không tween được filter có `var()`, thì đọc giá trị qua function value lúc ScrollTrigger refresh.
- **Dải halftone (Phần 3):** dùng token nên tự đổi theo theme.

### Cách kiểm tra

- Chụp từng section ở chế độ tối, trên 340×720 và 1024×720: intro, stage, met (kể cả lúc thiệp ghim), ends, rsvp (trước và sau khi gửi), wishes, finale.
- Ghi lại các lỗi tìm được và sửa trong cùng phần này.

### Tiêu chí hoàn thành

- `rg -n "#[0-9a-fA-F]{6}|rgba?\(" components/graduation` không còn kết quả, trừ các ngoại lệ có comment.
- Ở chế độ tối, intro và chú ong lời chúc đổi màu, không còn tổ ong màu sáng trên nền tối.
- Đổi theme lúc đang xem thì cảnh 3D đổi màu ngay.
- Quầng sáng chú ong vẫn nhìn thấy được trên đầu ong ở chế độ tối.
- Chữ chính đạt độ tương phản WCAG AA (4,5:1) ở cả hai chế độ, với các cặp `--ink`/`--paper`, `--ink-2`/`--paper`, `--ink-2`/`--paper-2`.

---

## Kiểm thử

- Theo yêu cầu trước đó, không viết test mới cho phần giao diện.
- Các hàm thuần mới (`calendarLinks`, nhận diện hệ điều hành, `seamLayers`) nhỏ và tách riêng, nên có thể thêm test sau nếu cần.
- Test cũ bị ảnh hưởng thì cập nhật cho khớp.
- Mỗi phần được kiểm tra trên trình duyệt ở 340×720 và 1024×720, đo theo đúng tiêu chí của phần đó.
