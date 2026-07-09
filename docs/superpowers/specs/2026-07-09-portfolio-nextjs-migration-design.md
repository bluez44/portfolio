# Chuyển đổi Developer Portfolio Template sang Next.js 16

## Bối cảnh

`Developer Portfolio Template/Portfolio.dc.html` là file preview xuất ra từ một tool builder (custom elements `x-dc`/`sc-for`/`sc-if`, class `DCLogic extends React.Component`, runtime `support.js`). Nội dung là một portfolio một trang, đầy đủ nội dung placeholder (`[Your Name]`, `[Job Title]`, ...), với:

- Header cố định: logo, nav anchor, toggle theme dark/light, nút "Download CV", menu mobile.
- Hero: nền particle 3D (Three.js), tiêu đề, CTA.
- About: ảnh chân dung placeholder, bio, stats.
- Skills: scene 3D "cây kỹ năng" xoay được (Three.js) chia 3 tầng (Languages/Frameworks/Tools), panel chi tiết khi click/hover, danh sách chip fallback cho bàn phím/mobile, toggle điều khiển bằng tay qua webcam (MediaPipe Hands).
- Projects: gallery cuộn ngang, thanh tiến trình cuộn, hiệu ứng hover nâng thẻ (GSAP).
- Experience: timeline với đường SVG vẽ dần theo scroll (GSAP ScrollTrigger scrub), ảnh minh họa đặt lệch trái/phải.
- Education & Certifications.
- Contact: form (hiện tại chỉ giả lập gửi), danh sách social links.
- Footer.

Toàn bộ animation dùng GSAP + ScrollTrigger + Lenis (smooth scroll), 3D dùng Three.js thuần, tất cả nạp qua CDN `<script>` trong bản gốc.

Dự án đích (`D:\portfolio`) đã là một Next.js 16 App Router scaffold (`create-next-app`) với Tailwind v4, và **đã cài sẵn** đúng bộ dependency cần cho việc port: `three`, `gsap`, `lenis`, `@mediapipe/hands`, `next-themes`, `react-hook-form`, `zod`, `@hookform/resolvers`, `lucide-react`, `@vercel/speed-insights`.

## Mục tiêu

- Port toàn bộ nội dung/hành vi của template sang các React Server/Client Component trong Next.js App Router, **giữ nguyên nội dung placeholder** (không điền thông tin cá nhân thật ở giai đoạn này).
- Giữ đầy đủ fidelity về mặt tương tác: theme toggle, 3D hero + 3D skills scene, hand-tracking, cuộn ngang Projects, timeline vẽ theo scroll, form liên hệ có validate + gửi email thật.
- Viết lại theo idiom Next.js/React chuẩn: Tailwind utility classes thay inline style, `next-themes` thay theme thủ công, Three.js scenes viết lại bằng `@react-three/fiber` (khai báo) thay vì imperative thuần.
- Không thêm test framework, không thêm tính năng ngoài phạm vi template gốc (rate limiting, CMS, i18n...).

## Ngoài phạm vi

- Điền nội dung cá nhân thật (tên, dự án, kinh nghiệm...).
- Test tự động (chưa có test framework trong repo, không thêm mới).
- Bước verify thủ công bằng trình duyệt sau khi code xong (chỉ cần `build`/`lint` pass).
- Chống spam/rate-limit cho contact form.

## Kiến trúc & cấu trúc thư mục

```
app/
  layout.tsx              # ThemeProvider (next-themes), fonts, metadata, SpeedInsights
  page.tsx                # ghép các section theo thứ tự gốc
  api/contact/route.ts    # nhận + validate + gửi email qua Resend
components/
  providers/
    theme-provider.tsx        # bọc next-themes, attribute="data-theme", defaultTheme="dark"
    smooth-scroll-provider.tsx # khởi tạo Lenis + gsap.ticker 1 lần, xử lý anchor scroll mượt
  portfolio/
    header.tsx
    hero.tsx
    hero-scene.tsx             # R3F <Canvas> cho particle field
    about.tsx
    skills.tsx
    tech-scene.tsx             # R3F <Canvas> cho cây kỹ năng xoay
    tech-focus-panel.tsx
    projects.tsx
    project-card.tsx
    experience.tsx
    timeline-entry.tsx
    education.tsx
    contact.tsx
    footer.tsx
lib/
  portfolio-data.ts         # techs, projects, roles, education, certs, socials, navLinks, stats (typed, placeholder)
  schemas/contact.ts        # zod schema dùng chung client + API route
  hooks/
    use-scroll-reveal.ts    # IntersectionObserver + GSAP fade/stagger, thay data-reveal/data-stagger gốc
    use-hand-tracking.ts    # lazy-load @mediapipe/hands, trả rotation/tilt target + pinch-to-focus callback
    use-timeline-thread.ts  # tính path SVG hữu cơ nối các mốc + progress theo scroll
```

Mỗi component/hook có một trách nhiệm rõ ràng, tự quản lý ref/cleanup của mình — không còn kiểu `querySelectorAll` toàn cục hay gắn state lên `this` như bản gốc.

## Theme & Styling

- `next-themes` với `attribute="data-theme"`, `defaultTheme="dark"`, `enableSystem={false}` (bản gốc không theo system, chỉ có 2 lựa chọn thủ công + nhớ trong localStorage — hành vi này `next-themes` làm sẵn).
- CSS variables (`--bg`, `--bg2`, `--text`, `--muted`, `--accent`, `--accent-dim`, `--glow`, `--line`, `--panel`, `--panel-strong`, `--panel-border`, `--header-bg`, `--chip`) định nghĩa cho `[data-theme="dark"]` và `[data-theme="light"]` trong `globals.css`, expose qua Tailwind v4 `@theme` block (vd `--color-bg: var(--bg)`) để dùng trực tiếp class như `bg-bg text-muted border-panel-border`.
- Font: thay `Geist`/`Geist_Mono` bằng `Space_Grotesk` (heading, mono-ish kicker) + `Manrope` (body) qua `next/font/google`, biến CSS `--font-heading`/`--font-body`.
- Accent color: giữ mặc định `#3D8BFF`, áp dụng qua CSS variable ở `:root`/data-theme thay vì prop runtime của builder (bản gốc dùng `props.accent` từ builder — không còn ý nghĩa ở đây).
- Responsive nav (`data-desktop-only`/`data-mobile-only` gốc) chuyển thành Tailwind `hidden md:flex` / `flex md:hidden`.

## Three.js scenes (`@react-three/fiber`)

Thêm dependency mới: `@react-three/fiber`. Viết lại 2 scene dạng khai báo:

**`hero-scene.tsx`** — particle field + grid nền Hero:
- `<Canvas>` với `PerspectiveCamera`, `<Points>` (buffer geometry random position, đúng số lượng theo `rm`/mobile như gốc), `<gridHelper>`.
- `useFrame` xoay points + lerp camera theo con trỏ chuột (thay vòng lặp `requestAnimationFrame` thủ công).
- Tạm dừng animate khi ngoài viewport: dùng `IntersectionObserver` (qua hook nhỏ) để bật/tắt `frameloop` của `<Canvas>` giữa `"always"`/`"never"`.
- Bọc trong `try/catch` qua `onCreated`/error boundary đơn giản; nếu WebGL không khởi tạo được, ẩn canvas và không render gì thêm (Hero không có fallback UI ở bản gốc, chỉ tắt particle).

**`tech-scene.tsx`** — cây kỹ năng 3 tầng xoay được:
- Trunk + roots + crown tip, 3 tier orbit ring, mesh cho từng tech (Icosahedron/Octahedron/Dodecahedron theo tier), wireframe overlay.
- Hover/click dùng pointer events khai báo sẵn của R3F (`onPointerOver`/`onPointerOut`/`onClick` trên từng mesh) thay vì `THREE.Raycaster` thủ công.
- Kéo để xoay: xử lý qua `onPointerDown/Move/Up` trên `<Canvas>` (không dùng `drei OrbitControls` vì cần giới hạn tilt + camera "bay" tới node khi focus giống bản gốc).
- `useImperativeHandle` expose `focusTech(i)`/`closeFocus()`/set rotation target ra ngoài, để `use-hand-tracking.ts` (chạy ngoài Canvas, xử lý MediaPipe) và chip fallback list điều khiển được scene.
- `growStarted`/`grow` animation (cây "mọc" khi vào viewport lần đầu) giữ nguyên logic qua `useFrame` + `IntersectionObserver`.
- Fallback khi WebGL fail: đúng UI đã có sẵn trong template (`webglFailed` → hiện khối placeholder text).

Không thêm `@react-three/drei` trừ khi cần trong lúc code (giữ scope tối thiểu).

## Animation (GSAP + ScrollTrigger + Lenis)

- `SmoothScrollProvider` (client component bọc `page.tsx` trong layout): khởi tạo `Lenis`, đăng ký `gsap.ticker`, xử lý click anchor `<a href="#...">` scroll mượt — y hệt bản gốc, chỉ chạy 1 lần ở cấp cao nhất.
- `useScrollReveal(ref, { stagger? })`: thay `[data-reveal]`/`[data-stagger]` — mỗi section tự gọi hook trên ref của mình.
- `useTimelineThread`: tính path SVG cong nối các mốc kinh nghiệm + cập nhật theo scroll progress (scrub), dùng trong `experience.tsx`. Bỏ nhánh kiểm tra `window.DrawSVGPlugin` (plugin trả phí không có trong bản npm — bản gốc đã tự fallback nên hành vi không đổi, chỉ xoá code chết).
- `prefers-reduced-motion`: tắt animate loop, particle giảm số lượng, timeline hiện luôn ở progress=1 — giữ đúng logic gốc.

## Hand tracking

`use-hand-tracking.ts`: lazy-load `@mediapipe/hands` (npm, không CDN) chỉ khi user bật toggle. Xin quyền camera qua `getUserMedia`, nếu bị từ chối hoặc lib load lỗi → tự tắt + set trạng thái lỗi (đúng UX gốc). Khi bật, liên tục gửi frame video vào model, kết quả cập nhật rotation/tilt target của `tech-scene` qua ref/callback, pinch gesture để focus/đóng panel (cycle qua từng tech).

## Contact form & API route

- `lib/schemas/contact.ts`: zod schema `{ name: string().min(1), email: string().email(), message: string().min(10) }`, dùng chung 2 phía.
- `contact.tsx`: `react-hook-form` + `zodResolver`, submit → `fetch('/api/contact', { method: 'POST', body: JSON.stringify(values) })`, trạng thái `idle | submitting | success | error` hiển thị inline message tương ứng (thay `sent` boolean giả của bản gốc).
- `app/api/contact/route.ts`: parse + validate lại bằng cùng schema (không tin client), gửi email qua **Resend** SDK (`resend` — dependency mới cần thêm vào `package.json`). Đọc `RESEND_API_KEY` và `CONTACT_TO_EMAIL` từ `process.env`; nếu thiếu, trả lỗi 500 với message rõ ràng ("Email service chưa được cấu hình") thay vì lỗi mù mờ.
- Thêm `.env.example` liệt kê 2 biến trên với chú thích.

## Error handling

- WebGL init lỗi (Hero/Skills scene) → ẩn canvas, Skills hiện fallback placeholder (đúng bản gốc), Hero chỉ đơn giản không có particle.
- Hand-tracking: camera bị từ chối / MediaPipe load lỗi → tự tắt toggle, hiện message giải thích, không crash phần còn lại.
- Contact form: lỗi validate hiện ngay dưới field (react-hook-form), lỗi network/API hiện message chung chung + cho phép thử lại.
- Không thêm xử lý lỗi cho trường hợp không thể xảy ra (vd None-network edge case không có trong scope).

## Dependency thay đổi

Thêm mới vào `package.json`:
- `@react-three/fiber` — viết scene 3D dạng khai báo.
- `resend` — gửi email từ API route.

Không cần: `@react-three/drei`, framework test, thư viện form-service khác.

## Dọn dẹp scaffold cũ

- Thay nội dung `app/page.tsx` mặc định bằng việc ghép các section portfolio.
- Cập nhật `app/layout.tsx`: đổi font, thêm `ThemeProvider` + `SmoothScrollProvider`, cập nhật `metadata` (title/description theo placeholder gốc `"[Your Name] — [Job Title] | Portfolio"`).
- Xoá các SVG mẫu không dùng trong `public/` (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`) nếu không còn tham chiếu.
- Giữ nguyên `Developer Portfolio Template/` làm tài liệu tham khảo gốc (không xoá).

## Xác nhận cuối (build/lint only)

Sau khi implement: chạy `npm run lint` và `npm run build` để đảm bảo không có lỗi biên dịch/type. Không yêu cầu bước chạy dev server/kiểm tra bằng trình duyệt trong phạm vi task này.
