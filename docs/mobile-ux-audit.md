# Kiểm tra trải nghiệm mobile

**Ngày kiểm tra:** 12/11/2026
**Viewport:** 390 × 844 (iPhone 12–15), giả lập bằng iframe cùng origin trên Chrome desktop. Không thử trên máy thật, nên các mục liên quan đến cảm ứng (touch) và hiệu năng WebGL được suy ra từ code, chưa đo trực tiếp.
**Trang đã kiểm tra:** `/` (portfolio) và `/graduation/test` (thiệp tốt nghiệp, khách `test` đã trả lời RSVP).

Mức độ ưu tiên:
- 🔴 **Cao** — che nội dung, chặn thao tác hoặc làm hỏng layout
- 🟠 **Trung bình** — gây khó chịu, thao tác dễ chạm nhầm
- 🟢 **Thấp** — trau chuốt thêm

---

## Tóm tắt

| # | Trang | Vấn đề | Mức |
|---|---|---|---|
| G0 | Graduation | Thiệp mời mở ra có kích thước cố định nên nội dung bị cắt (mất chữ ký, phần cuối lời mời), và khi phóng to 1.32× thì thiệp rộng hơn màn hình | 🔴 |
| G1 | Graduation | Nhân vật 3D che nút Directions, Add to calendar, thẻ RSVP và nút Download | 🔴 |
| G2 | Graduation | Trang tràn ngang 20px (pill "✓ Noted — thanks…" bị cắt) | 🔴 |
| G3 | Graduation | Bóng thoại của nhân vật bị cắt ở mép trái màn hình | 🟠 |
| G4 | Graduation | Tổ ong "wishes" dùng `touch-none` và chiếm khoảng 64vh, vuốt lên đó thì trang không cuộn | 🔴 |
| G5 | Graduation | Bản đồ: chạm một lần là lớp chắn tắt hẳn, sau đó vuốt qua map không cuộn được trang | 🟠 |
| G6 | Graduation | Ô nhập RSVP dùng font 15px nên iOS tự zoom khi focus | 🟠 |
| G7 | Graduation | Chữ "Cordially invited" và "From Võ Lê Quang Vinh" trên phong bì chồng lên nhau | 🟠 |
| G8 | Graduation | Header chật: "← Portfolio" bị xuống 2 dòng | 🟠 |
| G9 | Graduation | Nhiều vùng chạm nhỏ (Change answer cao 17px, VI/EN 28px, tab Map/360° 29px) | 🟠 |
| G10 | Graduation | "Đang tải..." hard-code tiếng Việt, hiện cả khi đang ở chế độ EN | 🟢 |
| G11 | Graduation | Hint của map ghi "Ctrl + scroll / Click", chỉ đúng với desktop | 🟢 |
| H1 | Home | Trang tràn ngang 3px | 🟠 |
| H2 | Home | Menu mobile không đóng khi chạm ra ngoài, nhấn Esc hoặc cuộn; header trượt mất khi đang mở menu | 🟠 |
| H3 | Home | Nhiều vùng chạm nhỏ hơn 44px (nút menu 36px, link footer 23px, nút verify 24px) | 🟠 |
| H4 | Home | About lặp cùng một ảnh `/portrait.jpg` 3 lần, rất dài khi xếp dọc | 🟢 |
| H5 | Home | Ô nhập contact thiếu `autoComplete`/`name` gợi ý | 🟢 |
| H6 | Home | Nút "Enable hand control" (camera) và câu "Drag to orbit, click…" không hợp với điện thoại | 🟢 |
| H7 | Home | Có 40 đoạn chữ cỡ 10–11px (nhãn mono) | 🟢 |
| X1 | Cả hai | Không có `scroll-margin-top` cho anchor, chưa xử lý safe-area (tai thỏ, home bar) | 🟢 |

---

## Trang thiệp tốt nghiệp (`/graduation/[guest_id]`)

### G0 🔴 Thiệp mời bị cắt nội dung khi mở

*(Lỗi do bạn phát hiện, tôi đã đo lại để xác nhận.)*

Thiệp (`#card`) có kích thước cố định theo phong bì, và mọi phần tràn ra đều bị cắt:
- Phong bì có tỉ lệ cố định `aspect-[1.6/1]` và rộng `min(560px, 86vw)` (`components/graduation/envelope/envelope-stage.tsx:12`).
- Thiệp chiếm `h-[88%] w-[90%]` của phong bì (`components/graduation/envelope/envelope-back.tsx:16`).
- Thiệp có `overflow-hidden` (`components/graduation/envelope/invitation-card.tsx:19`), nên chữ không vừa sẽ bị cắt mà không có dấu hiệu gì.

Chiều cao thiệp vì thế phụ thuộc vào chiều **rộng** màn hình, chứ không phụ thuộc vào lượng nội dung. Số đo với lời mời mặc định:

| Viewport | Kích thước thiệp | Nội dung cần | Bị cắt (EN) | Bị cắt (VI) |
|---|---|---|---|---|
| 320px | 248 × 151 | 212–232 | **83px** | **63px** |
| 360px | 279 × 170 | 212 | **44px** | **44px** |
| 390px | 302 × 184 | 195–212 | **13px** | **30px** |
| 430px | 333 × 203 | 201 | 0 | 0 |

Hệ quả trên điện thoại:
- Dòng chữ ký "— Vinh (Tom)" và "Cuộn tiếp ↓" mất hẳn. Ở 320–360px, dòng cuối của lời mời cũng bị cắt.
- Khi admin nhập `cardBody` dài hơn, hoặc thêm `cardAuthor`/`coverImage` (`lib/graduation/resolve-invitation-copy.ts:27-29`), phần bị cắt còn lớn hơn, và cắt ở **mọi** kích thước màn hình, kể cả desktop.
- Lúc mở xong, thiệp được phóng to `scale: 1.32` (`components/graduation/envelope/use-envelope-timeline.ts:93`). Ở 340px, thiệp rộng khoảng 368px nên tràn hai mép màn hình. Ở 390px là khoảng 399px, cũng tràn.
- Chữ trong thiệp vốn đã nhỏ (body 11px, nhãn 9px). Phóng to bằng `scale` chỉ phóng ảnh lên, không cho thêm chỗ chứa nội dung.

**Đề xuất:**
1. **Cho thiệp cao theo nội dung sau khi rút ra khỏi phong bì.** Trong phong bì, thiệp có thể giữ kích thước cố định, vì chỉ lộ phần đầu. Khi đến bước "mở" (từ khoảng 0.65 của timeline), chuyển sang `height: auto` hoặc `min-height`, và bỏ `overflow-hidden`. Cách gọn nhất là dùng kỹ thuật FLIP: một thẻ thiệp "đã mở" riêng có layout tự nhiên, animate từ vị trí của thiệp trong phong bì đến vị trí của nó.
2. **Tính `scale` theo không gian còn trống, không dùng hằng số.** Ví dụ `scale = min(1.32, (innerWidth - 32) / cardW, (innerHeight - header - 48) / cardH)`. Giá trị này đã có sẵn trong `OPENED_CARD_SCALE` (`components/graduation/character/choreography/constants.ts:27`), nên cần đổi cả chỗ nhân vật đọc nó.
3. **Trên mobile, cho phong bì cao hơn**, ví dụ `aspect-[1.3/1]` dưới 760px, hoặc tăng `w` lên khoảng `92vw`, để giảm phần bị cắt ngay cả trước khi sửa (1).
4. **Phương án tạm** nếu chưa sửa được layout: dùng `line-clamp` cho body kèm nút "Đọc tiếp", để người đọc biết còn nội dung. Không nên cắt im lặng như hiện tại.
5. Sau khi thiệp cao theo nội dung, nâng body lên tối thiểu 14px và nhãn lên 11–12px.

### G1 🔴 Nhân vật 3D che nội dung và nút bấm

Ở 390px, nhân vật (scale 0.7) đứng cố định ở 1/3 dưới màn hình suốt cả trang. Vì không còn khoảng trống hai bên nội dung như trên desktop, nó đè lên:
- nút **Directions** và **Add to calendar** trong phần vé (ends),
- thẻ RSVP, gồm pill kết quả và link "Change answer",
- nút **Download invitation card (PNG)** ở cuối trang,
- chữ trong các thẻ timeline (Freshman, Late-night deadlines…) và chữ ký "— Vinh (Tom)" trên thư.

Canvas đã có `pointer-events-none` nên vẫn bấm được qua nhân vật, nhưng người dùng không nhìn thấy nút.

**Đề xuất** (chọn một hoặc kết hợp):
- Dưới `MOBILE_BREAKPOINT`, giảm `MOBILE_SCALE` xuống khoảng 0.45 và neo nhân vật vào góc dưới bên phải với một vùng an toàn cố định.
- Ẩn hoặc thu nhỏ nhân vật khi section có nút quan trọng (ends, RSVP, finale) đi vào viewport, rồi hiện lại khi qua section đó.
- Thêm `padding-bottom` cho các section trên mobile bằng chiều cao nhân vật, để nút cuối mỗi section không bao giờ nằm trong vùng của nó.

Liên quan: `components/graduation/character/scene/constants.ts:9-10`, `components/graduation/character/choreography/placement.ts`.

### G2 🔴 Tràn ngang 20px

`scrollWidth` là 410px trong khi viewport là 390px. Nguyên nhân chính là pill kết quả RSVP ("✓ Noted — thanks for letting me know") vì `RisoPill` không xuống dòng và bị xoay `tilt`. Các blob trang trí (`-right-45`, `-right-35`) cũng vượt ra ngoài.

**Đề xuất:**
- `components/graduation/rsvp/rsvp-result.tsx:9`: cho pill `max-w-full` và `whitespace-normal`, hoặc rút ngắn câu khi ở mobile.
- Thêm `overflow-x: clip` cho wrapper gốc của invitation (dùng `clip` thay vì `hidden` để không làm hỏng `position: sticky` và ScrollTrigger).

### G3 🟠 Bóng thoại bị cắt ở mép màn hình

`components/graduation/character/narrator-bubble.tsx:47` canh giữa bóng thoại trên đầu nhân vật bằng `translate(-50%, -100%)` mà không giới hạn trong viewport. Khi nhân vật ở sát mép, chữ bị cắt (ví dụ "…eet me here, there's a map and a 360° tour.").

**Đề xuất:** kẹp `x` vào khoảng `[bubbleW/2 + 12, innerWidth - bubbleW/2 - 12]` trước khi set transform, và đặt `max-width: calc(100vw - 24px)`.

### G4 🔴 Tổ ong "wishes" chặn cuộn trang

`components/graduation/wishes/honeycomb-viewport.tsx:37` có `touch-none` và cao `clamp(440px, 64vh, 600px)`. Trên điện thoại, khung này chiếm gần hết màn hình, nên ngón tay đặt vào đâu cũng đang pan tổ ong chứ không cuộn trang. Người dùng dễ bị "kẹt" ở section này.

**Đề xuất:**
- Đổi sang `touch-action: pan-y` và chỉ bắt pan ngang hoặc pinch, hoặc
- dùng cơ chế "chạm để tương tác": ban đầu cho cuộn trang bình thường, chạm một lần mới bật pan/zoom và hiện nút "Xong" để thoát, hoặc
- trên mobile giảm chiều cao còn khoảng 50vh để luôn có chỗ vuốt bên ngoài.

### G5 🟠 Bản đồ giữ cuộn sau lần chạm đầu

`components/graduation/ends/venue-guide/scroll-shield.tsx:30-35`: lớp chắn chỉ bật lại khi `pointerType === "mouse"` rời khỏi map. Trên cảm ứng, sau lần chạm đầu, `engaged` giữ nguyên `true`, nên iframe Google Maps nuốt toàn bộ thao tác vuốt từ đó trở đi.

**Đề xuất:** trên touch, tự tắt `engaged` khi map ra khỏi viewport (IntersectionObserver) hoặc sau vài giây không tương tác. Có thể thêm nút "Thoát bản đồ".

### G6 🟠 iOS tự zoom khi focus ô nhập RSVP

`components/graduation/rsvp/rsvp-field.tsx:12` dùng `text-[15px]`. Safari iOS zoom vào mọi input có font nhỏ hơn 16px, và trang không tự zoom lại sau đó.

**Đề xuất:** đổi sang `text-[16px]` (form contact ở trang chủ đã dùng 16px). Có thể thêm `autoComplete="name"` và `enterKeyHint` phù hợp.

### G7 🟠 Chữ trên phong bì chồng nhau

`components/graduation/envelope/envelope-front.tsx:24` và `:26`: "Cordially invited" nằm trong luồng bình thường, còn "From …" là `absolute bottom right`. Khi phong bì hẹp, hai dòng đè lên nhau.

**Đề xuất:** đưa "From" vào luồng flex (ví dụ `flex justify-between` trên cùng một hàng, cho phép wrap), hoặc ẩn "Cordially invited" dưới breakpoint `sm`.

### G8 🟠 Header chật

`components/graduation/chrome/invitation-header.tsx:24`: với `px-6` và 3 control bên phải, "← Portfolio" (tracking 0.22em) bị ngắt thành 2 dòng.

**Đề xuất:** thêm `whitespace-nowrap`, giảm padding còn `px-4` trên mobile, hoặc chỉ hiện "←" kèm `aria-label` dưới `sm`.

### G9 🟠 Vùng chạm nhỏ

Đo được (rộng × cao, px):

| Phần tử | Kích thước |
|---|---|
| Change answer | 160 × **17** |
| VI / EN | 37–44 × **28** |
| Tab Map / 360° tour | 69–122 × **29** |
| Enter silently → | 101 × 32 |
| ← Portfolio | 107 × 33 |
| Music, Zoom in/out, Recenter | 36 × 36 |
| Directions, Add to calendar, Download | cao 38 |

**Đề xuất:** nâng tối thiểu lên 44 × 44 (theo Apple HIG), hoặc ít nhất 40px. Với link chữ như "Change answer", có thể thêm `py-3` hoặc mở rộng vùng chạm bằng pseudo-element mà không đổi giao diện.

### G10 🟢 "Đang tải..." không theo ngôn ngữ

`components/graduation/ends/venue-guide/embed-frame.tsx:30` hard-code tiếng Việt. Nên chuyển vào `lib/graduation/i18n/copy/*.ts`.

### G11 🟢 Hint của map chỉ dành cho desktop

`lib/graduation/i18n/copy/en.ts:66` (và bản `vi`) ghi "Ctrl + scroll to zoom · Click to use the map". Trên thiết bị `(pointer: coarse)` nên đổi thành "Chạm để dùng bản đồ · Dùng hai ngón để zoom".

---

## Trang chủ (`/`)

### H1 🟠 Tràn ngang 3px

`scrollWidth` là 393px trong khi viewport là 390px. Nguyên nhân là card project "CarrotGlobalVN" (`lg:order-2`) và các span trang trí `-top-24` trong Projects. Người dùng có thể vuốt lệch trang sang ngang một chút.

**Đề xuất:** thêm `overflow-x: clip` cho `<main>` hoặc `body`, và kiểm tra lại margin âm và shadow lệch của card trong `components/portfolio/projects.tsx`.

### H2 🟠 Menu mobile

`components/portfolio/header.tsx`:
- Menu chỉ đóng khi bấm link. Chạm ra ngoài, nhấn `Esc` hay cuộn trang đều không đóng được.
- `hidden` (dòng 24) vẫn là `true` khi đang cuộn xuống, kể cả lúc menu mở, nên header và menu có thể trượt khỏi màn hình.
- Nút vẫn có `aria-label="Open menu"` và icon 2 gạch khi menu đã mở. Nên đổi thành "Close menu" và dùng icon ✕.
- Không có backdrop, nên nội dung phía sau vẫn hiện rõ dưới menu.

**Đề xuất:** khi `menuOpen` thì giữ `hidden = false`, thêm backdrop bán trong suốt (chạm vào để đóng), bắt `Escape`, và khoá cuộn trang khi menu mở (hoặc đóng menu khi cuộn).

### H3 🟠 Vùng chạm nhỏ hơn 44px

Có 46 phần tử. Đáng chú ý:
- Nút mở menu 36 × 36, toggle theme 64 × 36.
- Link sitemap và socials ở footer cao 23px, xếp sát nhau nên dễ bấm nhầm.
- Nút "Verify" chứng chỉ 24 × 24 (Education).
- Link "Source Code" dạng chữ ở Expatcare cao 21px.
- Chip skills cao 38px (chấp nhận được, nhưng nên tăng lên 40–44px).

### H4 🟢 Ảnh About lặp lại

Ba panel About (`lib/portfolio-data.tsx:135`, `:146`, `:162`) dùng cùng `/portrait.jpg`. Trên desktop chúng đứng cạnh chữ, nhưng trên mobile xếp dọc thành một chuỗi ảnh giống hệt nhau, khiến section About dài tới khoảng 2700px.

**Đề xuất:** ẩn ảnh ở panel 2 và 3 dưới `lg`, hoặc dùng ảnh khác cho mỗi panel.

### H5 🟢 Form contact

`components/portfolio/contact.tsx:118-155`: font 16px là đúng. Nên thêm `autoComplete="name"`, `autoComplete="email"`, và `enterKeyHint="send"` cho textarea để bàn phím mobile gợi ý tốt hơn.

### H6 🟢 Skills 3D trên điện thoại

- Nút "◉ Enable hand control" (`components/portfolio/skills.tsx:175`) bật camera để điều khiển bằng tay. Trên điện thoại, cách này ít hữu dụng và nặng. Nên ẩn khi `(pointer: coarse)` hoặc khi viewport nhỏ hơn `md`.
- Câu mô tả "Drag to orbit, click a node or chip" nên đổi thành "tap" trên thiết bị cảm ứng.
- Canvas đã có `touch-action: pan-y`, nên cuộn dọc vẫn hoạt động (tốt).

### H7 🟢 Chữ quá nhỏ

Có 40 đoạn chữ 10–11px (nhãn mono như "BASED", "STACK", "01 · INTRO", số thứ tự, nhãn form "YOUR NAME"…), cộng thêm letter-spacing rộng. Trên điện thoại khá khó đọc. Nên đặt tối thiểu 12px cho mọi nhãn mang thông tin, kể cả nhãn của form.

---

## Chung cho cả hai trang

### X1 🟢 Anchor và safe-area

- Không có `scroll-margin-top` hay `scroll-padding-top`, nên khi bấm link menu, tiêu đề section có thể nằm dưới header cố định. Gợi ý: `html { scroll-padding-top: 5rem; }`.
- Chưa dùng `env(safe-area-inset-*)`. Footer cố định của intro graduation ("Enter silently", "Sound on") và header có thể bị tai thỏ hoặc home bar che trên iPhone. Nên thêm `viewport-fit=cover` vào meta viewport, rồi `padding-bottom: env(safe-area-inset-bottom)` cho các thanh cố định.
- Những chỗ dùng `vh` (`h-[70vh]`, `64vh`, `62vh`) nên đổi sang `svh`/`dvh`, để chiều cao không nhảy khi thanh địa chỉ Safari/Chrome co giãn.

### Hiệu năng (cần đo trên máy thật)

Trang graduation có thể chạy cùng lúc 2–3 ngữ cảnh WebGL (intro ong, nhân vật, ong trong tổ ong), và trang chủ có 2 canvas (hero, skills). Code đã giới hạn `dpr={[1, 2]}` và tạm dừng `frameloop` khi canvas ngoài màn hình, nhưng vẫn nên:
- đo bằng Lighthouse mobile hoặc Chrome DevTools với CPU throttle 4×,
- cân nhắc hạ `MAX_PIXEL_RATIO` xuống 1.5 trên mobile,
- tắt hiệu ứng film/grain của intro khi `prefers-reduced-motion` hoặc trên máy yếu.

---

## Ngoài lề (không riêng mobile)

- `components/portfolio/projects.tsx:42` ghi "Two case studies from the last twelve months" nhưng section có 6 project.
- Ở môi trường local, `next dev` (Turbopack) báo lỗi `next/font/google queries have exactly one entry` cho font Bricolage Grotesque và trả về 500. Chạy với `--webpack` thì bình thường.

---

## Thứ tự sửa đề xuất

1. **G0, G1, G2, G4**: những lỗi người dùng mobile chắc chắn sẽ gặp trên thiệp mời.
2. **G6, G7, G8, G3, G5, H1, H2**: sửa nhanh, mỗi mục vài dòng.
3. **G9, H3**: rà lại toàn bộ vùng chạm, đưa lên tối thiểu 44px.
4. Các mục 🟢 còn lại.
