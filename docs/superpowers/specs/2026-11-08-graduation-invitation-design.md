# Graduation Invitation — Design Spec

- **Date:** 2026-11-08
- **Route:** `/graduation?to={slug}`
- **Source design:** claude.ai/design project `b80db96d-a298-4481-b2c5-f918cefba74d`, file `Graduation Invitation.dc.html` (riso design system `quang-vinh-riso-design-system-43d88b6e`)

## 1. Goal

A personal, scroll-driven graduation invitation. Each guest gets their own link, `/graduation?to=<slug>`. The page greets them by name, tells the story (envelope → how we met → ceremony details), and lets them RSVP. The owner manages the guest list and sees RSVPs in `/admin`.

**Success criteria**

- A valid link renders the full invitation with the guest's name and personal note. A missing or unknown `to` returns 404.
- Visually faithful to the source design: envelope open/flip timeline, 3D toon graduate character with per-section actions, side rails, riso styling, light/dark themes.
- RSVP is persisted per guest and emails the owner. Guests can change their answer.
- Admin can add, edit and delete guests, copy each guest's link, and see each guest's RSVP status.
- Works on mobile (≥ 360px) and respects `prefers-reduced-motion`.

**Non-goals:** multi-event support, i18n beyond the design's bilingual VI/EN copy, guest self-registration, plus-ones/headcount.

## 2. Decisions (agreed)

| Topic | Decision |
|---|---|
| Invalid / missing `to` | `notFound()` → 404 |
| Guest list storage | `Guest` table in Postgres (Prisma), managed from `/admin` |
| RSVP | Stored in DB (upsert, one per guest) **and** emailed to the owner via Resend |
| Background music | A YouTube video, played through the YouTube IFrame Player API (no local mp3) |
| 3D / animation port | Port the design's imperative three.js + GSAP code nearly as-is into a client component (no R3F rewrite) |
| Admin auth | Replace the forgeable `admin_auth=true` cookie with an HMAC-signed cookie |
| Tests | Add `vitest` for pure logic |

## 3. Data model (Prisma)

```prisma
model Guest {
  id        String   @id @default(uuid())
  slug      String   @unique
  name      String
  note      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  rsvp      Rsvp?
}

enum RsvpStatus {
  yes
  no
}

model Rsvp {
  id        String     @id @default(uuid())
  guestId   String     @unique
  guest     Guest      @relation(fields: [guestId], references: [id], onDelete: Cascade)
  status    RsvpStatus
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}
```

- Add the models through a new migration in `prisma/migrations`.
- **Slug rules** (`lib/graduation/slug.ts`, `toSlug(name)`): NFD-normalize, strip combining marks, map `đ/Đ → d`, lowercase, replace runs of non-`[a-z0-9]` characters with `-`, trim `-`. Example: `"Nguyễn Minh Anh" → "nguyen-minh-anh"`.
- A valid slug matches `^[a-z0-9]+(?:-[a-z0-9]+)*$`, 1–64 chars.
- Admin can override the slug. On a collision, the create/update action returns a field error and does not auto-suffix, so the owner chooses the slug.

## 4. Route `/graduation`

`app/graduation/page.tsx` is a server component:

1. `export const dynamic = "force-dynamic"`.
2. Read `searchParams.to`. If it is missing, not a string, or fails the slug regex, call `notFound()`.
3. Run `prisma.guest.findUnique({ where: { slug }, include: { rsvp: true } })`. If no guest is found, call `notFound()`.
4. Render `<GraduationInvitation guest={{ slug, name, note }} initialRsvp={rsvp?.status ?? null} />`.

**Metadata:** keep `robots: { index: false, follow: false }`. Use `generateMetadata` for the title `Thư mời tốt nghiệp · {name}` (falling back to the static title when the guest is invalid). No canonical with the query string.

**404:** `app/graduation/not-found.tsx` is a small riso-styled screen: "Thiệp này không tồn tại · This invitation doesn't exist", plus a "← Portfolio" button.

The existing scaffold (`components/graduation/graduation-shell.tsx`, `Slot`, placeholder sections) is removed. The new page has its own fixed header and footer.

## 5. Static event content

`lib/graduation/event.ts` exports a typed constant holding everything the design hard-codes:

- Ceremony date/time: Sat 19.12.2026, 09:00–11:30 (Asia/Ho_Chi_Minh, so UTC `02:00–04:30`).
- Venue: Hội trường A4, ĐH Bách Khoa, 268 Lý Thường Kiệt, Phường 14, Quận 10, TP.HCM. Google Maps URL.
- Notes row: Smart casual · Gửi xe cổng Lý Thường Kiệt · Chụp ảnh sau lễ.
- The four "moments" cards (`n, year, vi, en, body, color, rot`), copied verbatim from the design.
- Default personal note (VI + EN), used when `guest.note` is empty.
- `musicYoutubeId`: the YouTube video ID for the background music (owner supplies it).

`lib/graduation/ics.ts` provides `buildIcs(event): string`, which produces the VCALENDAR text from the design (UID, DTSTART/DTEND in UTC, escaped LOCATION). It is a pure function and is tested.

## 6. Client components (`components/graduation/`)

| File | Responsibility |
|---|---|
| `invitation.tsx` | `"use client"` root. Composes the header, rails, sections and footer. Owns the theme toggle (via `next-themes`) and the music state. Wires GSAP context and the character lifecycle. |
| `invitation-header.tsx` | Fixed header: "← Portfolio" link, "Graduation 2026", music `IconButton` (♪, canary when playing), `ThemeToggle`. |
| `side-rails.tsx` | Fixed vertical rails: When (with the scroll-progress bar `#railProgress`) and Where. Hidden below 760px. |
| `envelope-stage.tsx` | `#stage` (420vh, sticky 100vh): cover kicker / greeting kicker, envelope front (air mail, stamp, postmark, "Gửi · To {name}"), back (body, card "Xin chào, {name}.", pocket, flap with QV seal), scroll hint. Builds the scrubbed GSAP timeline exactly as in the design (`tl` positions 0 → 0.86). |
| `met-section.tsx` | "03 · How we met": heading, four tilted index cards with tape, plus the "Và bạn · And you, {name}" card showing `guest.note` or the default note. |
| `ends-section.tsx` | "04 · How it ends": ticket card (date / venue / notes row, "Admit One Guest" stamp), "Chỉ đường" (maps link, new tab) and "Thêm vào lịch" (downloads `tot-nghiep-quang-vinh.ics` from `buildIcs`). |
| `rsvp-panel.tsx` | "05 · RSVP": the two buttons, then a result `Pill` and an "Đổi ý · Change answer" link. Calls the `submitRsvp` server action (see §7). |
| `grad-character.ts` | Plain TS, no React. `createGradCharacter(host: HTMLElement, opts)` returns `{ frame(time), resize(), computeBeats(), applyPalette(dark), dispose() }`. It contains the toon-material rig, outline meshes, props (card, books, laptop), the beat table and the `target()` / `frame()` math from the design, ported line-for-line with types. |
| `youtube-music.tsx` | YouTube IFrame Player API wrapper (see §8). |

**Shared riso UI** (`components/ui/riso/`): `Button`, `IconButton`, `ThemeToggle`, `Pill`, ported from the design-system bundle. Props are kept (`variant/size/offsetColor/icon/href`, `size/fill/label`, `dark/onToggle`, `color/tilt/pulse/size/shadow`). Hover and press states move to CSS (Tailwind + CSS vars) instead of `useState` handlers, so they also work on keyboard focus.

**Tokens:** `app/globals.css` already has every colour, font, offset, radius and motion token. Add `--stripes-tape`, `--offset-xs`, `--offset-hover` and `--offset-press` from the DS `effects.css`. `pulse-dot` already exists.

**Theme:** use `next-themes` (`useTheme`) instead of setting `data-theme` directly. After the theme changes, call `character.applyPalette()` on the next animation frame, so the materials read the new CSS vars.

**Lenis / ScrollTrigger:** the page must not create its own Lenis.
- Update `components/providers/smooth-scroll-provider.tsx` to:
  - call `gsap.registerPlugin(ScrollTrigger)` and `lenis.on("scroll", ScrollTrigger.update)`;
  - expose the instance through a `LenisContext` (`useLenis()`; `null` under reduced motion).
- The invitation adds its own `gsap.ticker` callback for `character.frame(time)`.

**Lifecycle** (inside `invitation.tsx`):
1. Wait for `document.fonts.ready`.
2. Build the GSAP timelines in `gsap.context(..., rootRef)`.
3. Create the character and call `ScrollTrigger.refresh()`.
4. On resize, call `character.resize()`, recompute beats, and refresh.
5. On unmount, revert the context, remove the ticker callback, call `character.dispose()` (renderer, geometries, materials, canvas).

**Reduced motion** (`prefers-reduced-motion: reduce`):
- Skip the stage timeline and render the envelope in its final state (card open, scale 1.32, greeting kicker visible). The stage height collapses to `100vh`.
- No `[data-reveal]` blur-in. The character is not created.

**Mobile (< 760px):**
- Envelope width `min(560px, 86vw)`. Section horizontal padding 24px.
- Rails hidden. Two-column grids collapse to one column.
- Character scale ×0.7 (as in the design).
- The ticket card stacks its columns.

**Accessibility:**
- Decorative layers (halftone, canvas host, pocket SVGs, stamps) get `aria-hidden`.
- The guest name appears in real text.
- Buttons have labels (music, theme). Visible focus rings use `outline: 2px solid var(--blue)`.

## 7. RSVP

**Server action** `app/graduation/actions.ts`, `submitRsvp(input: { slug: string; status: "yes" | "no" })`:

1. Validate with zod (`lib/schemas/rsvp.ts`: slug regex + enum).
2. Find the guest by slug. If it does not exist, return `{ ok: false, error: "not_found" }`.
3. Run `prisma.rsvp.upsert({ where: { guestId }, create: {...}, update: { status } })`.
4. Send the email via Resend, reusing the env vars from `/api/contact`: `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`.
   - Subject: `RSVP: {name} — {Sẽ đến | Không đến}`.
   - Body: name, slug, status, timestamp (Asia/Ho_Chi_Minh), and whether this is a change from the previous status.
   - Email failure or missing env is logged with `console.error` and does **not** fail the action, because the DB is the source of truth.
5. Return `{ ok: true, status }`.

**Client** (`rsvp-panel.tsx`):
- `useTransition` disables both buttons while pending.
- On success, show the design's Pill: jade "✓ Postmarked — hẹn gặp bạn ngày 19.12!" or tomato "✓ Đã nhận — cảm ơn bạn đã báo · Noted, thank you".
- On failure, show an inline mono error "Không gửi được, thử lại nhé · Couldn't send, try again" and keep the buttons.
- `initialRsvp` from the server means a returning guest sees their previous answer.
- "Đổi ý" only resets the UI to the buttons. The DB changes when a new answer is submitted.

**Abuse limits:** the slug is the only credential, which is acceptable for an invitation. Do not add rate limiting, because the upsert is idempotent per guest.

## 8. Background music (YouTube)

- `youtube-music.tsx` lazy-loads `https://www.youtube.com/iframe_api` only on the **first click** of the music button, so there is no third-party load on page view.
- It creates a `YT.Player` with `videoId = event.musicYoutubeId` and `playerVars: { autoplay: 1, loop: 1, playlist: <id>, controls: 0, playsinline: 1, modestbranding: 1 }`. It uses the `youtube-nocookie.com` host.
- The player is mounted in a small fixed "now playing" mini-card, bottom-left, above the footer z-index. It is ≥ 200×200 to comply with YouTube's player-size policy, styled with a riso border and offset shadow, and has a close (×) control that pauses playback.
- The card shows only while music is playing or paused-but-open.
- Button toggles `playVideo()` / `pauseVideo()`. The music `IconButton` fill is canary while playing.
- Errors (`onError`, script blocked, or no `musicYoutubeId` configured) show the design's transient header note, changed from "+ music.mp3" to "Không phát được nhạc · Music unavailable", for 2.6s.
- Under reduced motion the music still works, because it is user-initiated.

## 9. Admin

**Auth hardening** (`lib/admin-auth.ts`):
- `signAdminToken()` returns `"<issuedAt>.<hmacSha256(issuedAt, ADMIN_SESSION_SECRET)>"`.
- `verifyAdminToken(token)` checks the HMAC with a constant-time compare and enforces a max age of 7 days.
- `loginAction` sets `admin_auth` to the signed token (`httpOnly`, `secure`, `sameSite: "lax"`, `path: "/"`, `maxAge` 7d).
- Add `requireAdmin()`, which reads the cookie and verifies it, otherwise it throws or redirects. Every admin server action and the admin page use it.
- New env var `ADMIN_SESSION_SECRET`. If it is missing, login fails with a config error, matching the current credentials check.
- Existing `true` cookies become invalid, so the owner logs in once again.

**Guests UI:**
- `/admin` gets a second section, "Graduation guests", below the visitors list, styled in the existing zinc admin style.
- `app/admin/guests/GuestManager.tsx` (client) plus `app/admin/guests/actions.ts`:
  - `createGuest({ name, slug?, note? })`: slug defaults to `toSlug(name)`. Validates the slug regex and uniqueness (catches Prisma `P2002` and returns a field error).
  - `updateGuest(id, { name, slug, note })`.
  - `deleteGuest(id)`: the RSVP cascades.
  - Each action calls `requireAdmin()` first, then `revalidatePath("/admin")`.
- Table columns: Name · Slug · Note (truncated) · RSVP (— / Sẽ đến / Không đến + updatedAt) · Actions (Copy link, Edit, Delete with confirm).
- Copy link writes `${SITE_URL}/graduation?to=${slug}` to the clipboard.
- Header counters: total guests · yes · no · no answer.

## 10. File map

```
prisma/schema.prisma                         + Guest, Rsvp, RsvpStatus
prisma/migrations/<ts>_graduation_guests/    new
app/graduation/page.tsx                      rewrite (server, validation, notFound)
app/graduation/not-found.tsx                 new
app/graduation/actions.ts                    new (submitRsvp)
app/admin/actions.ts                         signed cookie
app/admin/page.tsx                           requireAdmin + guests section
app/admin/guests/GuestManager.tsx            new
app/admin/guests/actions.ts                  new
app/globals.css                              + missing DS effect tokens
components/graduation/*                      new (see §6); graduation-shell.tsx removed
components/ui/riso/{Button,IconButton,ThemeToggle,Pill}.tsx   new
components/providers/smooth-scroll-provider.tsx   ScrollTrigger sync + LenisContext
lib/graduation/{event,ics,slug}.ts           new
lib/schemas/rsvp.ts, lib/schemas/guest.ts    new
lib/admin-auth.ts                            new
vitest.config.ts, package.json               + vitest, "test" script
```

## 11. Testing

**Unit (vitest, node env):**
- `toSlug`: Vietnamese diacritics, `đ`, spaces and punctuation, leading and trailing junk, empty result.
- Slug regex: accept and reject cases.
- `buildIcs`: contains the correct DTSTART/DTEND UTC, escaped commas in LOCATION, CRLF line endings.
- `signAdminToken` / `verifyAdminToken`: round-trip, tampered signature, wrong secret, expired token.
- `rsvpSchema` / `guestSchema`: valid and invalid input.

**Manual verification** (dev server + browser):
1. `/graduation` with no `to` returns 404, `?to=khong-ton-tai` returns 404, and a valid slug shows the guest's name in the envelope, the greeting card, "And you" and RSVP.
2. Full scroll: the envelope tilts → flips → flap opens → card rises → envelope drops → card scales. The character waves → bows → sits with laptop and books → points → tosses cap. The rail progress fills.
3. Theme toggle changes the page colours and the character materials.
4. RSVP yes/no writes a DB row and sends the email; reload shows the saved answer; changing the answer updates the row and sends a second email.
5. The music button loads YouTube, plays and pauses; the mini-card close pauses; a bad video ID shows the note.
6. The .ics file downloads and imports at 09:00 local time. The maps link opens.
7. Admin: an old `true` cookie is rejected. Login, create a guest (auto slug), duplicate slug error, edit, copy link, delete (RSVP removed).
8. Reduced-motion emulation and a 375px viewport.
9. `pnpm lint`, `pnpm build` and `pnpm test` all pass.

## 12. Open items for the owner

- Provide the **YouTube video ID** for `musicYoutubeId`.
- Set `ADMIN_SESSION_SECRET` in local `.env` and on Vercel.
- Confirm the event details in `lib/graduation/event.ts` (copied from the design) before sending links.
