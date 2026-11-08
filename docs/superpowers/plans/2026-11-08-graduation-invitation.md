# Graduation Invitation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the personal, scroll-driven graduation invitation at `/graduation?to={slug}`. Guests are stored in the DB and managed from `/admin`, RSVPs are persisted and emailed, and background music comes from YouTube.

**Architecture:**
- **Server side** is layered:
  - pure helpers (`lib/graduation/*`, `lib/admin-auth/token.ts`), unit-tested;
  - thin Prisma repositories;
  - services that receive their dependencies as arguments (DIP), so they are unit-tested with fakes;
  - Next server actions that only wire real dependencies into services.
- **Client side** is made of many small presentational components plus a few focused hooks. Each hook owns exactly one side-effect (timeline, character, music, reveal, theme).
- **The 3D character** is plain TypeScript split into pure beat math, materials, mesh kit, rig, pose and an orchestrator.

**Tech Stack:** Next.js 16 (App Router, server actions), React 19, TypeScript, Tailwind v4, Prisma 7 (Postgres, generated client at `@/generated/prisma/client`), zod 4, Resend, gsap 3 + ScrollTrigger, lenis, three 0.185, next-themes, vitest (new).

**Spec:** `docs/superpowers/specs/2026-11-08-graduation-invitation-design.md`

## Global Constraints

- **SOLID:** one responsibility per file. Services depend on interfaces passed in, never on `@/lib/prisma` directly. UI components never call Prisma.
- **File size:** each new file stays under ~150 lines. If one grows past that, split it before committing.
- **Reuse before writing:**
  - `useScrollReveal` (`lib/hooks/use-scroll-reveal.ts`) for reveal-on-scroll;
  - the riso tokens in `app/globals.css`;
  - `lib/email/send-email.ts` (Task 4) for every email;
  - `lib/site.ts` (Task 1) for the site URL;
  - the `components/ui/riso/*` primitives (Task 13) for buttons, pills and toggles.
- **Valid slug:** `^[a-z0-9]+(?:-[a-z0-9]+)*$`, 1–64 chars.
- **404:** missing, invalid or unknown `to` calls `notFound()`.
- **Page metadata:** `/graduation` keeps `robots: { index: false, follow: false }` and sets `export const dynamic = "force-dynamic"`.
- **Ceremony:** Sat 19.12.2026, 09:00–11:30 Asia/Ho_Chi_Minh, which is UTC `20261219T020000Z`–`20261219T043000Z`.
- **Email env:** `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`. Admin env: `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`.
- **Admin cookie:** `admin_auth`, HMAC-SHA256 signed, `httpOnly`, `secure`, `sameSite: "lax"`, `path: "/"`, max age 7 days.
- **Email failure** never fails an RSVP. The DB is the source of truth.
- **Reduced motion** (`prefers-reduced-motion: reduce`): no scrub timeline, no character, no reveal animation. Music still works.
- **Breakpoint** for mobile layout: `760px`. Use the Tailwind `min-[760px]:` variant.
- **YouTube player:** the visible mini player is ≥ 200×200 and uses the `https://www.youtube-nocookie.com` host. The IFrame API script loads only on the first click of the music button.
- **Copy:** bilingual VI · EN copied verbatim from the design.
- **Tests:** colocated `*.test.ts`, run with `pnpm test`. Code style matches the surrounding code: double quotes, 2-space indent, named exports. The existing admin files use single quotes; keep their style when editing them.

## Review Focus

1. **Odd `to` values:** uppercase or padded (`?to=%20Minh-Anh`), repeated (`?to=a&to=b`), very long, or with diacritics. Expected: trimmed and lowercased; arrays, invalid strings and length > 64 give 404, never a crash. *Test in Task 1 (`parseGuestSlug`).*
2. **Admin enters a name with no slug-able characters** (e.g. `"🎓 !!!"`) and leaves the slug blank. Expected: a field error on slug, nothing written. *Test in Task 8.*
3. **Email env missing or Resend down** while a guest RSVPs. Expected: the RSVP is saved and the guest sees success. *Test in Task 9.*
4. **Guest deleted by admin while their invitation tab is open, then they click RSVP.** Expected: `{ ok: false, error: "not_found" }` and an inline error, not a thrown 500. *Test in Task 9.*
5. **Pre-existing `admin_auth=true` cookie, a tampered token, or an expired token.** Expected: treated as logged out everywhere, including `/api/visitor`. *Test in Task 2.*

---

## File Map

```
lib/site.ts                                   SITE_URL constant (reused by layout, home page, admin)
lib/email/send-email.ts                       Resend wrapper + env config (reused by contact + RSVP)
lib/admin-auth/token.ts                       pure sign/verify
lib/admin-auth/session.ts                     cookie read/write, isAdminSession, requireAdmin
lib/graduation/types.ts                       shared domain types
lib/graduation/slug.ts                        toSlug, isValidSlug, parseGuestSlug
lib/graduation/guest-schema.ts                zod guest input
lib/graduation/rsvp-schema.ts                 zod rsvp input
lib/graduation/guest-repository.ts            Prisma guest access
lib/graduation/rsvp-repository.ts             Prisma rsvp access
lib/graduation/guest-service.ts               saveGuest (DI)
lib/graduation/rsvp-email.ts                  buildRsvpEmail (pure)
lib/graduation/rsvp-service.ts                submitRsvp (DI)
lib/graduation/get-invitation-guest.ts        cached lookup used by page + metadata
lib/graduation/event.ts                       static event content
lib/graduation/ics.ts                         buildIcs (pure)
lib/browser/download-text-file.ts             trigger a client download
lib/youtube/types.ts, load-iframe-api.ts      YT typings + singleton loader
lib/hooks/use-reduced-motion.ts               matchMedia hook
lib/hooks/use-transient-flag.ts               auto-resetting boolean
lib/hooks/use-is-dark.ts                      next-themes dark state + toggle
components/providers/lenis-context.ts         LenisContext + useLenis
components/ui/riso/{button,icon-button,theme-toggle,pill}.tsx
components/graduation/shared/{section-kicker,section-heading,graduation-section,postmark,tape,riso-stripes}.tsx
components/graduation/met/{moment-card,personal-note-card,met-section}.tsx
components/graduation/ends/{ticket-when,ticket-where,ticket-notes,ticket-card,ends-section}.tsx
components/graduation/rsvp/{use-rsvp.ts,rsvp-choices,rsvp-result,rsvp-section}.tsx
components/graduation/envelope/{envelope-front,invitation-card,envelope-pocket,envelope-flap,envelope-back,stage-kickers,scroll-hint,use-envelope-timeline.ts,envelope-stage}.tsx
components/graduation/character/{types,beats,materials,mesh-kit,rig,pose,grad-character,measure-sections}.ts + use-grad-character.ts
components/graduation/music/{use-youtube-player.ts,music-mini-player,music-toggle}.tsx
components/graduation/chrome/{invitation-header,side-rail,side-rails,invitation-footer,use-scroll-progress.ts}.tsx
components/graduation/invitation.tsx          composition root (client)
app/graduation/{page,not-found}.tsx, actions.ts
app/admin/guests/{actions.ts,guest-section,guest-manager,guest-form,guest-row,guest-stats,copy-link-button}.tsx
```

Deleted: `components/graduation/graduation-shell.tsx`.

---

## Phase A — Foundation & server

### Task 1: Vitest, `SITE_URL`, slug helpers

**Files:**
- Create: `vitest.config.ts`, `lib/site.ts`, `lib/graduation/slug.ts`, `lib/graduation/slug.test.ts`
- Modify: `package.json` (script + devDep), `app/layout.tsx:30`, `app/page.tsx:14`

**Interfaces:**
- Produces:
  - `SITE_URL: string`
  - `SLUG_PATTERN: RegExp`, `SLUG_MAX_LENGTH = 64`
  - `toSlug(name: string): string`
  - `isValidSlug(value: string): boolean`
  - `parseGuestSlug(value: string | string[] | undefined): string | null`

- [ ] **Step 1: Install vitest and add the script**

Run: `pnpm add -D vitest`
Then add `"test": "vitest run"` to `package.json` `scripts`.

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname) } },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "components/**/*.test.ts", "app/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Create `lib/site.ts` and reuse it**

```ts
export const SITE_URL = "https://www.vinhvolequang.io.vn";
```

In `app/layout.tsx` and `app/page.tsx`, delete the local `const SITE_URL = "https://www.vinhvolequang.io.vn";` and add `import { SITE_URL } from "@/lib/site";`.

- [ ] **Step 4: Write the failing test `lib/graduation/slug.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { isValidSlug, parseGuestSlug, toSlug } from "./slug";

describe("toSlug", () => {
  it("strips Vietnamese diacritics and joins with dashes", () => {
    expect(toSlug("Nguyễn Minh Anh")).toBe("nguyen-minh-anh");
  });
  it("maps đ/Đ to d", () => {
    expect(toSlug("Đặng Đức")).toBe("dang-duc");
  });
  it("collapses punctuation and trims dashes", () => {
    expect(toSlug("  --Anh (Tom)!! ")).toBe("anh-tom");
  });
  it("returns empty string when nothing is slug-able", () => {
    expect(toSlug("🎓 !!!")).toBe("");
  });
  it("caps length at 64 without a trailing dash", () => {
    const slug = toSlug("a ".repeat(60));
    expect(slug.length).toBeLessThanOrEqual(64);
    expect(slug.endsWith("-")).toBe(false);
  });
});

describe("isValidSlug", () => {
  it.each(["minh-anh", "a", "k22-cs"])("accepts %s", (s) => {
    expect(isValidSlug(s)).toBe(true);
  });
  it.each(["", "Minh", "minh--anh", "-minh", "minh-", "minh anh", "a".repeat(65)])(
    "rejects %j",
    (s) => {
      expect(isValidSlug(s)).toBe(false);
    },
  );
});

describe("parseGuestSlug", () => {
  it("trims and lowercases", () => {
    expect(parseGuestSlug("  Minh-Anh ")).toBe("minh-anh");
  });
  it("returns null for missing, array, or invalid values", () => {
    expect(parseGuestSlug(undefined)).toBeNull();
    expect(parseGuestSlug(["a", "b"])).toBeNull();
    expect(parseGuestSlug("minh anh")).toBeNull();
    expect(parseGuestSlug("nguyễn")).toBeNull();
    expect(parseGuestSlug("a".repeat(65))).toBeNull();
  });
});
```

- [ ] **Step 5: Run it and confirm it fails**

Run: `pnpm test lib/graduation/slug.test.ts`
Expected: FAIL, "Failed to resolve import ./slug".

- [ ] **Step 6: Implement `lib/graduation/slug.ts`**

```ts
export const SLUG_MAX_LENGTH = 64;
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** "Nguyễn Minh Anh" → "nguyen-minh-anh". Returns "" when nothing is slug-able. */
export function toSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/, "");
}

export function isValidSlug(value: string): boolean {
  return value.length <= SLUG_MAX_LENGTH && SLUG_PATTERN.test(value);
}

/** Normalises the `?to=` search param; null means "render 404". */
export function parseGuestSlug(value: string | string[] | undefined): string | null {
  if (typeof value !== "string") return null;
  const slug = value.trim().toLowerCase();
  return isValidSlug(slug) ? slug : null;
}
```

- [ ] **Step 7: Run the tests and lint**

Run: `pnpm test && pnpm lint`
Expected: all slug tests PASS, lint clean.

- [ ] **Step 8: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts lib/site.ts lib/graduation/slug.ts lib/graduation/slug.test.ts app/layout.tsx app/page.tsx
git commit -m "feat(graduation): add vitest, shared SITE_URL and slug helpers"
```

---

### Task 2: Admin token (pure)

**Files:**
- Create: `lib/admin-auth/token.ts`, `lib/admin-auth/token.test.ts`

**Interfaces:**
- Produces:
  - `ADMIN_SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000`
  - `signAdminToken(secret: string, now?: number): string`, token format `"<issuedAtMs>.<hex hmac>"`
  - `verifyAdminToken(token: string | undefined, secret: string, now?: number): boolean`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { ADMIN_SESSION_MAX_AGE_MS, signAdminToken, verifyAdminToken } from "./token";

const SECRET = "test-secret";
const NOW = 1_800_000_000_000;

describe("admin token", () => {
  it("round-trips", () => {
    expect(verifyAdminToken(signAdminToken(SECRET, NOW), SECRET, NOW)).toBe(true);
  });
  it("rejects the legacy 'true' cookie, empty and undefined", () => {
    expect(verifyAdminToken("true", SECRET, NOW)).toBe(false);
    expect(verifyAdminToken("", SECRET, NOW)).toBe(false);
    expect(verifyAdminToken(undefined, SECRET, NOW)).toBe(false);
  });
  it("rejects a tampered signature or timestamp", () => {
    const [issued, sig] = signAdminToken(SECRET, NOW).split(".");
    const flipped = sig.slice(0, -1) + (sig.endsWith("0") ? "1" : "0");
    expect(verifyAdminToken(`${issued}.${flipped}`, SECRET, NOW)).toBe(false);
    expect(verifyAdminToken(`${Number(issued) + 1}.${sig}`, SECRET, NOW)).toBe(false);
  });
  it("rejects a token signed with another secret", () => {
    expect(verifyAdminToken(signAdminToken("other", NOW), SECRET, NOW)).toBe(false);
  });
  it("rejects expired and future tokens", () => {
    const token = signAdminToken(SECRET, NOW);
    expect(verifyAdminToken(token, SECRET, NOW + ADMIN_SESSION_MAX_AGE_MS + 1)).toBe(false);
    expect(verifyAdminToken(token, SECRET, NOW - 60_000)).toBe(false);
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm test lib/admin-auth/token.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `lib/admin-auth/token.ts`**

```ts
import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function signAdminToken(secret: string, now: number = Date.now()): string {
  const issuedAt = String(now);
  return `${issuedAt}.${sign(issuedAt, secret)}`;
}

export function verifyAdminToken(
  token: string | undefined,
  secret: string,
  now: number = Date.now(),
): boolean {
  if (!token) return false;
  const [issuedAt, signature, extra] = token.split(".");
  if (!issuedAt || !signature || extra !== undefined || !/^\d+$/.test(issuedAt)) return false;

  const expected = Buffer.from(sign(issuedAt, secret), "hex");
  const actual = Buffer.from(signature, "hex");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;

  const age = now - Number(issuedAt);
  return age >= 0 && age <= ADMIN_SESSION_MAX_AGE_MS;
}
```

- [ ] **Step 4: Run the test**

Run: `pnpm test lib/admin-auth/token.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/admin-auth/token.ts lib/admin-auth/token.test.ts
git commit -m "feat(admin): add HMAC-signed admin session token"
```

---

### Task 3: Admin session helpers and replacing the forgeable cookie

**Files:**
- Create: `lib/admin-auth/session.ts`
- Modify: `app/admin/actions.ts` (cookie set), `app/admin/page.tsx` (auth check), `app/api/visitor/route.ts` (auth check), `.env.example`

**Interfaces:**
- Consumes: `signAdminToken`, `verifyAdminToken`, `ADMIN_SESSION_MAX_AGE_MS` (Task 2)
- Produces:
  - `ADMIN_COOKIE = "admin_auth"`
  - `readAdminSecret(): string | null`
  - `isAdminSession(): Promise<boolean>`
  - `requireAdmin(): Promise<void>`, which throws `Error("Unauthorized")`
  - `startAdminSession(): Promise<void>`

- [ ] **Step 1: Create `lib/admin-auth/session.ts`**

```ts
import { cookies } from "next/headers";
import { ADMIN_SESSION_MAX_AGE_MS, signAdminToken, verifyAdminToken } from "./token";

export const ADMIN_COOKIE = "admin_auth";

export function readAdminSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET || null;
}

export async function isAdminSession(): Promise<boolean> {
  const secret = readAdminSecret();
  if (!secret) return false;
  const cookieStore = await cookies();
  return verifyAdminToken(cookieStore.get(ADMIN_COOKIE)?.value, secret);
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdminSession())) throw new Error("Unauthorized");
}

export async function startAdminSession(): Promise<void> {
  const secret = readAdminSecret();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, signAdminToken(secret), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_MS / 1000,
  });
}
```

- [ ] **Step 2: Update `app/admin/actions.ts`**

- Replace the `cookies` import with `import { readAdminSecret, startAdminSession } from '@/lib/admin-auth/session';`.
- Extend the credentials guard:

```ts
  if (!validUsername || !validPassword || !readAdminSecret()) {
    return { error: 'Admin credentials are not configured in environment variables.' };
  }
```

- Replace the success branch body:

```ts
  if (success) {
    await startAdminSession();
    redirect('/admin');
  } else {
```

- [ ] **Step 3: Update `app/admin/page.tsx`**

Replace the `cookies` import and the two `cookieStore` lines with:

```tsx
import { isAdminSession } from '@/lib/admin-auth/session';
// ...
  const isAuthenticated = await isAdminSession();
```

- [ ] **Step 4: Update `app/api/visitor/route.ts` GET**

Replace the `cookies` import and the `isAdmin` lines:

```ts
import { isAdminSession } from '@/lib/admin-auth/session';
// ...
  const isAdmin = await isAdminSession();
```

If `cookies` is no longer used anywhere in the file, remove its import.

- [ ] **Step 5: Document the env vars in `.env.example`**

Append:

```
# Sender address for Resend emails (contact form + graduation RSVP).
CONTACT_FROM_EMAIL=

# Admin login + HMAC secret for the admin session cookie (any long random string).
ADMIN_USERNAME=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
```

- [ ] **Step 6: Verify**

Run: `pnpm lint && pnpm build`
Expected: both succeed.

Manual check:
1. Add `ADMIN_SESSION_SECRET=dev-secret` to `.env` and run `pnpm dev`.
2. In devtools set cookie `admin_auth=true` and open `/admin`. Expected: login form.
3. Log in. Expected: dashboard, and the cookie value looks like `1731...<hex>`.
4. Open `/api/visitor`. Expected: JSON. With cookie `true` it returns 401.

- [ ] **Step 7: Commit**

```bash
git add lib/admin-auth/session.ts app/admin/actions.ts app/admin/page.tsx app/api/visitor/route.ts .env.example
git commit -m "fix(admin): replace forgeable admin cookie with signed session"
```

---

### Task 4: Shared email sender (extracted from the contact route)

**Files:**
- Create: `lib/email/send-email.ts`, `lib/email/send-email.test.ts`
- Modify: `app/api/contact/route.ts`

**Interfaces:**
- Produces:
  - `type EmailConfig = { apiKey: string; from: string; to: string }`
  - `type EmailMessage = { subject: string; text: string; replyTo?: string }`
  - `type SendEmailResult = { ok: true } | { ok: false; reason: "not_configured" | "send_failed" }`
  - `readEmailConfig(env?: Record<string, string | undefined>): EmailConfig | null`
  - `sendEmail(message: EmailMessage, config?: EmailConfig | null): Promise<SendEmailResult>`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { readEmailConfig, sendEmail } from "./send-email";

describe("readEmailConfig", () => {
  it("returns null when any variable is missing", () => {
    expect(readEmailConfig({ RESEND_API_KEY: "k", CONTACT_FROM_EMAIL: "f" })).toBeNull();
  });
  it("maps env to config", () => {
    expect(
      readEmailConfig({ RESEND_API_KEY: "k", CONTACT_FROM_EMAIL: "f", CONTACT_TO_EMAIL: "t" }),
    ).toEqual({ apiKey: "k", from: "f", to: "t" });
  });
});

describe("sendEmail", () => {
  it("reports not_configured without calling Resend", async () => {
    await expect(sendEmail({ subject: "s", text: "t" }, null)).resolves.toEqual({
      ok: false,
      reason: "not_configured",
    });
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm test lib/email`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `lib/email/send-email.ts`**

```ts
import { Resend } from "resend";

export type EmailConfig = { apiKey: string; from: string; to: string };
export type EmailMessage = { subject: string; text: string; replyTo?: string };
export type SendEmailResult = { ok: true } | { ok: false; reason: "not_configured" | "send_failed" };

export function readEmailConfig(
  env: Record<string, string | undefined> = process.env,
): EmailConfig | null {
  const apiKey = env.RESEND_API_KEY;
  const from = env.CONTACT_FROM_EMAIL;
  const to = env.CONTACT_TO_EMAIL;
  return apiKey && from && to ? { apiKey, from, to } : null;
}

/** Sends a plain-text email to the site owner. Never throws. */
export async function sendEmail(
  message: EmailMessage,
  config: EmailConfig | null = readEmailConfig(),
): Promise<SendEmailResult> {
  if (!config) return { ok: false, reason: "not_configured" };
  try {
    const { error } = await new Resend(config.apiKey).emails.send({
      from: config.from,
      to: config.to,
      subject: message.subject,
      text: message.text,
      replyTo: message.replyTo,
    });
    return error ? { ok: false, reason: "send_failed" } : { ok: true };
  } catch {
    return { ok: false, reason: "send_failed" };
  }
}
```

- [ ] **Step 4: Refactor `app/api/contact/route.ts`**

- Remove the `Resend` import and the `apiKey/from/to` block.
- After `const { name, email, message } = parsed.data;` use:

```ts
  const result = await sendEmail({
    subject: `New message from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
    replyTo: email,
  });

  if (!result.ok) {
    return result.reason === "not_configured"
      ? NextResponse.json({ error: "Email service is not configured." }, { status: 500 })
      : NextResponse.json({ error: "Failed to send message." }, { status: 502 });
  }

  return NextResponse.json({ success: true });
```

- Add `import { sendEmail } from "@/lib/email/send-email";`.

- [ ] **Step 5: Run the tests and lint**

Run: `pnpm test && pnpm lint`
Expected: PASS, lint clean.

- [ ] **Step 6: Commit**

```bash
git add lib/email app/api/contact/route.ts
git commit -m "refactor(email): extract reusable sendEmail from contact route"
```

---

### Task 5: Prisma models and domain types

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_graduation_guests/migration.sql` (generated), `lib/graduation/types.ts`

**Interfaces:**
- Produces (`lib/graduation/types.ts`):
  - `type RsvpStatus = "yes" | "no"`
  - `type GuestRecord = { id: string; slug: string; name: string; note: string | null }`
  - `type InvitationGuest = { slug: string; name: string; note: string | null }`
  - `type GuestListItem = GuestRecord & { rsvpStatus: RsvpStatus | null; rsvpUpdatedAt: string | null }`
  - `type GuestData = { slug: string; name: string; note: string | null }`

- [ ] **Step 1: Append the models to `prisma/schema.prisma`**

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

- [ ] **Step 2: Generate the migration and client**

Run: `pnpm prisma migrate dev --name graduation_guests`
Expected: a new folder in `prisma/migrations/` and "Generated Prisma Client". This needs `DATABASE_URL` pointing to a dev DB. If none is available, stop and ask the owner.

- [ ] **Step 3: Create `lib/graduation/types.ts`**

```ts
export type RsvpStatus = "yes" | "no";

export type GuestRecord = { id: string; slug: string; name: string; note: string | null };

/** What the public invitation page needs about a guest. */
export type InvitationGuest = Pick<GuestRecord, "slug" | "name" | "note">;

/** Serializable row for the admin table. */
export type GuestListItem = GuestRecord & {
  rsvpStatus: RsvpStatus | null;
  rsvpUpdatedAt: string | null;
};

/** Validated data written by admin create/update. */
export type GuestData = { slug: string; name: string; note: string | null };
```

- [ ] **Step 4: Verify the build**

Run: `pnpm build`
Expected: success.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations lib/graduation/types.ts
git commit -m "feat(graduation): add Guest and Rsvp models"
```

---

### Task 6: Repositories (Prisma adapters)

**Files:**
- Create: `lib/graduation/slug-taken-error.ts`, `lib/graduation/guest-repository.ts`, `lib/graduation/rsvp-repository.ts`

**Interfaces:**
- Consumes: `prisma` (`@/lib/prisma`), types from Task 5
- Produces:
  - `class SlugTakenError extends Error` (in `slug-taken-error.ts`)
  - `guestRepository`:
    - `findBySlug(slug): Promise<GuestRecord | null>`
    - `findInvitation(slug): Promise<{ guest: InvitationGuest; rsvp: RsvpStatus | null } | null>`
    - `list(): Promise<GuestListItem[]>`
    - `create(data: GuestData): Promise<GuestRecord>`
    - `update(id: string, data: GuestData): Promise<GuestRecord>`
    - `remove(id: string): Promise<void>`
  - `type GuestWriter = Pick<typeof guestRepository, "create" | "update">`
  - `rsvpRepository`:
    - `save(guestId: string, status: RsvpStatus): Promise<{ previous: RsvpStatus | null }>`

Repositories are thin I/O adapters. They are covered by the build typecheck and by the manual checks in Tasks 10, 11 and 18. Their logic-bearing consumers are unit-tested with fakes.

- [ ] **Step 1: Create `lib/graduation/slug-taken-error.ts` and `lib/graduation/guest-repository.ts`**

The error lives in its own file so services and tests can import it without loading Prisma, because `@/lib/prisma` throws when `DATABASE_URL` is missing.

```ts
// slug-taken-error.ts
export class SlugTakenError extends Error {
  constructor() {
    super("Slug already taken");
  }
}
```

```ts
// guest-repository.ts
import prisma from "@/lib/prisma";
import { SlugTakenError } from "./slug-taken-error";
import type { GuestData, GuestListItem, GuestRecord, InvitationGuest, RsvpStatus } from "./types";

const recordSelect = { id: true, slug: true, name: true, note: true } as const;

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "P2002";
}

async function write<T>(op: () => Promise<T>): Promise<T> {
  try {
    return await op();
  } catch (error) {
    if (isUniqueViolation(error)) throw new SlugTakenError();
    throw error;
  }
}

export const guestRepository = {
  findBySlug(slug: string): Promise<GuestRecord | null> {
    return prisma.guest.findUnique({ where: { slug }, select: recordSelect });
  },

  async findInvitation(
    slug: string,
  ): Promise<{ guest: InvitationGuest; rsvp: RsvpStatus | null } | null> {
    const row = await prisma.guest.findUnique({
      where: { slug },
      select: { slug: true, name: true, note: true, rsvp: { select: { status: true } } },
    });
    if (!row) return null;
    const { rsvp, ...guest } = row;
    return { guest, rsvp: rsvp?.status ?? null };
  },

  async list(): Promise<GuestListItem[]> {
    const rows = await prisma.guest.findMany({
      orderBy: { createdAt: "desc" },
      select: { ...recordSelect, rsvp: { select: { status: true, updatedAt: true } } },
    });
    return rows.map(({ rsvp, ...guest }) => ({
      ...guest,
      rsvpStatus: rsvp?.status ?? null,
      rsvpUpdatedAt: rsvp?.updatedAt.toISOString() ?? null,
    }));
  },

  create(data: GuestData): Promise<GuestRecord> {
    return write(() => prisma.guest.create({ data, select: recordSelect }));
  },

  update(id: string, data: GuestData): Promise<GuestRecord> {
    return write(() => prisma.guest.update({ where: { id }, data, select: recordSelect }));
  },

  async remove(id: string): Promise<void> {
    await prisma.guest.delete({ where: { id } });
  },
};

export type GuestWriter = Pick<typeof guestRepository, "create" | "update">;
```

- [ ] **Step 2: Create `lib/graduation/rsvp-repository.ts`**

```ts
import prisma from "@/lib/prisma";
import type { RsvpStatus } from "./types";

export const rsvpRepository = {
  /** Upserts the guest's answer and reports what it was before. */
  async save(guestId: string, status: RsvpStatus): Promise<{ previous: RsvpStatus | null }> {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.rsvp.findUnique({ where: { guestId }, select: { status: true } });
      await tx.rsvp.upsert({
        where: { guestId },
        create: { guestId, status },
        update: { status },
      });
      return { previous: existing?.status ?? null };
    });
  },
};
```

- [ ] **Step 3: Verify**

Run: `pnpm lint && pnpm build`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add lib/graduation/slug-taken-error.ts lib/graduation/guest-repository.ts lib/graduation/rsvp-repository.ts
git commit -m "feat(graduation): add guest and rsvp repositories"
```

---

### Task 7: Input schemas

**Files:**
- Create: `lib/graduation/guest-schema.ts`, `lib/graduation/rsvp-schema.ts`, `lib/graduation/schemas.test.ts`

**Interfaces:**
- Consumes: `SLUG_PATTERN`, `SLUG_MAX_LENGTH` (Task 1)
- Produces:
  - `guestInputSchema`, output `{ name: string; slug?: string; note: string | null }`
  - `type GuestInput = z.output<typeof guestInputSchema>`
  - `rsvpInputSchema`, output `{ slug: string; status: RsvpStatus }`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { guestInputSchema } from "./guest-schema";
import { rsvpInputSchema } from "./rsvp-schema";

describe("guestInputSchema", () => {
  it("trims, treats blank slug as undefined and blank note as null", () => {
    expect(guestInputSchema.parse({ name: "  Minh Anh ", slug: " ", note: "" })).toEqual({
      name: "Minh Anh",
      slug: undefined,
      note: null,
    });
  });
  it("rejects empty name, bad slug, oversize note", () => {
    expect(guestInputSchema.safeParse({ name: " ", slug: "", note: "" }).success).toBe(false);
    expect(guestInputSchema.safeParse({ name: "A", slug: "Bad Slug", note: "" }).success).toBe(false);
    expect(guestInputSchema.safeParse({ name: "A", slug: "", note: "x".repeat(501) }).success).toBe(false);
  });
});

describe("rsvpInputSchema", () => {
  it("accepts yes/no with a valid slug", () => {
    expect(rsvpInputSchema.parse({ slug: "minh-anh", status: "no" })).toEqual({
      slug: "minh-anh",
      status: "no",
    });
  });
  it("rejects other statuses and invalid slugs", () => {
    expect(rsvpInputSchema.safeParse({ slug: "minh-anh", status: "maybe" }).success).toBe(false);
    expect(rsvpInputSchema.safeParse({ slug: "Minh Anh", status: "yes" }).success).toBe(false);
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm test lib/graduation/schemas.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement both schemas**

`lib/graduation/guest-schema.ts`:

```ts
import { z } from "zod";
import { SLUG_MAX_LENGTH, SLUG_PATTERN } from "./slug";

const blankToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

export const guestInputSchema = z.object({
  name: z.string().trim().min(1, "Nhập tên khách").max(80, "Tối đa 80 ký tự"),
  slug: z.preprocess(
    blankToUndefined,
    z
      .string()
      .trim()
      .max(SLUG_MAX_LENGTH, `Tối đa ${SLUG_MAX_LENGTH} ký tự`)
      .regex(SLUG_PATTERN, "Chỉ dùng a-z, 0-9 và dấu gạch")
      .optional(),
  ),
  note: z
    .string()
    .trim()
    .max(500, "Tối đa 500 ký tự")
    .transform((v) => (v === "" ? null : v)),
});

export type GuestInput = z.output<typeof guestInputSchema>;
```

`lib/graduation/rsvp-schema.ts`:

```ts
import { z } from "zod";
import { SLUG_MAX_LENGTH, SLUG_PATTERN } from "./slug";

export const rsvpInputSchema = z.object({
  slug: z.string().max(SLUG_MAX_LENGTH).regex(SLUG_PATTERN),
  status: z.enum(["yes", "no"]),
});
```

- [ ] **Step 4: Run the test**

Run: `pnpm test lib/graduation/schemas.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/graduation/guest-schema.ts lib/graduation/rsvp-schema.ts lib/graduation/schemas.test.ts
git commit -m "feat(graduation): add guest and rsvp input schemas"
```

---

### Task 8: Guest service

**Files:**
- Create: `lib/graduation/guest-service.ts`, `lib/graduation/guest-service.test.ts`

**Interfaces:**
- Consumes: `guestInputSchema` (Task 7), `toSlug` (Task 1), `SlugTakenError` from `./slug-taken-error` and the *type* `GuestWriter` (Task 6). The service never imports `@/lib/prisma`.
- Produces:
  - `type GuestField = "name" | "slug" | "note"`
  - `type SaveGuestResult = { ok: true } | { ok: false; fieldErrors: Partial<Record<GuestField, string>> }`
  - `saveGuest(repo: GuestWriter, raw: Record<string, unknown>, id?: string): Promise<SaveGuestResult>`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it, vi } from "vitest";
import { saveGuest } from "./guest-service";
import { SlugTakenError } from "./slug-taken-error";
import type { GuestData, GuestRecord } from "./types";

function fakeRepo(overrides: Partial<{ fail: Error }> = {}) {
  const record = (data: GuestData): GuestRecord => ({ id: "g1", ...data });
  return {
    create: vi.fn(async (data: GuestData) => {
      if (overrides.fail) throw overrides.fail;
      return record(data);
    }),
    update: vi.fn(async (_id: string, data: GuestData) => {
      if (overrides.fail) throw overrides.fail;
      return record(data);
    }),
  };
}

describe("saveGuest", () => {
  it("derives the slug from the name when blank", async () => {
    const repo = fakeRepo();
    await expect(saveGuest(repo, { name: "Nguyễn Minh Anh", slug: "", note: "" })).resolves.toEqual({ ok: true });
    expect(repo.create).toHaveBeenCalledWith({ name: "Nguyễn Minh Anh", slug: "nguyen-minh-anh", note: null });
  });

  it("uses update when an id is given", async () => {
    const repo = fakeRepo();
    await saveGuest(repo, { name: "A", slug: "a", note: "hi" }, "g1");
    expect(repo.update).toHaveBeenCalledWith("g1", { name: "A", slug: "a", note: "hi" });
  });

  it("returns a slug error when the name has no slug-able characters", async () => {
    const repo = fakeRepo();
    const result = await saveGuest(repo, { name: "🎓 !!!", slug: "", note: "" });
    expect(result).toEqual({ ok: false, fieldErrors: { slug: "Không tạo được slug từ tên, hãy nhập tay" } });
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("maps SlugTakenError to a slug field error", async () => {
    const result = await saveGuest(fakeRepo({ fail: new SlugTakenError() }), { name: "A", slug: "a", note: "" });
    expect(result).toEqual({ ok: false, fieldErrors: { slug: "Slug đã tồn tại" } });
  });

  it("returns schema field errors", async () => {
    const result = await saveGuest(fakeRepo(), { name: "", slug: "Bad", note: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.fieldErrors).sort()).toEqual(["name", "slug"]);
  });

  it("rethrows unknown repository errors", async () => {
    await expect(saveGuest(fakeRepo({ fail: new Error("db down") }), { name: "A", slug: "a", note: "" })).rejects.toThrow("db down");
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm test lib/graduation/guest-service.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `lib/graduation/guest-service.ts`**

```ts
import { guestInputSchema } from "./guest-schema";
import type { GuestWriter } from "./guest-repository";
import { toSlug } from "./slug";
import { SlugTakenError } from "./slug-taken-error";

export type GuestField = "name" | "slug" | "note";
export type SaveGuestResult =
  | { ok: true }
  | { ok: false; fieldErrors: Partial<Record<GuestField, string>> };

const fail = (fieldErrors: Partial<Record<GuestField, string>>): SaveGuestResult => ({
  ok: false,
  fieldErrors,
});

export async function saveGuest(
  repo: GuestWriter,
  raw: Record<string, unknown>,
  id?: string,
): Promise<SaveGuestResult> {
  const parsed = guestInputSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Partial<Record<GuestField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as GuestField;
      errors[field] ??= issue.message;
    }
    return fail(errors);
  }

  const { name, note } = parsed.data;
  const slug = parsed.data.slug ?? toSlug(name);
  if (!slug) return fail({ slug: "Không tạo được slug từ tên, hãy nhập tay" });

  try {
    if (id) await repo.update(id, { name, slug, note });
    else await repo.create({ name, slug, note });
    return { ok: true };
  } catch (error) {
    if (error instanceof SlugTakenError) return fail({ slug: "Slug đã tồn tại" });
    throw error;
  }
}
```

`import type` from `./guest-repository` is erased at compile time, so Prisma is not loaded in tests.

- [ ] **Step 4: Run the tests**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/graduation/guest-service.ts lib/graduation/guest-service.test.ts
git commit -m "feat(graduation): add guest save service"
```

---

### Task 9: RSVP email builder and RSVP service

**Files:**
- Create: `lib/graduation/rsvp-email.ts`, `lib/graduation/rsvp-service.ts`, `lib/graduation/rsvp-service.test.ts`

**Interfaces:**
- Consumes: `rsvpInputSchema` (Task 7), `EmailMessage`/`SendEmailResult` types (Task 4), types (Task 5)
- Produces:
  - `type RsvpNotice = { name: string; slug: string; status: RsvpStatus; previous: RsvpStatus | null; at: Date }`
  - `buildRsvpEmail(notice: RsvpNotice): EmailMessage`
  - `type RsvpDeps = { findGuest(slug: string): Promise<GuestRecord | null>; saveRsvp(guestId: string, status: RsvpStatus): Promise<{ previous: RsvpStatus | null }>; notify(message: EmailMessage): Promise<SendEmailResult>; now(): Date }`
  - `type SubmitRsvpResult = { ok: true; status: RsvpStatus } | { ok: false; error: "invalid" | "not_found" }`
  - `submitRsvp(raw: unknown, deps: RsvpDeps): Promise<SubmitRsvpResult>`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it, vi } from "vitest";
import { buildRsvpEmail } from "./rsvp-email";
import { submitRsvp, type RsvpDeps } from "./rsvp-service";

const AT = new Date("2026-11-20T03:04:00Z");

function deps(overrides: Partial<RsvpDeps> = {}): RsvpDeps {
  return {
    findGuest: vi.fn(async () => ({ id: "g1", slug: "minh-anh", name: "Minh Anh", note: null })),
    saveRsvp: vi.fn(async () => ({ previous: null })),
    notify: vi.fn(async () => ({ ok: true as const })),
    now: () => AT,
    ...overrides,
  };
}

describe("buildRsvpEmail", () => {
  it("describes a first answer", () => {
    const mail = buildRsvpEmail({ name: "Minh Anh", slug: "minh-anh", status: "yes", previous: null, at: AT });
    expect(mail.subject).toBe("RSVP: Minh Anh — Sẽ đến");
    expect(mail.text).toContain("minh-anh");
    expect(mail.text).toContain("20/11/2026");
    expect(mail.text).toContain("Lần đầu trả lời");
  });
  it("describes a change of answer", () => {
    const mail = buildRsvpEmail({ name: "A", slug: "a", status: "no", previous: "yes", at: AT });
    expect(mail.subject).toBe("RSVP: A — Không đến");
    expect(mail.text).toContain("Đổi từ: Sẽ đến");
  });
});

describe("submitRsvp", () => {
  it("saves, notifies and returns the status", async () => {
    const d = deps();
    await expect(submitRsvp({ slug: "minh-anh", status: "yes" }, d)).resolves.toEqual({ ok: true, status: "yes" });
    expect(d.saveRsvp).toHaveBeenCalledWith("g1", "yes");
    expect(d.notify).toHaveBeenCalledOnce();
  });

  it("rejects invalid input without touching deps", async () => {
    const d = deps();
    await expect(submitRsvp({ slug: "minh-anh", status: "maybe" }, d)).resolves.toEqual({ ok: false, error: "invalid" });
    expect(d.findGuest).not.toHaveBeenCalled();
  });

  it("returns not_found when the guest was deleted", async () => {
    const d = deps({ findGuest: vi.fn(async () => null) });
    await expect(submitRsvp({ slug: "minh-anh", status: "yes" }, d)).resolves.toEqual({ ok: false, error: "not_found" });
    expect(d.saveRsvp).not.toHaveBeenCalled();
  });

  it("still succeeds when the email is not configured or fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const notConfigured = deps({ notify: vi.fn(async () => ({ ok: false as const, reason: "not_configured" as const })) });
    await expect(submitRsvp({ slug: "minh-anh", status: "no" }, notConfigured)).resolves.toEqual({ ok: true, status: "no" });
    const throwing = deps({ notify: vi.fn(async () => { throw new Error("boom"); }) });
    await expect(submitRsvp({ slug: "minh-anh", status: "no" }, throwing)).resolves.toEqual({ ok: true, status: "no" });
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm test lib/graduation/rsvp-service.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `lib/graduation/rsvp-email.ts`**

```ts
import type { EmailMessage } from "@/lib/email/send-email";
import type { RsvpStatus } from "./types";

export type RsvpNotice = {
  name: string;
  slug: string;
  status: RsvpStatus;
  previous: RsvpStatus | null;
  at: Date;
};

const LABEL: Record<RsvpStatus, string> = { yes: "Sẽ đến", no: "Không đến" };

const formatAt = (at: Date) =>
  new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    dateStyle: "short",
    timeStyle: "short",
  }).format(at);

export function buildRsvpEmail({ name, slug, status, previous, at }: RsvpNotice): EmailMessage {
  const change = previous ? `Đổi từ: ${LABEL[previous]}` : "Lần đầu trả lời";
  return {
    subject: `RSVP: ${name} — ${LABEL[status]}`,
    text: [
      `Khách: ${name} (${slug})`,
      `Trả lời: ${LABEL[status]}`,
      change,
      `Lúc: ${formatAt(at)}`,
    ].join("\n"),
  };
}
```

- [ ] **Step 4: Implement `lib/graduation/rsvp-service.ts`**

```ts
import type { EmailMessage, SendEmailResult } from "@/lib/email/send-email";
import { buildRsvpEmail } from "./rsvp-email";
import { rsvpInputSchema } from "./rsvp-schema";
import type { GuestRecord, RsvpStatus } from "./types";

export type RsvpDeps = {
  findGuest(slug: string): Promise<GuestRecord | null>;
  saveRsvp(guestId: string, status: RsvpStatus): Promise<{ previous: RsvpStatus | null }>;
  notify(message: EmailMessage): Promise<SendEmailResult>;
  now(): Date;
};

export type SubmitRsvpResult =
  | { ok: true; status: RsvpStatus }
  | { ok: false; error: "invalid" | "not_found" };

export async function submitRsvp(raw: unknown, deps: RsvpDeps): Promise<SubmitRsvpResult> {
  const parsed = rsvpInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { slug, status } = parsed.data;

  const guest = await deps.findGuest(slug);
  if (!guest) return { ok: false, error: "not_found" };

  const { previous } = await deps.saveRsvp(guest.id, status);

  const message = buildRsvpEmail({ name: guest.name, slug, status, previous, at: deps.now() });
  try {
    const sent = await deps.notify(message);
    if (!sent.ok) console.error(`RSVP email not sent (${sent.reason}) for ${slug}`);
  } catch (error) {
    console.error("RSVP email failed:", error);
  }

  return { ok: true, status };
}
```

- [ ] **Step 5: Run the tests**

Run: `pnpm test`
Expected: PASS. If the date assertion fails because the ICU output differs, adjust the expected text to the actual `vi-VN` short format, which contains `20/11/2026`.

- [ ] **Step 6: Commit**

```bash
git add lib/graduation/rsvp-email.ts lib/graduation/rsvp-service.ts lib/graduation/rsvp-service.test.ts
git commit -m "feat(graduation): add RSVP service and owner email"
```

---

### Task 10: Admin guest server actions

**Files:**
- Create: `app/admin/guests/actions.ts`

**Interfaces:**
- Consumes: `requireAdmin` (Task 3), `guestRepository` (Task 6), `saveGuest` and `SaveGuestResult` (Task 8)
- Produces:
  - `type GuestFormState = SaveGuestResult | null`
  - `saveGuestAction(prev: GuestFormState, formData: FormData): Promise<GuestFormState>`, which reads `id`, `name`, `slug`, `note`
  - `deleteGuestAction(formData: FormData): Promise<void>`, which reads `id`

- [ ] **Step 1: Create the file**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth/session";
import { guestRepository } from "@/lib/graduation/guest-repository";
import { saveGuest, type SaveGuestResult } from "@/lib/graduation/guest-service";

export type GuestFormState = SaveGuestResult | null;

const field = (formData: FormData, key: string) => String(formData.get(key) ?? "");

export async function saveGuestAction(
  _prev: GuestFormState,
  formData: FormData,
): Promise<GuestFormState> {
  await requireAdmin();
  const id = field(formData, "id") || undefined;
  const result = await saveGuest(
    guestRepository,
    { name: field(formData, "name"), slug: field(formData, "slug"), note: field(formData, "note") },
    id,
  );
  if (result.ok) revalidatePath("/admin");
  return result;
}

export async function deleteGuestAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = field(formData, "id");
  if (!id) return;
  await guestRepository.remove(id);
  revalidatePath("/admin");
}
```

- [ ] **Step 2: Verify**

Run: `pnpm lint && pnpm build`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add app/admin/guests/actions.ts
git commit -m "feat(admin): add guest save/delete server actions"
```

---

### Task 11: Admin guest UI

**Files:**
- Create: `app/admin/guests/copy-link-button.tsx`, `guest-stats.tsx`, `guest-form.tsx`, `guest-row.tsx`, `guest-manager.tsx`, `guest-section.tsx` (all in `app/admin/guests/`)
- Modify: `app/admin/page.tsx`

**Interfaces:**
- Consumes: `saveGuestAction`, `deleteGuestAction`, `GuestFormState` (Task 10); `guestRepository.list` (Task 6); `GuestListItem` (Task 5); `SITE_URL` (Task 1)
- Produces:
  - `<GuestSection />` (async server component)
  - `<GuestManager guests={GuestListItem[]} />`
  - `<GuestForm guest?={GuestListItem} onDone?={() => void} />`
  - `<GuestRow guest={GuestListItem} />`
  - `<GuestStats guests={GuestListItem[]} />`
  - `<CopyLinkButton slug={string} />`

Style matches the existing admin page (zinc dark, Tailwind utilities).

- [ ] **Step 1: `copy-link-button.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { SITE_URL } from '@/lib/site';

export function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(`${SITE_URL}/graduation?to=${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button type="button" onClick={copy} className="text-xs text-sky-300 hover:text-sky-200">
      {copied ? 'Copied ✓' : 'Copy link'}
    </button>
  );
}
```

- [ ] **Step 2: `guest-stats.tsx`**

```tsx
import type { GuestListItem } from '@/lib/graduation/types';

export function GuestStats({ guests }: { guests: GuestListItem[] }) {
  const yes = guests.filter((g) => g.rsvpStatus === 'yes').length;
  const no = guests.filter((g) => g.rsvpStatus === 'no').length;
  const items = [
    ['Total', guests.length],
    ['Sẽ đến', yes],
    ['Không đến', no],
    ['Chưa trả lời', guests.length - yes - no],
  ] as const;
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(([label, value]) => (
        <div key={label} className="rounded border border-zinc-800 bg-zinc-900 p-3">
          <dt className="text-xs uppercase tracking-wide text-zinc-400">{label}</dt>
          <dd className="text-2xl font-semibold">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
```

- [ ] **Step 3: `guest-form.tsx` (shared by create and edit)**

```tsx
'use client';

import { useActionState, useEffect, useRef } from 'react';
import type { GuestListItem } from '@/lib/graduation/types';
import { saveGuestAction } from './actions';

const input = 'w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-sm outline-none focus:border-zinc-500';

export function GuestForm({ guest, onDone }: { guest?: GuestListItem; onDone?: () => void }) {
  const [state, action, pending] = useActionState(saveGuestAction, null);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state && !state.ok ? state.fieldErrors : {};

  useEffect(() => {
    if (!state?.ok) return;
    if (!guest) formRef.current?.reset();
    onDone?.();
  }, [state, guest, onDone]);

  return (
    <form ref={formRef} action={action} className="grid gap-2 sm:grid-cols-[1fr_1fr_2fr_auto] sm:items-start">
      {guest && <input type="hidden" name="id" value={guest.id} />}
      <label className="grid gap-1">
        <input name="name" placeholder="Tên hiển thị" defaultValue={guest?.name} className={input} required />
        {errors.name && <span className="text-xs text-red-300">{errors.name}</span>}
      </label>
      <label className="grid gap-1">
        <input name="slug" placeholder="slug (tự sinh nếu trống)" defaultValue={guest?.slug} className={input} />
        {errors.slug && <span className="text-xs text-red-300">{errors.slug}</span>}
      </label>
      <label className="grid gap-1">
        <textarea name="note" rows={1} placeholder="Ghi chú riêng (tuỳ chọn)" defaultValue={guest?.note ?? ''} className={input} />
        {errors.note && <span className="text-xs text-red-300">{errors.note}</span>}
      </label>
      <button type="submit" disabled={pending} className="rounded bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-50">
        {pending ? 'Saving…' : guest ? 'Save' : 'Add guest'}
      </button>
    </form>
  );
}
```

- [ ] **Step 4: `guest-row.tsx`**

```tsx
'use client';

import { useCallback, useState } from 'react';
import type { GuestListItem } from '@/lib/graduation/types';
import { deleteGuestAction } from './actions';
import { CopyLinkButton } from './copy-link-button';
import { GuestForm } from './guest-form';

const RSVP_LABEL = { yes: 'Sẽ đến', no: 'Không đến' } as const;

export function GuestRow({ guest }: { guest: GuestListItem }) {
  const [editing, setEditing] = useState(false);
  const stopEditing = useCallback(() => setEditing(false), []);

  if (editing) {
    return (
      <li className="rounded border border-zinc-700 p-3">
        <GuestForm guest={guest} onDone={stopEditing} />
        <button type="button" onClick={stopEditing} className="mt-2 text-xs text-zinc-400">Cancel</button>
      </li>
    );
  }

  return (
    <li className="grid gap-2 rounded border border-zinc-800 p-3 text-sm sm:grid-cols-[1fr_1fr_2fr_auto_auto] sm:items-center">
      <span className="font-medium">{guest.name}</span>
      <code className="text-zinc-400">{guest.slug}</code>
      <span className="truncate text-zinc-400" title={guest.note ?? ''}>{guest.note ?? '—'}</span>
      <span className="text-xs">
        {guest.rsvpStatus ? RSVP_LABEL[guest.rsvpStatus] : '—'}
        {guest.rsvpUpdatedAt && (
          <span className="block text-zinc-500">{new Date(guest.rsvpUpdatedAt).toLocaleString('vi-VN')}</span>
        )}
      </span>
      <span className="flex gap-3">
        <CopyLinkButton slug={guest.slug} />
        <button type="button" onClick={() => setEditing(true)} className="text-xs text-zinc-300">Edit</button>
        <form
          action={deleteGuestAction}
          onSubmit={(e) => { if (!confirm(`Xoá ${guest.name}?`)) e.preventDefault(); }}
        >
          <input type="hidden" name="id" value={guest.id} />
          <button type="submit" className="text-xs text-red-300">Delete</button>
        </form>
      </span>
    </li>
  );
}
```

- [ ] **Step 5: `guest-manager.tsx` and `guest-section.tsx`**

```tsx
// guest-manager.tsx
import type { GuestListItem } from '@/lib/graduation/types';
import { GuestForm } from './guest-form';
import { GuestRow } from './guest-row';
import { GuestStats } from './guest-stats';

export function GuestManager({ guests }: { guests: GuestListItem[] }) {
  return (
    <div className="flex flex-col gap-6">
      <GuestStats guests={guests} />
      <GuestForm />
      {guests.length === 0 ? (
        <p className="text-sm text-zinc-400">Chưa có khách nào.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {guests.map((g) => <GuestRow key={g.id} guest={g} />)}
        </ul>
      )}
    </div>
  );
}
```

```tsx
// guest-section.tsx
import { guestRepository } from '@/lib/graduation/guest-repository';
import { GuestManager } from './guest-manager';

export async function GuestSection() {
  const guests = await guestRepository.list();
  return (
    <section className="mt-12">
      <h2 className="mb-6 text-2xl font-bold">Graduation guests</h2>
      <GuestManager guests={guests} />
    </section>
  );
}
```

- [ ] **Step 6: Mount it in `app/admin/page.tsx`**

Add `import { GuestSection } from './guests/guest-section';` and render `<GuestSection />` right after `<VisitorList />`.

- [ ] **Step 7: Verify**

Run: `pnpm lint && pnpm build`, then `pnpm dev`.

Manual check in `/admin`:
1. Add "Nguyễn Minh Anh" with the slug blank. The row shows `nguyen-minh-anh`.
2. Add another guest with the same slug. Error "Slug đã tồn tại".
3. Edit the note. It updates.
4. Copy link. The clipboard holds `https://www.vinhvolequang.io.vn/graduation?to=nguyen-minh-anh`.
5. Delete. The row disappears.

- [ ] **Step 8: Commit**

```bash
git add app/admin/guests app/admin/page.tsx
git commit -m "feat(admin): add graduation guest manager"
```

---

## Phase B — Shared client building blocks

### Task 12: Event content, ICS and download helper

**Files:**
- Create: `lib/graduation/event.ts`, `lib/graduation/ics.ts`, `lib/graduation/ics.test.ts`, `lib/browser/download-text-file.ts`

**Interfaces:**
- Produces:
  - `type Moment = { n: string; year: string; vi: string; en: string; body: string; color: "tomato" | "blue" | "jade" | "canary"; rot: number }`
  - `GRADUATION_EVENT`, typed as `GraduationEvent`, fields listed in Step 1
  - `buildIcs(event: GraduationEvent, stamp: Date): string`
  - `downloadTextFile(filename: string, mime: string, content: string): void`

- [ ] **Step 1: Create `lib/graduation/event.ts`**

```ts
export type RisoColor = "tomato" | "blue" | "jade" | "canary";

export type Moment = {
  n: string;
  year: string;
  vi: string;
  en: string;
  body: string;
  color: RisoColor;
  rot: number;
};

export type GraduationEvent = {
  title: string;
  startUtc: string; // ISO
  endUtc: string;
  dateShort: string;
  dayVi: string;
  timeRange: string;
  railWhen: string;
  railWhenEn: string;
  venue: string;
  venueShort: string;
  address: string;
  addressShort: string;
  venueEn: string;
  mapsUrl: string;
  notes: string[];
  moments: Moment[];
  defaultNote: { vi: string; en: string };
  personalNoteEn: string;
  musicYoutubeId: string;
};

export const GRADUATION_EVENT: GraduationEvent = {
  title: "Lễ tốt nghiệp — Võ Lê Quang Vinh",
  startUtc: "2026-12-19T02:00:00Z",
  endUtc: "2026-12-19T04:30:00Z",
  dateShort: "19.12",
  dayVi: "Thứ Bảy · Saturday, 2026",
  timeRange: "09:00 — 11:30",
  railWhen: "09:00 · Thứ Bảy 19.12.2026",
  railWhenEn: "Sat · Dec 19",
  venue: "Hội trường A4, ĐH Bách Khoa",
  venueShort: "Hội trường A4 · ĐH Bách Khoa",
  address: "268 Lý Thường Kiệt, Phường 14, Quận 10, TP. Hồ Chí Minh",
  addressShort: "268 Lý Thường Kiệt · Q.10",
  venueEn: "Ho Chi Minh City University of Technology",
  mapsUrl: "https://maps.google.com/?q=268+Ly+Thuong+Kiet+Quan+10+Ho+Chi+Minh",
  notes: ["Trang phục · Smart casual", "Gửi xe · Cổng Lý Thường Kiệt", "Chụp ảnh sau lễ · Photos after"],
  moments: [
    { n: "01", year: "2022", vi: "Nhập học Bách Khoa", en: "Freshman at HCMUT", body: "Bước chân vào Khoa học Máy tính — ĐHQG-HCM, Trường ĐH Bách Khoa.", color: "tomato", rot: -1.6 },
    { n: "02", year: "2023", vi: "Những đêm deadline", en: "Late-night deadlines", body: "Bài lab, đồ án và những dòng code đầu tiên chạy được lúc hai giờ sáng.", color: "blue", rot: 1.4 },
    { n: "03", year: "2025", vi: "Thực tập đầu tiên", en: "First internship · TMA Solutions", body: "Viết React thật cho khách hàng thật, học cách làm việc trong một đội Agile.", color: "jade", rot: -1.2 },
    { n: "04", year: "2026", vi: "Đi làm & luận văn", en: "Work meets thesis", body: "Front-end Developer ban ngày, TrackNest ban đêm — và chặng cuối của tấm bằng.", color: "canary", rot: 1.8 },
  ],
  defaultNote: {
    vi: "Ở đâu đó trên hành trình ấy, mình đã gặp bạn. Cảm ơn vì đã là một phần của câu chuyện.",
    en: "Somewhere along the way, I met you — thank you for being part of the story.",
  },
  personalNoteEn: "A note just for you.",
  musicYoutubeId: "", // owner fills in the YouTube video ID
};
```

- [ ] **Step 2: Write the failing ICS test `lib/graduation/ics.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { GRADUATION_EVENT } from "./event";
import { buildIcs } from "./ics";

describe("buildIcs", () => {
  const ics = buildIcs(GRADUATION_EVENT, new Date("2026-11-08T00:00:00Z"));
  it("uses UTC start/end and stamp", () => {
    expect(ics).toContain("DTSTART:20261219T020000Z");
    expect(ics).toContain("DTEND:20261219T043000Z");
    expect(ics).toContain("DTSTAMP:20261108T000000Z");
  });
  it("escapes commas in LOCATION and uses CRLF", () => {
    expect(ics).toContain("LOCATION:Hội trường A4\\, ĐH Bách Khoa\\, 268 Lý Thường Kiệt\\, Phường 14\\, Quận 10\\, TP. Hồ Chí Minh");
    expect(ics.split("\r\n")[0]).toBe("BEGIN:VCALENDAR");
    expect(ics.endsWith("END:VCALENDAR")).toBe(true);
  });
});
```

- [ ] **Step 3: Run it and confirm it fails**

Run: `pnpm test lib/graduation/ics.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 4: Implement `lib/graduation/ics.ts`**

```ts
import type { GraduationEvent } from "./event";

const toIcsDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const escapeText = (s: string) => s.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");

export function buildIcs(event: GraduationEvent, stamp: Date): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//QV//Graduation//VI",
    "BEGIN:VEVENT",
    "UID:qv-graduation-2026@vinhvolequang.io.vn",
    `DTSTAMP:${toIcsDate(stamp)}`,
    `DTSTART:${toIcsDate(new Date(event.startUtc))}`,
    `DTEND:${toIcsDate(new Date(event.endUtc))}`,
    `SUMMARY:${escapeText(event.title)}`,
    `LOCATION:${escapeText(`${event.venue}, ${event.address}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
```

- [ ] **Step 5: Create `lib/browser/download-text-file.ts`**

```ts
/** Triggers a client-side download of in-memory text. Browser only. */
export function downloadTextFile(filename: string, mime: string, content: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: `${mime};charset=utf-8` }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 6: Run the tests and lint**

Run: `pnpm test && pnpm lint`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add lib/graduation/event.ts lib/graduation/ics.ts lib/graduation/ics.test.ts lib/browser/download-text-file.ts
git commit -m "feat(graduation): add event content and ICS builder"
```

---

### Task 13: Riso tokens and UI primitives

**Files:**
- Modify: `app/globals.css` (`:root` effect tokens + primitive classes)
- Create: `components/ui/riso/button.tsx`, `icon-button.tsx`, `theme-toggle.tsx`, `pill.tsx`

**Interfaces:**
- Produces:
  - `<RisoButton variant?: "primary"|"secondary"|"ink" size?: "lg"|"md"|"sm" icon?: ReactNode href?: string offsetColor?: RisoColor | "ink" ...button/anchor props>`
  - `<RisoIconButton size?: "lg"|"md"|"sm"|"xs" fill?: "paper"|RisoColor label: string ...button props>`
  - `<RisoThemeToggle dark: boolean onToggle: () => void>`
  - `<RisoPill color?: RisoColor|"paper"|"paper-2" tilt?: number pulse?: boolean size?: "md"|"sm">`

Hover and press states use CSS (`.riso-btn`) instead of React state, so they also work for keyboard focus.

- [ ] **Step 1: Add the tokens and classes to `app/globals.css`**

Inside the light `:root` block, after `--offset-jade`, add:

```css
  --offset-xs: 2px 2px 0 var(--ink);
  --stripes-tape: repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.28) 0 2px, transparent 2px 8px);
```

After the `.riso-press` rules, add:

```css
/* riso button: offset shadow driven by --off / --off-color */
.riso-btn {
  --off: 5px;
  --off-color: var(--ink);
  box-shadow: var(--off) var(--off) 0 var(--off-color);
  transition:
    transform var(--dur-fast) var(--ease),
    box-shadow var(--dur-fast) var(--ease);
}
.riso-btn:hover,
.riso-btn:focus-visible {
  transform: translate(-2px, -2px);
  box-shadow: calc(var(--off) + 2px) calc(var(--off) + 2px) 0 var(--off-color);
}
.riso-btn:active {
  transform: translate(1px, 1px);
  box-shadow: 2px 2px 0 var(--off-color);
}
.riso-btn:disabled {
  opacity: 0.6;
  pointer-events: none;
}
.riso-focus:focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: 3px;
}
```

- [ ] **Step 2: `components/ui/riso/button.tsx`**

```tsx
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import type { RisoColor } from "@/lib/graduation/event";

type Variant = "primary" | "secondary" | "ink";
type Size = "lg" | "md" | "sm";

const VARIANT: Record<Variant, string> = {
  primary: "bg-tomato text-paper",
  secondary: "bg-paper text-ink",
  ink: "bg-ink text-paper",
};
const SIZE: Record<Size, { cls: string; off: number }> = {
  lg: { cls: "gap-2.5 px-7 py-3.5 text-[15px]", off: 5 },
  md: { cls: "gap-2 px-5 py-2.5 text-[13px]", off: 4 },
  sm: { cls: "gap-2 px-[18px] py-2 text-[13px]", off: 3 },
};

type Common = { variant?: Variant; size?: Size; icon?: ReactNode; offsetColor?: RisoColor | "ink"; children: ReactNode };
type AsButton = Common & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AsLink = Common & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function RisoButton(props: AsButton | AsLink) {
  const { variant = "primary", size = "lg", icon, offsetColor, children, className = "", style, ...rest } = props;
  const s = SIZE[size];
  const oc = offsetColor ?? (variant === "secondary" ? "blue" : "ink");
  const cls = `riso-btn riso-focus inline-flex items-center rounded-full border-[1.5px] border-ink font-sans font-semibold leading-[1.2] no-underline ${VARIANT[variant]} ${s.cls} ${className}`;
  const vars = { "--off": `${s.off}px`, "--off-color": `var(--${oc})`, ...style } as CSSProperties;
  const content = (
    <>
      {children}
      {icon ? <span aria-hidden>{icon}</span> : null}
    </>
  );
  if (rest.href !== undefined) {
    return <a {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)} className={cls} style={vars}>{content}</a>;
  }
  return <button type="button" {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)} className={cls} style={vars}>{content}</button>;
}
```

- [ ] **Step 3: `components/ui/riso/icon-button.tsx`**

```tsx
import type { ButtonHTMLAttributes } from "react";
import type { RisoColor } from "@/lib/graduation/event";

const SIZE = { lg: 44, md: 36, sm: 32, xs: 24 } as const;

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: keyof typeof SIZE;
  fill?: "paper" | RisoColor;
  label: string;
};

export function RisoIconButton({ size = "md", fill = "paper", label, className = "", style, children, ...rest }: Props) {
  const d = SIZE[size];
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...rest}
      className={`riso-focus grid flex-none cursor-pointer place-items-center rounded-full border-[1.5px] border-ink p-0 font-heading font-bold leading-none transition-transform duration-(--dur-fast) hover:-translate-y-0.5 ${className}`}
      style={{
        width: d,
        height: d,
        fontSize: d >= 36 ? 14 : 11,
        background: `var(--${fill})`,
        color: fill === "paper" ? "var(--ink)" : "var(--paper)",
        boxShadow: "var(--offset-xs)",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 4: `components/ui/riso/theme-toggle.tsx`**

```tsx
export function RisoThemeToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="riso-focus relative h-9 w-16 cursor-pointer overflow-hidden rounded-full border-[1.5px] border-ink bg-paper-2 p-0"
      style={{ boxShadow: "var(--offset-xs)" }}
    >
      <span
        aria-hidden
        className="absolute top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full border-[1.5px] border-ink text-[10px] text-ink"
        style={{
          left: dark ? 34 : 4,
          background: dark ? "var(--blue)" : "var(--canary)",
          transition: "left 300ms var(--ease), background 300ms var(--ease)",
        }}
      >
        {dark ? "☾" : "☀"}
      </span>
    </button>
  );
}
```

- [ ] **Step 5: `components/ui/riso/pill.tsx`**

```tsx
import type { ReactNode } from "react";
import type { RisoColor } from "@/lib/graduation/event";

type PillColor = RisoColor | "paper" | "paper-2";

export function RisoPill({
  color = "jade",
  tilt = 0,
  pulse = false,
  size = "md",
  children,
}: { color?: PillColor; tilt?: number; pulse?: boolean; size?: "md" | "sm"; children: ReactNode }) {
  const light = color === "canary" || color === "paper" || color === "paper-2";
  const sizeCls =
    size === "sm"
      ? "px-2.5 py-0.5 font-mono text-[10px] tracking-[0.18em]"
      : "px-4 py-1.5 font-sans text-[12px] font-semibold tracking-[0.16em]";
  return (
    <span
      role="status"
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border-[1.5px] border-ink uppercase leading-[1.4] ${sizeCls}`}
      style={{
        background: `var(--${color})`,
        color: light ? "var(--ink)" : "var(--paper)",
        boxShadow: size === "sm" ? "2px 2px 0 var(--ink)" : "var(--offset-sm)",
        transform: tilt ? `rotate(${tilt}deg)` : undefined,
      }}
    >
      {pulse && (
        <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: light ? "var(--ink)" : "var(--paper)", animation: "pulse-dot 2.2s ease-in-out infinite" }} />
      )}
      {children}
    </span>
  );
}
```

- [ ] **Step 6: Verify**

Run: `pnpm lint && pnpm build`
Expected: success.

- [ ] **Step 7: Commit**

```bash
git add app/globals.css components/ui/riso
git commit -m "feat(ui): port riso Button, IconButton, ThemeToggle, Pill primitives"
```

---

### Task 14: Lenis context, ScrollTrigger sync and small hooks

**Files:**
- Create: `components/providers/lenis-context.ts`, `lib/hooks/use-reduced-motion.ts`, `lib/hooks/use-transient-flag.ts`, `lib/hooks/use-is-dark.ts`
- Modify: `components/providers/smooth-scroll-provider.tsx`

**Interfaces:**
- Produces:
  - `LenisContext`, `useLenis(): Lenis | null`
  - `useReducedMotion(): boolean`
  - `useTransientFlag(ms: number): [boolean, () => void]`
  - `useIsDark(): { dark: boolean; toggle: () => void }`

- [ ] **Step 1: `components/providers/lenis-context.ts`**

```ts
"use client";

import { createContext, useContext } from "react";
import type Lenis from "lenis";

export const LenisContext = createContext<Lenis | null>(null);

export const useLenis = () => useContext(LenisContext);
```

- [ ] **Step 2: Update `smooth-scroll-provider.tsx`**

Keep the existing anchor logic. Changes:
- add the imports `useState`, `ScrollTrigger` from `"gsap/ScrollTrigger"`, `LenisContext`;
- create `const [lenis, setLenis] = useState<Lenis | null>(null);`;
- inside the effect, after `new Lenis(...)`, add:

```ts
    gsap.registerPlugin(ScrollTrigger);
    lenis.on("scroll", ScrollTrigger.update);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLenis(lenis);
```

- rename the local variable from `lenis` to `instance` inside the effect to avoid shadowing (`const instance = new Lenis(...)`, then `setLenis(instance)`). Update its uses (`instance.raf`, `instance.scrollTo`, `instance.destroy`, `instance.on`);
- in the cleanup, add `setLenis(null);` before `instance.destroy()`;
- return `<LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>`.

- [ ] **Step 3: `lib/hooks/use-reduced-motion.ts`**

```ts
"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}
```

- [ ] **Step 4: `lib/hooks/use-transient-flag.ts`**

```ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** A boolean that turns itself off `ms` after being triggered. */
export function useTransientFlag(ms: number): [boolean, () => void] {
  const [on, setOn] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const trigger = useCallback(() => {
    setOn(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOn(false), ms);
  }, [ms]);
  useEffect(() => () => clearTimeout(timer.current), []);
  return [on, trigger];
}
```

- [ ] **Step 5: `lib/hooks/use-is-dark.ts`**

```ts
"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const noop = () => () => {};

export function useIsDark(): { dark: boolean; toggle: () => void } {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const dark = mounted && resolvedTheme === "dark";
  return { dark, toggle: () => setTheme(dark ? "light" : "dark") };
}
```

- [ ] **Step 6: Verify**

Run: `pnpm lint && pnpm build`. Then on `pnpm dev`, check that the home page smooth scroll and anchor links still work.

- [ ] **Step 7: Commit**

```bash
git add components/providers lib/hooks/use-reduced-motion.ts lib/hooks/use-transient-flag.ts lib/hooks/use-is-dark.ts
git commit -m "feat(scroll): expose Lenis via context and sync ScrollTrigger"
```

---

### Task 15: Shared graduation presentational pieces

**Files:**
- Create in `components/graduation/shared/`: `section-kicker.tsx`, `section-heading.tsx`, `graduation-section.tsx`, `postmark.tsx`, `tape.tsx`, `riso-stripes.ts`

**Interfaces:**
- Produces:
  - `<SectionKicker centered?: boolean>{text}</SectionKicker>`
  - `<SectionHeading lead={string} accent={string} as?: "h1"|"h2" size?: "section"|"cover" />`
  - `<GraduationSection id tone: "paper"|"paper-2" align: "left"|"right" className?>`, a 7/5 or 5/7 grid with an empty spacer column (leaves room for the character)
  - `<Postmark color: RisoColor lines: string[] rotate: number className? style? />`
  - `<Tape color: RisoColor | string width height rotate className? style? />`
  - `airMailStripes(band: number): string`

- [ ] **Step 1: `section-kicker.tsx`**

```tsx
import type { ReactNode } from "react";

const Rule = ({ grow }: { grow?: boolean }) => (
  <span aria-hidden className={`h-px bg-ink/20 ${grow ? "max-w-40 flex-1" : "w-12"}`} />
);

export function SectionKicker({ children, centered = false }: { children: ReactNode; centered?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {centered && <Rule />}
      <span className="font-mono text-[11px] tracking-[0.28em] text-ink-2 uppercase">{children}</span>
      <Rule grow={!centered} />
    </div>
  );
}
```

- [ ] **Step 2: `section-heading.tsx`**

```tsx
const SIZE = {
  section: "clamp(2.2rem, 5.5vw, 4.5rem)",
  cover: "clamp(2rem, 4.2vw, 3.4rem)",
} as const;

export function SectionHeading({
  lead,
  accent,
  as: Tag = "h2",
  size = "section",
}: { lead: string; accent: string; as?: "h1" | "h2"; size?: keyof typeof SIZE }) {
  return (
    <Tag
      className="m-0 font-heading font-bold leading-[0.95] tracking-[-0.035em] text-ink"
      style={{ fontSize: SIZE[size], fontVariationSettings: '"wdth" 90, "opsz" 96' }}
    >
      {lead}{" "}
      <span className="italic text-tomato" style={{ fontVariationSettings: '"wdth" 82' }}>
        {accent}
      </span>
    </Tag>
  );
}
```

- [ ] **Step 3: `graduation-section.tsx`**

```tsx
import type { ReactNode } from "react";

export function GraduationSection({
  id,
  tone,
  align,
  className = "",
  children,
}: { id: string; tone: "paper" | "paper-2"; align: "left" | "right"; className?: string; children: ReactNode }) {
  const cols = align === "left" ? "min-[760px]:grid-cols-[7fr_5fr]" : "min-[760px]:grid-cols-[5fr_7fr]";
  return (
    <section
      id={id}
      className={`relative border-t-[1.5px] border-ink px-6 py-[clamp(80px,10vw,140px)] min-[760px]:px-[clamp(72px,8vw,128px)] ${className}`}
      style={{ background: `var(--${tone})` }}
    >
      <div className={`mx-auto grid max-w-6xl grid-cols-1 gap-12 ${cols}`}>
        {align === "right" && <div aria-hidden className="hidden min-[760px]:block" />}
        <div className="flex min-w-0 flex-col gap-10">{children}</div>
        {align === "left" && <div aria-hidden className="hidden min-[760px]:block" />}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: `postmark.tsx`, `tape.tsx`, `riso-stripes.ts`**

```tsx
// postmark.tsx: round rubber stamp (HCMUT postmark, "Admit One Guest")
import type { CSSProperties } from "react";
import type { RisoColor } from "@/lib/graduation/event";

export function Postmark({
  color,
  lines,
  rotate,
  className = "",
  style,
}: { color: RisoColor; lines: string[]; rotate: number; className?: string; style?: CSSProperties }) {
  return (
    <div
      aria-hidden
      className={`absolute grid h-[92px] w-[92px] place-items-center rounded-full border-[1.5px] text-center ${className}`}
      style={{ borderColor: `var(--${color})`, transform: `rotate(${rotate}deg)`, ...style }}
    >
      <span className="font-mono text-[9px] leading-normal tracking-[0.18em] uppercase" style={{ color: `var(--${color})` }}>
        {lines.map((l, i) => (
          <span key={i} className="block">{l}</span>
        ))}
      </span>
    </div>
  );
}
```

```tsx
// tape.tsx: washi-tape strip
import type { CSSProperties } from "react";

export function Tape({
  color,
  width,
  height,
  rotate,
  className = "",
  style,
}: { color: string; width: number; height: number; rotate: number; className?: string; style?: CSSProperties }) {
  return (
    <span
      aria-hidden
      className={`absolute left-1/2 ${className}`}
      style={{
        width,
        height,
        marginLeft: -width / 2,
        transform: `rotate(${rotate}deg)`,
        background: `color-mix(in oklab, var(--${color}) 75%, transparent)`,
        backgroundImage: "var(--stripes-tape)",
        ...style,
      }}
    />
  );
}
```

```ts
// riso-stripes.ts: tomato/blue air-mail border used by the envelope front and pocket band
export const airMailStripes = (band: number) =>
  `repeating-linear-gradient(-45deg, var(--tomato) 0 ${band}px, var(--paper) ${band}px ${band * 2}px, var(--blue) ${band * 2}px ${band * 3}px, var(--paper) ${band * 3}px ${band * 4}px)`;
```

- [ ] **Step 5: Verify**

Run: `pnpm lint`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add components/graduation/shared
git commit -m "feat(graduation): add shared section, stamp and tape pieces"
```

---

## Phase C — Page sections

### Task 16: "How we met" section

**Files:**
- Create in `components/graduation/met/`: `moment-card.tsx`, `personal-note-card.tsx`, `met-section.tsx`

**Interfaces:**
- Consumes: `GraduationSection`, `SectionKicker`, `SectionHeading`, `Tape` (Task 15); `Moment`, `GRADUATION_EVENT` (Task 12); `useScrollReveal` (existing)
- Produces: `<MetSection guestName={string} note={string | null} />`

- [ ] **Step 1: `moment-card.tsx`**

```tsx
import type { Moment } from "@/lib/graduation/event";
import { Tape } from "../shared/tape";

export function MomentCard({ moment: m }: { moment: Moment }) {
  return (
    <article
      className="relative flex flex-col gap-2.5 rounded-[14px] border-[1.5px] border-ink bg-paper px-[22px] pt-[26px] pb-[22px]"
      style={{ boxShadow: `5px 5px 0 var(--${m.color})`, transform: `rotate(${m.rot}deg)` }}
    >
      <Tape color={m.color} width={84} height={22} rotate={-4} className="-top-3" />
      <span className="font-mono text-[11px] tracking-[0.24em] uppercase" style={{ color: `var(--${m.color})` }}>
        {m.year} · {m.n}
      </span>
      <h3 className="m-0 font-heading text-2xl leading-[1.05] font-bold tracking-[-0.025em]" style={{ fontVariationSettings: '"wdth" 90, "opsz" 96' }}>
        {m.vi}
      </h3>
      <span className="text-[13px] text-ink-3 italic">{m.en}</span>
      <p className="m-0 text-[15px] leading-[1.6] text-pretty text-ink-2">{m.body}</p>
    </article>
  );
}
```

- [ ] **Step 2: `personal-note-card.tsx`**

```tsx
export function PersonalNoteCard({ guestName, vi, en }: { guestName: string; vi: string; en: string }) {
  return (
    <div className="relative flex flex-col gap-3 rounded-[14px] border-[1.5px] border-ink bg-paper px-[26px] py-7" style={{ boxShadow: "6px 6px 0 var(--canary)" }}>
      <span className="font-mono text-[11px] tracking-[0.24em] text-ink-3 uppercase">Và bạn · And you, {guestName}</span>
      <p className="m-0 font-heading text-[clamp(20px,2.2vw,28px)] leading-[1.2] font-semibold tracking-[-0.02em] text-pretty">
        <span className="px-1" style={{ background: "linear-gradient(transparent 55%, var(--canary) 55%)" }}>{vi}</span>
      </p>
      <span className="text-sm text-ink-3 italic">{en}</span>
    </div>
  );
}
```

- [ ] **Step 3: `met-section.tsx`**

```tsx
"use client";

import { GRADUATION_EVENT } from "@/lib/graduation/event";
import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";
import { GraduationSection } from "../shared/graduation-section";
import { SectionHeading } from "../shared/section-heading";
import { SectionKicker } from "../shared/section-kicker";
import { MomentCard } from "./moment-card";
import { PersonalNoteCard } from "./personal-note-card";

export function MetSection({ guestName, note }: { guestName: string; note: string | null }) {
  const headRef = useScrollReveal<HTMLDivElement>();
  const gridRef = useScrollReveal<HTMLDivElement>(true);
  const noteRef = useScrollReveal<HTMLDivElement>();
  const { moments, defaultNote, personalNoteEn } = GRADUATION_EVENT;

  return (
    <GraduationSection id="met" tone="paper-2" align="left">
      <div ref={headRef} className="flex flex-col gap-5">
        <SectionKicker>03 · Chúng ta gặp nhau · How we met</SectionKicker>
        <SectionHeading lead="Bốn năm," accent="một hành trình." />
        <p className="m-0 max-w-[52ch] text-[17px] leading-[1.72] text-pretty text-ink-2">
          Index cards from the road — những mảnh ghim lại trên bảng, từ ngày đầu nhập học đến hôm nay.
        </p>
      </div>
      <div ref={gridRef} className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-x-7 gap-y-8">
        {moments.map((m) => <MomentCard key={m.n} moment={m} />)}
      </div>
      <div ref={noteRef}>
        <PersonalNoteCard guestName={guestName} vi={note ?? defaultNote.vi} en={note ? personalNoteEn : defaultNote.en} />
      </div>
    </GraduationSection>
  );
}
```

- [ ] **Step 4: Verify**

Run: `pnpm lint`
Expected: clean. The visual check happens in Task 26.

- [ ] **Step 5: Commit**

```bash
git add components/graduation/met
git commit -m "feat(graduation): add How-we-met section"
```

---

### Task 17: "How it ends" ticket section

**Files:**
- Create in `components/graduation/ends/`: `ticket-when.tsx`, `ticket-where.tsx`, `ticket-notes.tsx`, `ticket-card.tsx`, `ends-section.tsx`

**Interfaces:**
- Consumes: `RisoButton` (Task 13); `Postmark`, `GraduationSection`, `SectionKicker`, `SectionHeading` (Task 15); `GRADUATION_EVENT`, `buildIcs` (Task 12); `downloadTextFile` (Task 12); `useScrollReveal`
- Produces: `<EndsSection />`

- [ ] **Step 1: `ticket-when.tsx`**

```tsx
import { GRADUATION_EVENT as E } from "@/lib/graduation/event";

const label = "font-mono text-[10px] tracking-[0.22em] text-ink-3 uppercase";

export function TicketWhen() {
  return (
    <div className="flex flex-col gap-3.5 border-b-[1.5px] border-dashed border-ink px-7 py-8 min-[760px]:border-r-[1.5px] min-[760px]:border-b-0">
      <span className={label}>Thời gian · When</span>
      <span className="font-heading text-[clamp(56px,6vw,84px)] leading-[0.9] font-bold tracking-[-0.04em] text-tomato" style={{ fontVariationSettings: '"wdth" 80, "opsz" 96' }}>
        {E.dateShort}
      </span>
      <span className="font-heading text-lg font-semibold">{E.dayVi}</span>
      <span className="self-start rounded-full border-[1.5px] border-ink bg-canary px-2.5 py-1 font-mono text-xs tracking-[0.14em] text-ink">
        {E.timeRange}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: `ticket-where.tsx`**

```tsx
"use client";

import { RisoButton } from "@/components/ui/riso/button";
import { downloadTextFile } from "@/lib/browser/download-text-file";
import { GRADUATION_EVENT as E } from "@/lib/graduation/event";
import { buildIcs } from "@/lib/graduation/ics";

export function TicketWhere() {
  const addToCalendar = () =>
    downloadTextFile("tot-nghiep-quang-vinh.ics", "text/calendar", buildIcs(E, new Date()));

  return (
    <div className="flex flex-col gap-3.5 px-7 py-8">
      <span className="font-mono text-[10px] tracking-[0.22em] text-ink-3 uppercase">Địa điểm · Where</span>
      <span className="font-heading text-[clamp(26px,2.6vw,34px)] leading-[1.02] font-bold tracking-[-0.03em]" style={{ fontVariationSettings: '"wdth" 88, "opsz" 96' }}>
        {E.venue}
      </span>
      <span className="text-[15px] leading-[1.6] text-ink-2">
        {E.address}
        <br />
        <span className="text-ink-3 italic">{E.venueEn}</span>
      </span>
      <div className="mt-1.5 flex flex-wrap gap-3">
        <RisoButton variant="primary" size="md" href={E.mapsUrl} target="_blank" rel="noopener noreferrer" icon="↗">
          Chỉ đường
        </RisoButton>
        <RisoButton variant="secondary" size="md" onClick={addToCalendar} icon="↓">
          Thêm vào lịch
        </RisoButton>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: `ticket-notes.tsx` and `ticket-card.tsx`**

```tsx
// ticket-notes.tsx
import { GRADUATION_EVENT as E } from "@/lib/graduation/event";

export function TicketNotes() {
  return (
    <ul className="col-span-full m-0 flex list-none flex-wrap gap-x-7 gap-y-2 border-t-[1.5px] border-dashed border-ink px-7 py-4 font-mono text-[11px] tracking-[0.14em] text-ink-2 uppercase">
      {E.notes.map((n) => <li key={n}>{n}</li>)}
    </ul>
  );
}
```

```tsx
// ticket-card.tsx
import { Postmark } from "../shared/postmark";
import { TicketNotes } from "./ticket-notes";
import { TicketWhen } from "./ticket-when";
import { TicketWhere } from "./ticket-where";

export function TicketCard() {
  return (
    <div className="relative grid grid-cols-1 rounded-[14px] border-[1.5px] border-ink bg-paper min-[760px]:grid-cols-[4fr_6fr]" style={{ boxShadow: "var(--offset-lg)" }}>
      <Postmark color="jade" lines={["Admit", "· One ·", "Guest"]} rotate={12} className="-top-[26px] right-7 bg-paper" />
      <TicketWhen />
      <TicketWhere />
      <TicketNotes />
    </div>
  );
}
```

- [ ] **Step 4: `ends-section.tsx`**

```tsx
"use client";

import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";
import { GraduationSection } from "../shared/graduation-section";
import { SectionHeading } from "../shared/section-heading";
import { SectionKicker } from "../shared/section-kicker";
import { TicketCard } from "./ticket-card";

export function EndsSection() {
  const headRef = useScrollReveal<HTMLDivElement>();
  const cardRef = useScrollReveal<HTMLDivElement>();
  return (
    <GraduationSection id="ends" tone="paper" align="right">
      <div ref={headRef} className="flex flex-col gap-5">
        <SectionKicker>04 · Hồi kết · How it ends</SectionKicker>
        <SectionHeading lead="Và rồi," accent="tốt nghiệp." />
        <p className="m-0 max-w-[52ch] text-[17px] leading-[1.72] text-pretty text-ink-2">
          Chương này khép lại bằng một buổi lễ — and it would mean a lot to share it with you.
        </p>
      </div>
      <div ref={cardRef}>
        <TicketCard />
      </div>
    </GraduationSection>
  );
}
```

- [ ] **Step 5: Verify**

Run: `pnpm lint`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add components/graduation/ends
git commit -m "feat(graduation): add How-it-ends ticket section"
```

---

### Task 18: RSVP server action and RSVP section

**Files:**
- Create: `app/graduation/actions.ts`
- Create in `components/graduation/rsvp/`: `use-rsvp.ts`, `rsvp-choices.tsx`, `rsvp-result.tsx`, `rsvp-section.tsx`

**Interfaces:**
- Consumes: `submitRsvp`, `SubmitRsvpResult` (Task 9); `guestRepository.findBySlug` (Task 6); `rsvpRepository.save` (Task 6); `sendEmail` (Task 4); `RisoButton`, `RisoPill` (Task 13); Task 15 shared pieces
- Produces:
  - `submitRsvpAction(slug: string, status: RsvpStatus): Promise<SubmitRsvpResult>`
  - `useRsvp(slug, initial): { status, pending, error, choose(status), reset() }`
  - `<RsvpSection slug guestName initialRsvp />`

- [ ] **Step 1: `app/graduation/actions.ts`**

```ts
"use server";

import { sendEmail } from "@/lib/email/send-email";
import { guestRepository } from "@/lib/graduation/guest-repository";
import { rsvpRepository } from "@/lib/graduation/rsvp-repository";
import { submitRsvp, type SubmitRsvpResult } from "@/lib/graduation/rsvp-service";
import type { RsvpStatus } from "@/lib/graduation/types";

export async function submitRsvpAction(slug: string, status: RsvpStatus): Promise<SubmitRsvpResult> {
  return submitRsvp(
    { slug, status },
    {
      findGuest: guestRepository.findBySlug,
      saveRsvp: rsvpRepository.save,
      notify: (message) => sendEmail(message),
      now: () => new Date(),
    },
  );
}
```

- [ ] **Step 2: `use-rsvp.ts`**

```ts
"use client";

import { useState, useTransition } from "react";
import { submitRsvpAction } from "@/app/graduation/actions";
import type { RsvpStatus } from "@/lib/graduation/types";

export function useRsvp(slug: string, initial: RsvpStatus | null) {
  const [status, setStatus] = useState<RsvpStatus | null>(initial);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  const choose = (next: RsvpStatus) =>
    startTransition(async () => {
      setError(false);
      try {
        const result = await submitRsvpAction(slug, next);
        if (result.ok) setStatus(result.status);
        else setError(true);
      } catch {
        setError(true);
      }
    });

  const reset = () => {
    setError(false);
    setStatus(null);
  };

  return { status, pending, error, choose, reset };
}
```

- [ ] **Step 3: `rsvp-choices.tsx` and `rsvp-result.tsx`**

```tsx
// rsvp-choices.tsx
import { RisoButton } from "@/components/ui/riso/button";
import type { RsvpStatus } from "@/lib/graduation/types";

export function RsvpChoices({ pending, error, onChoose }: { pending: boolean; error: boolean; onChoose: (s: RsvpStatus) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3.5">
        <RisoButton variant="primary" size="lg" icon="✓" disabled={pending} onClick={() => onChoose("yes")}>Mình sẽ đến</RisoButton>
        <RisoButton variant="ink" size="lg" icon="✗" disabled={pending} onClick={() => onChoose("no")}>Tiếc quá, không kịp</RisoButton>
      </div>
      {error && (
        <p role="alert" className="m-0 font-mono text-[11px] tracking-[0.14em] text-tomato uppercase">
          Không gửi được, thử lại nhé · Couldn&apos;t send, try again
        </p>
      )}
    </div>
  );
}
```

```tsx
// rsvp-result.tsx
import { RisoPill } from "@/components/ui/riso/pill";
import type { RsvpStatus } from "@/lib/graduation/types";

const MESSAGE: Record<RsvpStatus, string> = {
  yes: "✓ Postmarked — hẹn gặp bạn ngày 19.12!",
  no: "✓ Đã nhận — cảm ơn bạn đã báo · Noted, thank you",
};

export function RsvpResult({ status, onReset }: { status: RsvpStatus; onReset: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3.5">
      <RisoPill color={status === "no" ? "tomato" : "jade"} tilt={-2}>{MESSAGE[status]}</RisoPill>
      <button type="button" onClick={onReset} className="riso-focus cursor-pointer border-0 bg-transparent p-0 font-mono text-[11px] tracking-[0.2em] text-ink-3 uppercase underline underline-offset-[5px] hover:text-tomato">
        Đổi ý · Change answer
      </button>
    </div>
  );
}
```

- [ ] **Step 4: `rsvp-section.tsx`**

```tsx
"use client";

import type { RsvpStatus } from "@/lib/graduation/types";
import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";
import { GraduationSection } from "../shared/graduation-section";
import { SectionHeading } from "../shared/section-heading";
import { SectionKicker } from "../shared/section-kicker";
import { RsvpChoices } from "./rsvp-choices";
import { RsvpResult } from "./rsvp-result";
import { useRsvp } from "./use-rsvp";

export function RsvpSection({ slug, guestName, initialRsvp }: { slug: string; guestName: string; initialRsvp: RsvpStatus | null }) {
  const ref = useScrollReveal<HTMLDivElement>();
  const { status, pending, error, choose, reset } = useRsvp(slug, initialRsvp);
  return (
    <GraduationSection id="rsvp" tone="paper-2" align="left" className="min-h-[78vh]">
      <div ref={ref} className="flex flex-col gap-7">
        <SectionKicker>05 · RSVP</SectionKicker>
        <SectionHeading lead="Bạn sẽ" accent="đến chứ?" />
        <p className="m-0 max-w-[46ch] text-[17px] leading-[1.72] text-pretty text-ink-2">
          Báo mình một tiếng để mình giữ chỗ nhé, {guestName}.{" "}
          <span className="text-ink-3 italic">Let me know so I can save you a seat.</span>
        </p>
        {status ? <RsvpResult status={status} onReset={reset} /> : <RsvpChoices pending={pending} error={error} onChoose={choose} />}
      </div>
    </GraduationSection>
  );
}
```

- [ ] **Step 5: Verify**

Run: `pnpm lint && pnpm build`
Expected: success.

- [ ] **Step 6: Commit**

```bash
git add app/graduation/actions.ts components/graduation/rsvp
git commit -m "feat(graduation): add RSVP action and section"
```

---

### Task 19: Envelope static pieces

**Files:**
- Create in `components/graduation/envelope/`: `envelope-front.tsx`, `invitation-card.tsx`, `envelope-pocket.tsx`, `envelope-flap.tsx`, `envelope-back.tsx`, `stage-kickers.tsx`, `scroll-hint.tsx`

**Interfaces:**
- Consumes: `airMailStripes`, `Postmark`, `Tape`, `SectionKicker`, `SectionHeading` (Task 15)
- Produces (the element ids are the contract with Task 20's timeline):
  - `<EnvelopeFront guestName />` → `#envFront`
  - `<InvitationCard guestName id?="card" className? style? />`
  - `<EnvelopePocket />` → `#pocket`
  - `<EnvelopeFlap />` → `#flap`
  - `<EnvelopeBack guestName />` → `#envBack` containing `#envBody`, `#card`, `#pocket`, `#flap`
  - `<StageKickers />` → `#coverKicker`, `#greetKicker`
  - `<ScrollHint />` → `#hint`

- [ ] **Step 1: `envelope-front.tsx`**

```tsx
import { Postmark } from "../shared/postmark";
import { airMailStripes } from "../shared/riso-stripes";

const mono = "font-mono uppercase";

export function EnvelopeFront({ guestName }: { guestName: string }) {
  return (
    <div id="envFront" className="absolute inset-0 box-border rounded-lg border-[1.5px] border-ink p-2.5 [backface-visibility:hidden]" style={{ boxShadow: "var(--offset-lg)", background: airMailStripes(16) }}>
      <div className="relative box-border flex h-full flex-col justify-between rounded border-[1.5px] border-ink bg-paper p-[clamp(16px,2.4vw,28px)]">
        <div className="flex flex-col gap-1.5">
          <span className={`${mono} text-[10px] tracking-[0.28em] text-blue`}>Air Mail · Par Avion</span>
          <span className={`${mono} text-[10px] tracking-[0.22em] text-ink-3`}>Thư mời · Invitation · Nº 2026</span>
        </div>
        <div aria-hidden className="absolute top-[clamp(14px,2vw,24px)] right-[clamp(14px,2vw,24px)] box-border flex h-[82px] w-[68px] flex-col items-center justify-center gap-0.5 border-[1.5px] border-ink bg-canary outline-[3px] outline-offset-[-7px] outline-paper outline-dotted" style={{ boxShadow: "var(--offset-sm)" }}>
          <span className="font-heading text-2xl leading-none font-bold text-ink">QV</span>
          <span className="font-mono text-[9px] tracking-[0.18em] text-ink">2026</span>
        </div>
        <Postmark color="tomato" lines={["HCMUT", "· 2026 ·", "TP.HCM"]} rotate={-14} className="top-[clamp(40px,5vw,56px)] right-[clamp(64px,8vw,92px)]" />
        <div className="flex max-w-[78%] flex-col gap-2">
          <span className={`${mono} text-[11px] tracking-[0.24em] text-ink-3`}>Gửi · To</span>
          <span className="border-b-[1.5px] border-dashed border-ink pb-2.5 font-heading text-[clamp(28px,4vw,48px)] leading-none font-bold tracking-[-0.035em] text-ink" style={{ fontVariationSettings: '"wdth" 86, "opsz" 96' }}>
            {guestName}
          </span>
          <span className={`${mono} text-[10px] tracking-[0.2em] text-ink-2`}>Trân trọng kính mời · Cordially invited</span>
        </div>
        <span className={`${mono} absolute right-[clamp(16px,2.4vw,28px)] bottom-[clamp(14px,2vw,24px)] text-[10px] tracking-[0.18em] text-ink-3`}>From: Võ Lê Quang Vinh</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: `invitation-card.tsx` (reused standalone under reduced motion)**

```tsx
import type { CSSProperties } from "react";

export function InvitationCard({ guestName, id, className = "", style }: { guestName: string; id?: string; className?: string; style?: CSSProperties }) {
  return (
    <div id={id} className={`box-border flex flex-col justify-between gap-2.5 overflow-hidden rounded-[14px] border-[1.5px] border-ink bg-paper px-[clamp(18px,2.8vw,34px)] py-[clamp(16px,2.4vw,28px)] ${className}`} style={{ boxShadow: "var(--offset-tomato)", ...style }}>
      <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.26em] uppercase">
        <span className="text-ink-3">Thiệp mời · Invitation</span>
        <span className="text-tomato">Fig · 01</span>
      </div>
      <h2 className="m-0 font-heading text-[clamp(22px,3vw,36px)] leading-[0.98] font-bold tracking-[-0.035em] text-balance" style={{ fontVariationSettings: '"wdth" 88, "opsz" 96' }}>
        Xin chào, <span className="italic text-tomato" style={{ fontVariationSettings: '"wdth" 82' }}>{guestName}.</span>
      </h2>
      <div className="flex flex-col gap-1.5">
        <p className="m-0 text-[clamp(11px,1.05vw,13.5px)] leading-[1.55] text-pretty text-ink-2">
          Mình là Quang Vinh. Sau bốn năm ở Bách Khoa, mình sắp khoác lên tấm áo cử nhân — và mình rất muốn có bạn ở đó.
        </p>
        <p className="m-0 text-[clamp(10px,0.95vw,12px)] leading-normal text-pretty text-ink-3 italic">
          After four years at HCMUT, I&apos;m finally graduating — and I&apos;d love for you to be there.
        </p>
      </div>
      <div className="flex items-end justify-between border-t border-dashed border-ink/25 pt-2">
        <span className="font-heading text-sm font-semibold text-ink">— Vinh (Tom)</span>
        <span className="font-mono text-[9px] tracking-[0.22em] text-ink-3 uppercase">Cuộn tiếp ↓ Keep scrolling</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: `envelope-pocket.tsx`**

```tsx
import { Tape } from "../shared/tape";
import { airMailStripes } from "../shared/riso-stripes";

const stroke = { stroke: "var(--ink)", strokeWidth: 1.5, vectorEffect: "non-scaling-stroke" as const, fill: "none" };

export function EnvelopePocket() {
  return (
    <div id="pocket" aria-hidden className="pointer-events-none absolute inset-0 z-[2] overflow-hidden rounded-lg">
      <div className="absolute inset-0 bg-paper-3 [clip-path:polygon(0_0,54%_56%,0_100%)]" />
      <div className="absolute inset-0 bg-paper-3 [clip-path:polygon(100%_0,46%_56%,100%_100%)]" />
      <div className="absolute inset-0 bg-paper-2 [clip-path:polygon(0_100%,50%_40%,100%_100%)]" />
      <svg viewBox="0 0 160 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <line x1="0" y1="0" x2="71.4" y2="46.5" {...stroke} />
        <line x1="160" y1="0" x2="88.6" y2="46.5" {...stroke} />
        <polyline points="0,100 80,40 160,100" {...stroke} />
      </svg>
      <div className="absolute inset-x-0 bottom-0 h-[7px] border-t-[1.5px] border-ink" style={{ background: airMailStripes(8) }} />
      <div className="absolute bottom-[13%] left-1/2 flex -translate-x-1/2 -rotate-2 flex-col items-center gap-[3px] rounded border-[1.5px] border-ink bg-paper px-3.5 py-2 whitespace-nowrap" style={{ boxShadow: "3px 3px 0 var(--blue)" }}>
        <Tape color="canary" width={54} height={14} rotate={3} className="-top-[9px]" style={{ background: "color-mix(in oklab, var(--canary) 80%, transparent)", backgroundImage: "var(--stripes-tape)" }} />
        <span className="font-mono text-[9px] tracking-[0.24em] text-ink-3 uppercase">Người gửi · Return to</span>
        <span className="font-heading text-[15px] font-bold tracking-[-0.02em] text-ink">Võ Lê Quang Vinh</span>
        <span className="font-mono text-[9px] tracking-[0.18em] text-ink-2 uppercase">K22 · Khoa học Máy tính · HCMUT</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: `envelope-flap.tsx`**

```tsx
const stroke = { stroke: "var(--ink)", strokeWidth: 1.5, vectorEffect: "non-scaling-stroke" as const, fill: "none" };
const face = "absolute inset-0 [backface-visibility:hidden]";

export function EnvelopeFlap() {
  return (
    <div id="flap" aria-hidden className="pointer-events-none absolute top-0 left-0 z-[3] h-[54%] w-full origin-top [transform-style:preserve-3d]">
      <div className={face}>
        <div className="absolute inset-0 bg-paper-2 [clip-path:polygon(0_0,100%_0,50%_100%)]" />
        <svg viewBox="0 0 160 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full"><polyline points="0,0 80,100 160,0" {...stroke} /></svg>
        <div className="absolute top-full left-1/2 -mt-[34px] -ml-8 grid h-16 w-16 -rotate-10 place-items-center rounded-full border-[1.5px] border-ink bg-tomato" style={{ boxShadow: "var(--offset-sm)" }}>
          <div className="grid h-12 w-12 place-items-center rounded-full border-[1.5px] border-dashed border-paper">
            <span className="font-heading text-lg font-bold text-paper">QV</span>
          </div>
        </div>
      </div>
      <div className={`${face} [transform:rotateX(180deg)]`}>
        <div className="absolute inset-0 bg-paper-2 [clip-path:polygon(0_100%,100%_100%,50%_0)]" style={{ backgroundImage: "repeating-linear-gradient(-45deg, color-mix(in oklab, var(--tomato) 70%, transparent) 0 5px, transparent 5px 14px)" }} />
        <svg viewBox="0 0 160 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full"><polyline points="0,100 80,0 160,100" {...stroke} /></svg>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: `envelope-back.tsx`, `stage-kickers.tsx`, `scroll-hint.tsx`**

```tsx
// envelope-back.tsx
import { EnvelopeFlap } from "./envelope-flap";
import { EnvelopePocket } from "./envelope-pocket";
import { InvitationCard } from "./invitation-card";

export function EnvelopeBack({ guestName }: { guestName: string }) {
  return (
    <div id="envBack" className="invisible absolute inset-0 [transform:rotateY(180deg)]">
      <div id="envBody" aria-hidden className="absolute inset-0 box-border rounded-lg border-[1.5px] border-ink bg-paper-2" style={{ boxShadow: "var(--offset-lg)", backgroundImage: "radial-gradient(color-mix(in oklab, var(--tomato) 55%, transparent) 1.3px, transparent 1.6px)", backgroundSize: "11px 11px" }} />
      <InvitationCard id="card" guestName={guestName} className="absolute top-[6%] left-[5%] z-[1] h-[88%] w-[90%]" />
      <EnvelopePocket />
      <EnvelopeFlap />
    </div>
  );
}
```

```tsx
// stage-kickers.tsx
import { SectionHeading } from "../shared/section-heading";
import { SectionKicker } from "../shared/section-kicker";

export function StageKickers({ greetingVisible = false }: { greetingVisible?: boolean }) {
  return (
    <div className="relative grid place-items-center text-center">
      <div id="coverKicker" className="flex flex-col items-center gap-3.5 [grid-area:1/1]" style={{ opacity: greetingVisible ? 0 : 1 }}>
        <SectionKicker centered>01 · Bạn được mời · You&apos;re invited</SectionKicker>
        <SectionHeading as="h1" size="cover" lead="Graduation" accent="day." />
      </div>
      <div id="greetKicker" className="[grid-area:1/1]" style={{ opacity: greetingVisible ? 1 : 0 }}>
        <SectionKicker centered>02 · Lời chào · Hello</SectionKicker>
      </div>
    </div>
  );
}
```

```tsx
// scroll-hint.tsx
export function ScrollHint() {
  return (
    <div id="hint" className="flex flex-col items-center gap-1.5">
      <span className="font-mono text-[11px] tracking-[0.24em] text-ink-2 uppercase">Cuộn để mở thư · Scroll to open</span>
      <span aria-hidden className="text-lg text-tomato" style={{ animation: "pulse-dot 1.6s var(--ease) infinite" }}>↓</span>
    </div>
  );
}
```

Under reduced motion `#greetKicker` must also be readable. With `greetingVisible` true the cover h1 is hidden visually but stays in the DOM, so the page keeps one `h1`.

- [ ] **Step 6: Verify**

Run: `pnpm lint`
Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add components/graduation/envelope
git commit -m "feat(graduation): add envelope front, back, card, pocket and flap"
```

---

### Task 20: Envelope timeline and stage

**Files:**
- Create: `components/graduation/envelope/use-envelope-timeline.ts`, `components/graduation/envelope/envelope-stage.tsx`

**Interfaces:**
- Consumes: Task 19 ids and components; `useReducedMotion` (Task 14)
- Produces: `useEnvelopeTimeline(rootRef: RefObject<HTMLElement | null>, enabled: boolean): void`, `<EnvelopeStage guestName />` (`section#stage`, 420vh, or 100vh under reduced motion)

- [ ] **Step 1: `use-envelope-timeline.ts` (positions copied verbatim from the design)**

```ts
"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, type RefObject } from "react";

export function useEnvelopeTimeline(rootRef: RefObject<HTMLElement | null>, enabled: boolean) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!enabled || !root) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.set("#card", { zIndex: 1 });
      gsap.set("#flap", { zIndex: 3, transformOrigin: "50% 0%", transformPerspective: 900 });
      gsap.set("#envFront", { visibility: "visible" });
      gsap.set("#envBack", { visibility: "hidden" });

      gsap
        .timeline({
          scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: 0.6 },
          defaults: { ease: "none" },
        })
        .to("#hint", { opacity: 0, y: -12, duration: 0.08 }, 0)
        .to("#envWrap", { rotationX: 0, rotationZ: 0, duration: 0.12, ease: "power1.out" }, 0)
        .fromTo("#envFlip", { rotationY: 0 }, { rotationY: 180, duration: 0.2, ease: "power2.inOut", immediateRender: false }, 0.1)
        .set("#envFront", { visibility: "hidden" }, 0.2)
        .set("#envBack", { visibility: "visible" }, 0.2)
        .fromTo("#flap", { rotationX: 0 }, { rotationX: 180, duration: 0.14, ease: "power2.inOut", immediateRender: false }, 0.32)
        .set("#flap", { zIndex: 0 }, 0.4)
        .fromTo("#card", { yPercent: 0 }, { yPercent: -74, duration: 0.18, ease: "power2.out", immediateRender: false }, 0.46)
        .set("#card", { zIndex: 4 }, 0.645)
        .fromTo(["#envBody", "#pocket", "#flap"], { yPercent: 0, opacity: 1 }, { yPercent: 150, opacity: 0, duration: 0.2, ease: "power2.in", immediateRender: false }, 0.65)
        .fromTo("#card", { yPercent: -74, scale: 1 }, { yPercent: 0, scale: 1.32, duration: 0.2, ease: "power2.inOut", immediateRender: false }, 0.65)
        .to("#coverKicker", { opacity: 0, y: -10, duration: 0.08 }, 0.3)
        .to("#greetKicker", { opacity: 1, duration: 0.08 }, 0.72)
        .to({}, { duration: 0.14 }, 0.86);
    }, root);

    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => ctx.revert();
  }, [rootRef, enabled]);
}
```

- [ ] **Step 2: `envelope-stage.tsx`**

```tsx
"use client";

import { useRef } from "react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { EnvelopeBack } from "./envelope-back";
import { EnvelopeFront } from "./envelope-front";
import { InvitationCard } from "./invitation-card";
import { ScrollHint } from "./scroll-hint";
import { StageKickers } from "./stage-kickers";
import { useEnvelopeTimeline } from "./use-envelope-timeline";

const ENVELOPE_SIZE = "relative aspect-[1.6/1] w-[min(560px,86vw)] min-[760px]:w-[min(560px,50vw)]";

const Glows = () => (
  <>
    <div aria-hidden className="pointer-events-none absolute -top-[120px] -left-[120px] h-[520px] w-[520px] rounded-full" style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--tomato) 18%, transparent), transparent)" }} />
    <div aria-hidden className="pointer-events-none absolute -right-[140px] -bottom-[160px] h-[600px] w-[600px] rounded-full" style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--blue) 14%, transparent), transparent)" }} />
  </>
);

export function EnvelopeStage({ guestName }: { guestName: string }) {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useEnvelopeTimeline(rootRef, !reduced);

  return (
    <section id="stage" ref={rootRef} className="relative bg-paper" style={{ height: reduced ? "100vh" : "420vh" }}>
      <div className="sticky top-0 box-border flex h-screen flex-col items-center justify-center gap-[clamp(20px,3.5vh,40px)] overflow-hidden px-6 pt-[88px] pb-8 [perspective:1600px] min-[760px]:px-[clamp(72px,8vw,128px)]">
        <Glows />
        <StageKickers greetingVisible={reduced} />
        {reduced ? (
          <div className={ENVELOPE_SIZE}>
            <InvitationCard guestName={guestName} className="absolute inset-0 h-full w-full" />
          </div>
        ) : (
          <>
            <div id="envWrap" className={`${ENVELOPE_SIZE} [transform-style:preserve-3d]`} style={{ transform: "rotateX(14deg) rotateZ(-3deg)" }}>
              <div id="envFlip" className="absolute inset-0 [transform-style:preserve-3d]">
                <EnvelopeFront guestName={guestName} />
                <EnvelopeBack guestName={guestName} />
              </div>
            </div>
            <ScrollHint />
          </>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify**

Run: `pnpm lint`
Expected: clean. The visual check is in Task 26.

- [ ] **Step 4: Commit**

```bash
git add components/graduation/envelope/use-envelope-timeline.ts components/graduation/envelope/envelope-stage.tsx
git commit -m "feat(graduation): add scroll-scrubbed envelope stage"
```

---

## Phase D — 3D character

### Task 21: Character beats (pure, tested)

**Files:**
- Create: `components/graduation/character/types.ts`, `components/graduation/character/beats.ts`, `components/graduation/character/beats.test.ts`

**Interfaces:**
- Produces:
  - `type Action = "wave" | "bow" | "sit" | "point" | "toss"`
  - `type Beat = { s: number; x: number; ry: number; act: Action }`
  - `type PoseTarget = Record<Action | "walk" | "dir", number> & { x: number; ry: number }`
  - `type SectionMetrics = { vh: number; stageTop: number; stageScroll: number; metTop: number; metHeight: number; endsTop: number; endsHeight: number; rsvpTop: number }`
  - `envelopeSideX(a: { viewportW: number; envelopeW: number; halfW: number; scale: number }): number`
  - `buildBeats(m: SectionMetrics, sx: number): Beat[]`
  - `targetPose(beats: Beat[], y: number): PoseTarget | null`

- [ ] **Step 1: `types.ts`**

```ts
export type Action = "wave" | "bow" | "sit" | "point" | "toss";
export const ACTIONS: readonly Action[] = ["wave", "bow", "sit", "point", "toss"];

export type Beat = { s: number; x: number; ry: number; act: Action };

export type PoseTarget = Record<Action | "walk" | "dir", number> & { x: number; ry: number };

export type SectionMetrics = {
  vh: number;
  stageTop: number;
  stageScroll: number;
  metTop: number;
  metHeight: number;
  endsTop: number;
  endsHeight: number;
  rsvpTop: number;
};
```

- [ ] **Step 2: Write the failing test `beats.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { buildBeats, envelopeSideX, targetPose } from "./beats";
import type { SectionMetrics } from "./types";

const M: SectionMetrics = { vh: 1000, stageTop: 0, stageScroll: 3200, metTop: 4200, metHeight: 1500, endsTop: 5700, endsHeight: 1200, rsvpTop: 6900 };

describe("buildBeats", () => {
  const beats = buildBeats(M, 0.8);
  it("creates nine strictly increasing beats ≥ 40px apart", () => {
    expect(beats).toHaveLength(9);
    beats.slice(1).forEach((b, i) => expect(b.s - beats[i].s).toBeGreaterThanOrEqual(40));
  });
  it("starts waving on the right, ends tossing", () => {
    expect(beats[0]).toMatchObject({ act: "wave", x: 0.8 });
    expect(beats.at(-1)).toMatchObject({ act: "toss", x: 0.62 });
  });
  it("forces spacing when sections are tiny", () => {
    const tiny = buildBeats({ ...M, metHeight: 0, endsHeight: 0 }, 0.5);
    tiny.slice(1).forEach((b, i) => expect(b.s).toBeGreaterThan(tiny[i].s));
  });
});

describe("targetPose", () => {
  const beats = buildBeats(M, 0.8);
  it("clamps before the first and after the last beat", () => {
    expect(targetPose(beats, -100)).toMatchObject({ wave: 1, x: 0.8, walk: 0 });
    expect(targetPose(beats, 99999)).toMatchObject({ toss: 1, x: 0.62 });
  });
  it("walks between beats on different sides", () => {
    const mid = (beats[1].s + beats[2].s) / 2;
    const pose = targetPose(beats, mid)!;
    expect(pose.walk).toBeGreaterThan(0.9);
    expect(pose.dir).toBe(-1);
    expect(pose.x).toBeCloseTo(0, 5);
  });
  it("holds a pose between two identical beats", () => {
    const pose = targetPose(beats, (beats[4].s + beats[5].s) / 2)!;
    expect(pose).toMatchObject({ sit: 1, walk: 0, x: 0.66 });
  });
  it("returns null with no beats", () => {
    expect(targetPose([], 0)).toBeNull();
  });
});

describe("envelopeSideX", () => {
  it("never exceeds 1", () => {
    expect(envelopeSideX({ viewportW: 400, envelopeW: 344, halfW: 2, scale: 0.6 })).toBeLessThanOrEqual(1);
  });
});
```

- [ ] **Step 3: Run it and confirm it fails**

Run: `pnpm test components/graduation/character`
Expected: FAIL, module not found.

- [ ] **Step 4: Implement `beats.ts` (ported from the design's `computeBeats` and `target`)**

```ts
import { ACTIONS, type Action, type Beat, type PoseTarget, type SectionMetrics } from "./types";

const MIN_GAP = 40;

/** Horizontal slot (−1..1) that keeps the character just outside the opened card. */
export function envelopeSideX({ viewportW, envelopeW, halfW, scale }: { viewportW: number; envelopeW: number; halfW: number; scale: number }): number {
  const envPx = (envelopeW * 1.32) / 2;
  const usable = Math.max(0.1, halfW - 1.3 * scale);
  return Math.min(1, ((envPx / (viewportW / 2)) * halfW + 0.7 * scale) / usable);
}

export function buildBeats(m: SectionMetrics, sx: number): Beat[] {
  const { vh, stageTop: s0, stageScroll: sl } = m;
  const raw: [number, number, number, Action][] = [
    [s0, sx, -0.5, "wave"],
    [s0 + sl * 0.3, sx, -0.5, "wave"],
    [s0 + sl * 0.6, -sx, 0.5, "bow"],
    [s0 + sl, -sx, 0.5, "bow"],
    [m.metTop - vh * 0.1, 0.66, -0.35, "sit"],
    [m.metTop + m.metHeight - vh * 0.9, 0.66, -0.35, "sit"],
    [m.endsTop - vh * 0.05, -0.66, 0.1, "point"],
    [m.endsTop + m.endsHeight - vh * 0.9, -0.66, 0.1, "point"],
    [m.rsvpTop - vh * 0.25, 0.62, 0, "toss"],
  ];
  let prev = -Infinity;
  return raw.map(([s, x, ry, act]) => {
    const at = Math.max(s, prev + MIN_GAP);
    prev = at;
    return { s: at, x, ry, act };
  });
}

const smooth = (v: number) => {
  const t = Math.min(1, Math.max(0, v));
  return t * t * (3 - 2 * t);
};

const rest = (): PoseTarget => {
  const pose = { walk: 0, dir: 0, x: 0, ry: 0 } as PoseTarget;
  for (const a of ACTIONS) pose[a] = 0;
  return pose;
};

const holding = (b: Beat): PoseTarget => ({ ...rest(), x: b.x, ry: b.ry, [b.act]: 1 });

export function targetPose(beats: Beat[], y: number): PoseTarget | null {
  if (beats.length === 0) return null;
  if (y <= beats[0].s) return holding(beats[0]);
  const last = beats[beats.length - 1];
  if (y >= last.s) return holding(last);

  let i = 0;
  while (y > beats[i + 1].s) i++;
  const a = beats[i];
  const b = beats[i + 1];
  if (a.act === b.act && a.x === b.x) return holding(a);

  const t = (y - a.s) / (b.s - a.s);
  const pose = rest();
  pose[a.act] += 1 - smooth(t / 0.25);
  pose[b.act] += smooth((t - 0.75) / 0.25);
  const move = smooth((t - 0.25) / 0.5);
  pose.x = a.x + (b.x - a.x) * move;
  pose.ry = a.ry + (b.ry - a.ry) * move;
  pose.walk = a.x !== b.x ? Math.sin(Math.PI * Math.min(1, Math.max(0, (t - 0.18) / 0.64))) : 0;
  pose.dir = Math.sign(b.x - a.x);
  return pose;
}
```

- [ ] **Step 5: Run the test**

Run: `pnpm test components/graduation/character`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/graduation/character/types.ts components/graduation/character/beats.ts components/graduation/character/beats.test.ts
git commit -m "feat(graduation): add character beat timeline math"
```

---

### Task 22: Character materials, mesh kit and rig

**Files:**
- Create in `components/graduation/character/`: `materials.ts`, `mesh-kit.ts`, `rig.ts`

**Interfaces:**
- Produces:
  - `type Materials` (keys: `gown stole tassel skin blush hair cap pants shoe b1 b2 b3 laptop paper screen outline shadow`)
  - `createMaterials(): Materials`
  - `applyPalette(m: Materials, readVar: (name: string) => string, dark: boolean): void`
  - `disposeMaterials(m: Materials): void`
  - `type MeshKit = { add(parent, geo, mat, pos?, rot?, line?): THREE.Mesh; group(parent, pos?): THREE.Group; down(rt, rb, h, s?): THREE.CylinderGeometry; up(rt, rb, h, s?): THREE.CylinderGeometry }`
  - `createMeshKit(outline: THREE.Material): MeshKit`
  - `type Rig = { root; hips; legs: { leg; knee }[]; skirt; spine; headG; capG; tassel; A: Arm; B: Arm; cardProp; books; laptop; shadow }`, where `Arm = { sh: Group; el: Group }`
  - `buildRig(scene: THREE.Scene, kit: MeshKit, m: Materials): Rig`

- [ ] **Step 1: `materials.ts`**

```ts
import * as THREE from "three";

const TOON_KEYS = ["gown", "stole", "tassel", "skin", "blush", "hair", "cap", "pants", "shoe", "b1", "b2", "b3", "laptop", "paper"] as const;
type ToonKey = (typeof TOON_KEYS)[number];

export type Materials = Record<ToonKey, THREE.MeshToonMaterial> & {
  screen: THREE.MeshBasicMaterial;
  outline: THREE.MeshBasicMaterial;
  shadow: THREE.MeshBasicMaterial;
  gradient: THREE.DataTexture;
};

const DEFAULTS: Record<ToonKey, string> = {
  gown: "#1240e5", stole: "#ef4e2b", tassel: "#f5c518", skin: "#e8b991", blush: "#ef4e2b",
  hair: "#1c1b1f", cap: "#1c1b1f", pants: "#4a4a52", shoe: "#1c1b1f",
  b1: "#ef4e2b", b2: "#f5c518", b3: "#0f8f65", laptop: "#7a7a83", paper: "#fbf8f2",
};

export function createMaterials(): Materials {
  const gradient = new THREE.DataTexture(new Uint8Array([110, 110, 110, 255, 190, 190, 190, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
  gradient.minFilter = gradient.magFilter = THREE.NearestFilter;
  gradient.needsUpdate = true;
  const toon = Object.fromEntries(
    TOON_KEYS.map((k) => [k, new THREE.MeshToonMaterial({ color: DEFAULTS[k], gradientMap: gradient })]),
  ) as Record<ToonKey, THREE.MeshToonMaterial>;
  return {
    ...toon,
    gradient,
    screen: new THREE.MeshBasicMaterial({ color: "#1240e5" }),
    outline: new THREE.MeshBasicMaterial({ color: "#1c1b1f", side: THREE.BackSide }),
    shadow: new THREE.MeshBasicMaterial({ color: "#1c1b1f", transparent: true, opacity: 0.16 }),
  };
}

/** Re-tints materials from the current CSS riso tokens. */
export function applyPalette(m: Materials, readVar: (name: string) => string, dark: boolean): void {
  const set = (mat: { color: THREE.Color }, value: string) => value && mat.color.set(value);
  set(m.gown, readVar("--blue"));
  set(m.stole, readVar("--tomato"));
  set(m.blush, readVar("--tomato"));
  set(m.tassel, readVar("--canary"));
  set(m.b1, readVar("--tomato"));
  set(m.b2, readVar("--canary"));
  set(m.b3, readVar("--jade"));
  set(m.screen, readVar("--blue"));
  set(m.outline, dark ? "#0a0907" : readVar("--ink"));
  set(m.shadow, readVar("--ink"));
}

export function disposeMaterials(m: Materials): void {
  Object.values(m).forEach((v) => v.dispose());
}
```

- [ ] **Step 2: `mesh-kit.ts`**

```ts
import * as THREE from "three";

type Vec3 = [number, number, number];

export type MeshKit = {
  add(parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, pos?: Vec3 | null, rot?: Vec3 | null, line?: number): THREE.Mesh;
  group(parent: THREE.Object3D, pos?: Vec3): THREE.Group;
  down(rt: number, rb: number, h: number, segments?: number): THREE.CylinderGeometry;
  up(rt: number, rb: number, h: number, segments?: number): THREE.CylinderGeometry;
};

/** Inflates a geometry along its normals for the inverted-hull outline. */
function outlineGeometry(geo: THREE.BufferGeometry, t: number): THREE.BufferGeometry {
  const o = geo.clone();
  const p = o.attributes.position;
  const n = o.attributes.normal;
  for (let i = 0; i < p.count; i++) {
    p.setXYZ(i, p.getX(i) + n.getX(i) * t, p.getY(i) + n.getY(i) * t, p.getZ(i) + n.getZ(i) * t);
  }
  return o;
}

export function createMeshKit(outline: THREE.Material): MeshKit {
  return {
    add(parent, geo, mat, pos, rot, line = 0.022) {
      const mesh = new THREE.Mesh(geo, mat);
      if (line) mesh.add(new THREE.Mesh(outlineGeometry(geo, line), outline));
      if (pos) mesh.position.set(...pos);
      if (rot) mesh.rotation.set(...rot);
      parent.add(mesh);
      return mesh;
    },
    group(parent, pos) {
      const g = new THREE.Group();
      if (pos) g.position.set(...pos);
      parent.add(g);
      return g;
    },
    down(rt, rb, h, s = 18) {
      const g = new THREE.CylinderGeometry(rt, rb, h, s);
      g.translate(0, -h / 2, 0);
      return g;
    },
    up(rt, rb, h, s = 20) {
      const g = new THREE.CylinderGeometry(rt, rb, h, s);
      g.translate(0, h / 2, 0);
      return g;
    },
  };
}
```

- [ ] **Step 3: `rig.ts` (geometry numbers copied verbatim from the design `initThree`)**

```ts
import * as THREE from "three";
import type { Materials } from "./materials";
import type { MeshKit } from "./mesh-kit";

export type Arm = { sh: THREE.Group; el: THREE.Group };
export type Rig = {
  root: THREE.Group; hips: THREE.Group; legs: { leg: THREE.Group; knee: THREE.Group }[];
  skirt: THREE.Mesh; spine: THREE.Group; headG: THREE.Group; capG: THREE.Group; tassel: THREE.Group;
  A: Arm; B: Arm; cardProp: THREE.Group; books: THREE.Group; laptop: THREE.Group; shadow: THREE.Mesh;
};

function buildHead(k: MeshKit, M: Materials, spine: THREE.Group) {
  const headG = k.group(spine, [0, 1.13, 0]);
  k.add(headG, new THREE.SphereGeometry(0.3, 28, 20), M.skin);
  k.add(headG, new THREE.SphereGeometry(0.318, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.52), M.hair, [0, 0.03, -0.025], [-0.28, 0, 0], 0.018);
  [0.105, -0.105].forEach((x) => {
    k.add(headG, new THREE.SphereGeometry(0.036, 12, 10), M.hair, [x, 0, 0.275], null, 0);
    k.add(headG, new THREE.SphereGeometry(0.05, 12, 10), M.blush, [x * 1.5, -0.09, 0.24], null, 0).scale.set(1, 0.6, 0.4);
  });
  k.add(headG, new THREE.TorusGeometry(0.06, 0.014, 6, 14, Math.PI), M.hair, [0, -0.09, 0.285], [0, 0, Math.PI], 0);
  const capG = k.group(headG, [0, 0.2, 0]);
  k.add(capG, new THREE.CylinderGeometry(0.29, 0.31, 0.16, 24), M.cap, [0, 0, 0]);
  k.add(capG, new THREE.BoxGeometry(0.84, 0.045, 0.84), M.cap, [0, 0.1, 0], [0.06, Math.PI / 4, 0], 0.018);
  k.add(capG, new THREE.SphereGeometry(0.04, 10, 8), M.tassel, [0, 0.135, 0], null, 0);
  const tassel = k.group(capG, [0.4, 0.12, 0.12]);
  k.add(tassel, k.down(0.013, 0.013, 0.3, 6), M.tassel, null, null, 0.008);
  k.add(tassel, k.down(0.025, 0.055, 0.12, 10), M.tassel, [0, -0.3, 0], null, 0.012);
  return { headG, capG, tassel };
}

function buildArm(k: MeshKit, M: Materials, spine: THREE.Group, side: 1 | -1): Arm {
  const sh = k.group(spine, [side * 0.37, 0.7, 0]);
  k.add(sh, k.down(0.1, 0.125, 0.42), M.gown);
  const el = k.group(sh, [0, -0.42, 0]);
  k.add(el, k.down(0.09, 0.14, 0.34), M.gown);
  k.add(el, new THREE.SphereGeometry(0.075, 14, 10), M.skin, [0, -0.41, 0]);
  return { sh, el };
}

function buildProps(k: MeshKit, M: Materials, root: THREE.Group, hips: THREE.Group, hand: THREE.Group) {
  const cardProp = k.group(hand, [0, -0.46, 0.08]);
  k.add(cardProp, new THREE.BoxGeometry(0.42, 0.28, 0.015), M.paper, [0, -0.06, 0.04], [0.2, 0, 0.1], 0.015);
  k.add(cardProp, new THREE.CircleGeometry(0.045, 14), M.stole, [0, -0.06, 0.06], [0.2, 0, 0], 0);
  const books = k.group(root, [0, 0, -0.05]);
  ([[0.86, M.b1, 0.05], [0.78, M.b2, -0.08], [0.82, M.b3, 0.12]] as const).forEach(([w, m, r], i) =>
    k.add(books, new THREE.BoxGeometry(w, 0.19, 0.58), m, [0, 0.095 + i * 0.19, 0], [0, r, 0], 0.018),
  );
  const laptop = k.group(hips, [0, 0.2, 0.58]);
  k.add(laptop, new THREE.BoxGeometry(0.62, 0.035, 0.42), M.laptop, null, null, 0.015);
  const lid = k.group(laptop, [0, 0.02, -0.2]);
  lid.rotation.x = -1.85;
  k.add(lid, new THREE.BoxGeometry(0.62, 0.03, 0.42), M.laptop, [0, 0, 0.21], null, 0.015);
  k.add(lid, new THREE.PlaneGeometry(0.54, 0.34), M.screen, [0, 0.017, 0.21], [-Math.PI / 2, 0, 0], 0);
  return { cardProp, books, laptop };
}

export function buildRig(scene: THREE.Scene, k: MeshKit, M: Materials): Rig {
  const root = k.group(scene);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.62, 32), M.shadow);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  root.add(shadow);

  const hips = k.group(root, [0, 1.0, 0]);
  const legs = [0.15, -0.15].map((x) => {
    const leg = k.group(hips, [x, 0, 0]);
    k.add(leg, k.down(0.1, 0.09, 0.5), M.pants);
    const knee = k.group(leg, [0, -0.5, 0]);
    k.add(knee, k.down(0.09, 0.08, 0.42), M.pants);
    k.add(knee, new THREE.BoxGeometry(0.2, 0.12, 0.32), M.shoe, [0, -0.46, 0.06]);
    return { leg, knee };
  });
  const skirt = k.add(hips, k.down(0.37, 0.52, 0.62, 22), M.gown, [0, 0.03, 0]);
  const spine = k.group(hips);
  k.add(spine, k.up(0.3, 0.38, 0.8), M.gown);
  k.add(spine, new THREE.BoxGeometry(0.1, 0.72, 0.04), M.stole, [0.13, 0.38, 0.335], [-0.1, 0, 0.06], 0.015);
  k.add(spine, new THREE.BoxGeometry(0.1, 0.72, 0.04), M.stole, [-0.13, 0.38, 0.335], [-0.1, 0, -0.06], 0.015);
  k.add(spine, k.up(0.11, 0.12, 0.18, 14), M.skin, [0, 0.78, 0]);

  const head = buildHead(k, M, spine);
  const A = buildArm(k, M, spine, 1);
  const B = buildArm(k, M, spine, -1);
  const props = buildProps(k, M, root, hips, B.el);
  return { root, hips, legs, skirt, spine, ...head, A, B, ...props, shadow };
}
```

- [ ] **Step 4: Verify**

Run: `pnpm lint && pnpm build`
Expected: success.

- [ ] **Step 5: Commit**

```bash
git add components/graduation/character/materials.ts components/graduation/character/mesh-kit.ts components/graduation/character/rig.ts
git commit -m "feat(graduation): add toon materials, mesh kit and character rig"
```

---

### Task 23: Character pose, orchestrator and hook

**Files:**
- Create in `components/graduation/character/`: `pose.ts`, `grad-character.ts`, `measure-sections.ts`, `use-grad-character.ts`

**Interfaces:**
- Consumes: Tasks 21 and 22, `useReducedMotion` (Task 14), `useIsDark` (Task 14)
- Produces:
  - `type PoseState = PoseTarget` (smoothed)
  - `applyPose(rig: Rig, S: PoseState, t: { time: number; phase: number }, view: { halfW: number; halfH: number; scale: number }): void`
  - `type GradCharacter = { frame(time: number, scrollY: number): void; resize(beats: Beat[] | null): void; applyPalette(dark: boolean): void; view(): { halfW: number; scale: number }; dispose(): void }`
  - `createGradCharacter(host: HTMLElement, opts: { scale: number }): GradCharacter`
  - `measureSections(): SectionMetrics | null`
  - `measureEnvelopeWidth(): number`
  - `useGradCharacter(hostRef: RefObject<HTMLDivElement | null>, opts?: { scale?: number }): void`

- [ ] **Step 1: `pose.ts` (math copied verbatim from the design `frame`)**

```ts
import type { Rig } from "./rig";
import type { PoseTarget } from "./types";

export type PoseState = PoseTarget;

const show = (g: { visible: boolean; scale: { setScalar(v: number): void } }, v: number) => {
  g.visible = v > 0.02;
  g.scale.setScalar(Math.max(0.001, v));
};

export function applyPose(
  R: Rig,
  S: PoseState,
  { time: T, phase }: { time: number; phase: number },
  view: { halfW: number; halfH: number; scale: number },
): void {
  const { wave, bow, sit, point, toss, walk } = S;
  const sw = Math.sin(phase) * 0.6 * walk;

  R.root.position.set(S.x * (view.halfW - 1.3 * view.scale), -view.halfH + 0.15, 0);
  R.root.scale.setScalar(view.scale);
  R.root.rotation.y = S.ry * (1 - walk) + S.dir * 1.35 * walk;
  R.hips.position.y = 1.0 - 0.4 * sit + Math.abs(Math.sin(phase)) * 0.05 * walk;

  R.legs[0].leg.rotation.x = -1.5 * sit + sw;
  R.legs[1].leg.rotation.x = -1.5 * sit - sw;
  R.legs[0].knee.rotation.x = 1.45 * sit + Math.max(0, Math.sin(phase)) * 0.7 * walk;
  R.legs[1].knee.rotation.x = 1.45 * sit + Math.max(0, -Math.sin(phase)) * 0.7 * walk;
  R.skirt.scale.y = 1 - 0.55 * sit;

  R.spine.rotation.x = bow * (0.5 + 0.12 * Math.sin(T * 1.6)) + 0.08 * sit + Math.sin(T * 1.8) * 0.015;
  R.headG.rotation.x = 0.28 * sit + 0.1 * bow - 0.12 * toss;
  R.headG.rotation.y = -R.root.rotation.y * 0.45 + Math.sin(T * 0.7) * 0.05;

  const lift = toss * (2.45 + 0.25 * Math.sin(T * 2.86));
  const type = Math.sin(T * 16) * 0.08 * sit;
  R.A.sh.rotation.z = 0.12 + wave * 2.5 + point * 1.45 + lift;
  R.A.sh.rotation.x = -0.5 * sit - sw * 0.9 - 0.15 * point;
  R.A.el.rotation.z = wave * (0.35 + Math.sin(T * 7) * 0.45) + 0.1 * point;
  R.A.el.rotation.x = -1.0 * sit + type;
  R.B.sh.rotation.z = -0.12 - lift + 0.05 * bow;
  R.B.sh.rotation.x = -0.7 * wave - 0.5 * sit - 0.35 * bow + sw * 0.9;
  R.B.el.rotation.x = -1.0 * wave - 1.0 * sit - 1.75 * bow - type;
  R.B.el.rotation.z = 0.25 * bow;

  const p = (T % 2.2) / 2.2;
  R.capG.position.y = 0.2 + toss * Math.max(0, Math.sin(Math.PI * p)) * 2.6;
  R.capG.rotation.y = toss * p * Math.PI * 4;
  R.capG.rotation.z = toss * Math.sin(p * Math.PI * 2) * 0.35;
  R.tassel.rotation.z = Math.sin(T * 2.2) * 0.12 + walk * Math.sin(phase * 2) * 0.3;

  show(R.cardProp, wave);
  show(R.books, sit);
  show(R.laptop, sit);
  R.shadow.scale.set(1 + 0.4 * sit, 1, 1);
}
```

- [ ] **Step 2: `grad-character.ts`**

```ts
import * as THREE from "three";
import { targetPose } from "./beats";
import { applyPalette, createMaterials, disposeMaterials } from "./materials";
import { createMeshKit } from "./mesh-kit";
import { applyPose, type PoseState } from "./pose";
import { buildRig } from "./rig";
import type { Beat } from "./types";

const FOV = 28;
const CAMERA_Z = 14;
const MOBILE_BREAKPOINT = 760;

export type GradCharacter = {
  frame(time: number, scrollY: number): void;
  resize(beats: Beat[] | null): void;
  applyPalette(dark: boolean): void;
  view(): { halfW: number; scale: number };
  dispose(): void;
};

export function createGradCharacter(host: HTMLElement, opts: { scale: number }): GradCharacter {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.set(0, 1.2, CAMERA_Z);
  camera.lookAt(0, 0, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9a9488, 0.85));
  const light = new THREE.DirectionalLight(0xffffff, 0.8);
  light.position.set(3, 5, 6);
  scene.add(light);

  const M = createMaterials();
  const rig = buildRig(scene, createMeshKit(M.outline), M);
  const S: PoseState = { x: 0.68, ry: -0.5, wave: 1, bow: 0, sit: 0, point: 0, toss: 0, walk: 0, dir: 0 };
  const view = { halfW: 1, halfH: 1, scale: opts.scale };
  let beats: Beat[] | null = null;
  let phase = 0;
  let last: number | null = null;

  return {
    frame(time, scrollY) {
      const dt = last == null ? 0.016 : Math.min(0.05, time - last);
      last = time;
      const target = beats && targetPose(beats, scrollY);
      if (target) {
        const k = 1 - Math.pow(0.002, dt);
        for (const key of Object.keys(target) as (keyof PoseState)[]) S[key] += (target[key] - S[key]) * k;
      }
      phase += dt * 9 * S.walk;
      applyPose(rig, S, { time, phase }, view);
      renderer.render(scene, camera);
    },
    resize(nextBeats) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      view.halfH = CAMERA_Z * Math.tan(((FOV / 2) * Math.PI) / 180);
      view.halfW = view.halfH * camera.aspect;
      view.scale = opts.scale * (w < MOBILE_BREAKPOINT ? 0.7 : 1);
      beats = nextBeats;
    },
    applyPalette(dark) {
      const styles = getComputedStyle(document.documentElement);
      applyPalette(M, (n) => styles.getPropertyValue(n).trim(), dark);
    },
    view: () => ({ halfW: view.halfW, scale: view.scale }),
    dispose() {
      scene.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
      disposeMaterials(M);
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
```

- [ ] **Step 3: `measure-sections.ts`**

```ts
import type { SectionMetrics } from "./types";

const top = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;

export function measureSections(): SectionMetrics | null {
  const get = (id: string) => document.getElementById(id);
  const stage = get("stage");
  const met = get("met");
  const ends = get("ends");
  const rsvp = get("rsvp");
  if (!stage || !met || !ends || !rsvp) return null;
  const vh = window.innerHeight;
  return {
    vh,
    stageTop: top(stage),
    stageScroll: stage.offsetHeight - vh,
    metTop: top(met),
    metHeight: met.offsetHeight,
    endsTop: top(ends),
    endsHeight: ends.offsetHeight,
    rsvpTop: top(rsvp),
  };
}

export function measureEnvelopeWidth(): number {
  return document.getElementById("envWrap")?.offsetWidth ?? Math.min(560, window.innerWidth * 0.5);
}
```

- [ ] **Step 4: `use-grad-character.ts`**

```ts
"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type RefObject } from "react";
import { useIsDark } from "@/lib/hooks/use-is-dark";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { buildBeats, envelopeSideX } from "./beats";
import { createGradCharacter, type GradCharacter } from "./grad-character";
import { measureEnvelopeWidth, measureSections } from "./measure-sections";

export function useGradCharacter(hostRef: RefObject<HTMLDivElement | null>, { scale = 0.85 } = {}) {
  const reduced = useReducedMotion();
  const { dark } = useIsDark();
  const charRef = useRef<GradCharacter | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (reduced || !host) return;
    gsap.registerPlugin(ScrollTrigger);
    const character = createGradCharacter(host, { scale });
    charRef.current = character;

    const relayout = () => {
      character.resize(null);
      const metrics = measureSections();
      const { halfW, scale: s } = character.view();
      const sx = envelopeSideX({ viewportW: window.innerWidth, envelopeW: measureEnvelopeWidth(), halfW, scale: s });
      character.resize(metrics && buildBeats(metrics, sx));
    };
    const tick = (time: number) => character.frame(time, window.scrollY);

    relayout();
    ScrollTrigger.addEventListener("refresh", relayout);
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      ScrollTrigger.removeEventListener("refresh", relayout);
      character.dispose();
      charRef.current = null;
    };
  }, [hostRef, reduced, scale]);

  useEffect(() => {
    const id = requestAnimationFrame(() => charRef.current?.applyPalette(dark));
    return () => cancelAnimationFrame(id);
  }, [dark, reduced]);
}
```

`ScrollTrigger` fires `refresh` on resize, after the fonts-ready refresh (Task 20) and on layout changes. That one event keeps the beats in sync.

- [ ] **Step 5: Verify**

Run: `pnpm lint && pnpm build && pnpm test`
Expected: success.

- [ ] **Step 6: Commit**

```bash
git add components/graduation/character/pose.ts components/graduation/character/grad-character.ts components/graduation/character/measure-sections.ts components/graduation/character/use-grad-character.ts
git commit -m "feat(graduation): add character pose, renderer and hook"
```

---

## Phase E — Music, chrome, composition

### Task 24: YouTube music

**Files:**
- Create: `lib/youtube/types.ts`, `lib/youtube/load-iframe-api.ts`, `components/graduation/music/use-youtube-player.ts`, `components/graduation/music/music-mini-player.tsx`, `components/graduation/music/music-toggle.tsx`

**Interfaces:**
- Consumes: `RisoIconButton` (Task 13)
- Produces:
  - `loadYouTubeIframeApi(): Promise<YTNamespace>`, a singleton that rejects on script error
  - `type MusicStatus = "idle" | "loading" | "playing" | "paused" | "error"`
  - `useYouTubePlayer(videoId: string, onError: () => void): { status: MusicStatus; open: boolean; mountRef: RefObject<HTMLDivElement | null>; toggle(): void; close(): void }`
  - `<MusicMiniPlayer open mountRef onClose />`
  - `<MusicToggle playing onClick />`

- [ ] **Step 1: `lib/youtube/types.ts`**

```ts
export type YTPlayer = {
  playVideo(): void;
  pauseVideo(): void;
  destroy(): void;
};

export type YTPlayerEvent = { target: YTPlayer; data: number };

export type YTPlayerOptions = {
  host?: string;
  videoId: string;
  width?: number | string;
  height?: number | string;
  playerVars?: Record<string, string | number>;
  events?: {
    onReady?: (e: YTPlayerEvent) => void;
    onStateChange?: (e: YTPlayerEvent) => void;
    onError?: (e: YTPlayerEvent) => void;
  };
};

export type YTNamespace = {
  Player: new (el: HTMLElement, opts: YTPlayerOptions) => YTPlayer;
  PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}
```

- [ ] **Step 2: `lib/youtube/load-iframe-api.ts`**

```ts
import type { YTNamespace } from "./types";

const SRC = "https://www.youtube.com/iframe_api";
let pending: Promise<YTNamespace> | null = null;

/** Loads the YouTube IFrame API once. Retries after a failure. */
export function loadYouTubeIframeApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (pending) return pending;

  pending = new Promise<YTNamespace>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT) resolve(window.YT);
    };
    const script = document.createElement("script");
    script.src = SRC;
    script.async = true;
    script.onerror = () => {
      pending = null;
      script.remove();
      reject(new Error("YouTube IFrame API failed to load"));
    };
    document.head.appendChild(script);
  });
  return pending;
}
```

- [ ] **Step 3: `use-youtube-player.ts`**

```ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadYouTubeIframeApi } from "@/lib/youtube/load-iframe-api";
import type { YTPlayer } from "@/lib/youtube/types";

export type MusicStatus = "idle" | "loading" | "playing" | "paused" | "error";

export function useYouTubePlayer(videoId: string, onError: () => void) {
  const [status, setStatus] = useState<MusicStatus>("idle");
  const [open, setOpen] = useState(false);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const onErrorRef = useRef(onError);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  const fail = useCallback(() => {
    setStatus("error");
    setOpen(false);
    onErrorRef.current();
  }, []);

  useEffect(() => {
    if (!open || playerRef.current || !mountRef.current) return;
    let cancelled = false;
    const mount = mountRef.current;
    loadYouTubeIframeApi()
      .then((YT) => {
        if (cancelled) return;
        playerRef.current = new YT.Player(mount, {
          host: "https://www.youtube-nocookie.com",
          videoId,
          width: 200,
          height: 200,
          playerVars: { autoplay: 1, loop: 1, playlist: videoId, controls: 0, playsinline: 1, modestbranding: 1, rel: 0 },
          events: {
            onReady: (e) => e.target.playVideo(),
            onStateChange: (e) => {
              if (e.data === YT.PlayerState.PLAYING) setStatus("playing");
              else if (e.data === YT.PlayerState.PAUSED) setStatus("paused");
            },
            onError: fail,
          },
        });
      })
      .catch(() => !cancelled && fail());
    return () => { cancelled = true; };
  }, [open, videoId, fail]);

  useEffect(() => () => playerRef.current?.destroy(), []);

  const toggle = useCallback(() => {
    if (!videoId) return fail();
    if (!playerRef.current) {
      setStatus("loading");
      setOpen(true);
      return;
    }
    setOpen(true);
    if (status === "playing") playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  }, [videoId, status, fail]);

  const close = useCallback(() => {
    playerRef.current?.pauseVideo();
    setOpen(false);
  }, []);

  return { status, open, mountRef, toggle, close };
}
```

- [ ] **Step 4: `music-mini-player.tsx` and `music-toggle.tsx`**

```tsx
// music-mini-player.tsx: stays mounted once opened so the iframe keeps playing; hidden via `hidden` when closed
import type { RefObject } from "react";

export function MusicMiniPlayer({ open, mountRef, onClose }: { open: boolean; mountRef: RefObject<HTMLDivElement | null>; onClose: () => void }) {
  return (
    <div
      hidden={!open}
      className="fixed bottom-4 left-4 z-50 rounded-[14px] border-[1.5px] border-ink bg-paper p-2"
      style={{ boxShadow: "var(--offset-md)" }}
    >
      <div className="mb-1.5 flex items-center justify-between gap-3 px-1">
        <span className="font-mono text-[10px] tracking-[0.2em] text-ink-2 uppercase">♪ Now playing</span>
        <button type="button" onClick={onClose} aria-label="Tắt nhạc · Close music" className="riso-focus cursor-pointer border-0 bg-transparent font-mono text-sm text-ink-2 hover:text-tomato">×</button>
      </div>
      <div className="h-[200px] w-[200px] overflow-hidden rounded-md border-[1.5px] border-ink">
        <div ref={mountRef} />
      </div>
    </div>
  );
}
```

```tsx
// music-toggle.tsx
import { RisoIconButton } from "@/components/ui/riso/icon-button";

export function MusicToggle({ playing, onClick }: { playing: boolean; onClick: () => void }) {
  return (
    <RisoIconButton size="md" fill={playing ? "canary" : "paper"} label="Nhạc nền · Music" aria-pressed={playing} onClick={onClick}>
      ♪
    </RisoIconButton>
  );
}
```

`hidden` on a closed panel hides the iframe without destroying it. The policy minimum only matters while it plays, and pausing happens on close.

- [ ] **Step 5: Verify**

Run: `pnpm lint && pnpm build`
Expected: success.

- [ ] **Step 6: Commit**

```bash
git add lib/youtube components/graduation/music
git commit -m "feat(graduation): add YouTube background music player"
```

---

### Task 25: Header, side rails and footer

**Files:**
- Create in `components/graduation/chrome/`: `use-scroll-progress.ts`, `side-rail.tsx`, `side-rails.tsx`, `invitation-header.tsx`, `invitation-footer.tsx`

**Interfaces:**
- Consumes: `RisoThemeToggle` (Task 13); `MusicToggle` (Task 24); `useIsDark`, `useReducedMotion` (Task 14); `GRADUATION_EVENT` (Task 12)
- Produces:
  - `useScrollProgress(ref: RefObject<HTMLElement | null>): void`, which scrubs `scaleY` 0→1 over the whole page
  - `<SideRail side: "left"|"right" label value sub progress?: boolean />`
  - `<SideRails />`
  - `<InvitationHeader musicPlaying musicNote onMusic />`
  - `<InvitationFooter />`

- [ ] **Step 1: `use-scroll-progress.ts`**

```ts
"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, type RefObject } from "react";

export function useScrollProgress(ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    const tween = gsap.to(el, { scaleY: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [ref]);
}
```

- [ ] **Step 2: `side-rail.tsx`**

```tsx
"use client";

import { useRef } from "react";
import { useScrollProgress } from "./use-scroll-progress";

const mono = "font-mono text-[clamp(8px,1.25vh,10px)] uppercase";

function ProgressBar() {
  const ref = useRef<HTMLSpanElement>(null);
  useScrollProgress(ref);
  return <span ref={ref} className="absolute inset-0 origin-bottom bg-tomato" style={{ transform: "scaleY(0)" }} />;
}

export function SideRail({ side, label, value, sub, progress = false }: { side: "left" | "right"; label: string; value: string; sub: string; progress?: boolean }) {
  return (
    <aside className={`pointer-events-none fixed top-16 bottom-0 z-20 hidden w-[clamp(56px,6vw,88px)] items-center justify-center min-[760px]:flex ${side === "left" ? "left-0" : "right-0"}`}>
      <div className={`flex items-center gap-[clamp(8px,1.8vh,18px)] whitespace-nowrap [writing-mode:vertical-rl] ${side === "left" ? "rotate-180" : ""}`}>
        <span className={`${mono} tracking-[0.24em] text-ink-3`}>{label}</span>
        <span className="relative h-[clamp(20px,5vh,56px)] w-[1.5px] overflow-hidden bg-ink/20">{progress && <ProgressBar />}</span>
        <span className="font-heading text-[clamp(13px,2.3vh,20px)] font-bold tracking-[-0.02em] text-ink" style={{ fontVariationSettings: '"wdth" 88, "opsz" 96' }}>{value}</span>
        <span className={`${mono} tracking-[0.18em] text-ink-2`}>{sub}</span>
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: `side-rails.tsx`, `invitation-footer.tsx`**

```tsx
// side-rails.tsx
import { GRADUATION_EVENT as E } from "@/lib/graduation/event";
import { SideRail } from "./side-rail";

export function SideRails() {
  return (
    <>
      <SideRail side="left" label="Thời gian · When" value={E.railWhen} sub={E.railWhenEn} progress />
      <SideRail side="right" label="Địa điểm · Where" value={E.venueShort} sub={E.addressShort} />
    </>
  );
}
```

```tsx
// invitation-footer.tsx
export function InvitationFooter() {
  return (
    <footer className="relative z-30 border-t-[1.5px] border-ink bg-ink px-6 py-8 text-paper min-[760px]:px-[clamp(72px,8vw,128px)]">
      <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 font-mono text-[11px] tracking-[0.18em] uppercase">
        <span>Võ Lê Quang Vinh</span>
        <span className="text-canary">Thanks for celebrating with me</span>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: `invitation-header.tsx`**

```tsx
"use client";

import Link from "next/link";
import { RisoThemeToggle } from "@/components/ui/riso/theme-toggle";
import { useIsDark } from "@/lib/hooks/use-is-dark";
import { MusicToggle } from "../music/music-toggle";

export function InvitationHeader({ musicPlaying, musicNote, onMusic }: { musicPlaying: boolean; musicNote: boolean; onMusic: () => void }) {
  const { dark, toggle } = useIsDark();
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b-[1.5px] border-ink bg-header-bg backdrop-blur-[14px] backdrop-saturate-[1.2]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <Link href="/" className="riso-focus font-mono text-[11px] tracking-[0.22em] text-ink-2 uppercase hover:text-tomato">← Portfolio</Link>
        <div className="flex items-center gap-3.5">
          <span className="hidden font-mono text-[11px] tracking-[0.28em] text-ink uppercase sm:inline">Graduation 2026</span>
          {musicNote && (
            <span role="status" className="font-mono text-[10px] tracking-[0.14em] text-tomato uppercase">
              Không phát được nhạc · Music unavailable
            </span>
          )}
          <MusicToggle playing={musicPlaying} onClick={onMusic} />
          <RisoThemeToggle dark={dark} onToggle={toggle} />
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 5: Verify**

Run: `pnpm lint`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add components/graduation/chrome
git commit -m "feat(graduation): add invitation header, side rails and footer"
```

---

### Task 26: Composition root, route, 404 and verification

**Files:**
- Create: `components/graduation/invitation.tsx`, `lib/graduation/get-invitation-guest.ts`, `app/graduation/not-found.tsx`
- Modify: `app/graduation/page.tsx` (full rewrite)
- Delete: `components/graduation/graduation-shell.tsx`

**Interfaces:**
- Consumes: everything above
- Produces:
  - `getInvitationGuest(slug: string): Promise<{ guest: InvitationGuest; rsvp: RsvpStatus | null } | null>` (React `cache`, shared by page and metadata)
  - `<GraduationInvitation guest={InvitationGuest} initialRsvp={RsvpStatus | null} />`

- [ ] **Step 1: `lib/graduation/get-invitation-guest.ts`**

```ts
import { cache } from "react";
import { guestRepository } from "./guest-repository";

/** One DB hit per request, shared by generateMetadata and the page. */
export const getInvitationGuest = cache((slug: string) => guestRepository.findInvitation(slug));
```

- [ ] **Step 2: `components/graduation/invitation.tsx`**

```tsx
"use client";

import { useRef } from "react";
import { GRADUATION_EVENT } from "@/lib/graduation/event";
import type { InvitationGuest, RsvpStatus } from "@/lib/graduation/types";
import { useTransientFlag } from "@/lib/hooks/use-transient-flag";
import { useGradCharacter } from "./character/use-grad-character";
import { InvitationFooter } from "./chrome/invitation-footer";
import { InvitationHeader } from "./chrome/invitation-header";
import { SideRails } from "./chrome/side-rails";
import { EndsSection } from "./ends/ends-section";
import { EnvelopeStage } from "./envelope/envelope-stage";
import { MetSection } from "./met/met-section";
import { MusicMiniPlayer } from "./music/music-mini-player";
import { useYouTubePlayer } from "./music/use-youtube-player";
import { RsvpSection } from "./rsvp/rsvp-section";

export function GraduationInvitation({ guest, initialRsvp }: { guest: InvitationGuest; initialRsvp: RsvpStatus | null }) {
  const canvasHost = useRef<HTMLDivElement>(null);
  useGradCharacter(canvasHost);
  const [musicNote, flashMusicNote] = useTransientFlag(2600);
  const music = useYouTubePlayer(GRADUATION_EVENT.musicYoutubeId, flashMusicNote);

  return (
    <div id="top" className="relative bg-paper font-sans text-ink">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[15]" style={{ backgroundImage: "radial-gradient(var(--halftone) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <div ref={canvasHost} aria-hidden className="pointer-events-none fixed inset-0 z-[25]" />

      <InvitationHeader musicPlaying={music.status === "playing"} musicNote={musicNote} onMusic={music.toggle} />
      <SideRails />

      <main>
        <EnvelopeStage guestName={guest.name} />
        <MetSection guestName={guest.name} note={guest.note} />
        <EndsSection />
        <RsvpSection slug={guest.slug} guestName={guest.name} initialRsvp={initialRsvp} />
      </main>

      <InvitationFooter />
      <MusicMiniPlayer open={music.open} mountRef={music.mountRef} onClose={music.close} />
    </div>
  );
}
```

- [ ] **Step 3: Rewrite `app/graduation/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GraduationInvitation } from "@/components/graduation/invitation";
import { getInvitationGuest } from "@/lib/graduation/get-invitation-guest";
import { parseGuestSlug } from "@/lib/graduation/slug";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ to?: string | string[] }> };

const BASE_TITLE = "Graduation Invitation – Võ Lê Quang Vinh";

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const slug = parseGuestSlug((await searchParams).to);
  const found = slug ? await getInvitationGuest(slug) : null;
  return {
    title: found ? `Thư mời tốt nghiệp · ${found.guest.name}` : BASE_TITLE,
    description: "You're invited to celebrate my graduation.",
    robots: { index: false, follow: false },
  };
}

export default async function GraduationPage({ searchParams }: Props) {
  const slug = parseGuestSlug((await searchParams).to);
  if (!slug) notFound();
  const found = await getInvitationGuest(slug);
  if (!found) notFound();
  return <GraduationInvitation guest={found.guest} initialRsvp={found.rsvp} />;
}
```

- [ ] **Step 4: `app/graduation/not-found.tsx`**

```tsx
import { RisoButton } from "@/components/ui/riso/button";
import { SectionHeading } from "@/components/graduation/shared/section-heading";
import { SectionKicker } from "@/components/graduation/shared/section-kicker";

export default function GraduationNotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-6 text-center text-ink">
      <div className="flex flex-col items-center gap-6">
        <SectionKicker centered>404 · Return to sender</SectionKicker>
        <SectionHeading as="h1" size="cover" lead="Thiệp này" accent="không tồn tại." />
        <p className="m-0 max-w-[40ch] text-ink-2">This invitation doesn&apos;t exist — kiểm tra lại đường link bạn nhận được nhé.</p>
        <RisoButton variant="secondary" size="md" href="/">← Portfolio</RisoButton>
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Delete the scaffold**

Run: `git rm components/graduation/graduation-shell.tsx`
Then: `grep -rn "graduation-shell" app components` should print nothing.

- [ ] **Step 6: Automated checks**

Run: `pnpm test && pnpm lint && pnpm build`
Expected: all pass.

- [ ] **Step 7: Manual verification (spec §11)**

With `pnpm dev`, a dev DB, and one guest created in `/admin` (e.g. "Nguyễn Minh Anh" with note "Cảm ơn vì những buổi cà phê code đêm"):

1. `/graduation`, `/graduation?to=khong-ton-tai` and `/graduation?to=a&to=b` all show the riso 404. `/graduation?to=%20Nguyen-Minh-Anh` and `/graduation?to=nguyen-minh-anh` render the name in the envelope "Gửi · To", the "Xin chào, …" card, "And you, …", and the RSVP copy. The tab title is `Thư mời tốt nghiệp · Nguyễn Minh Anh`.
2. Full scroll:
   - the envelope tilts flat, flips, the flap opens, the card rises, the envelope drops away and the card scales up;
   - the kicker switches to "02 · Lời chào";
   - the character waves (right) → walks → bows (left) → sits with laptop and books by "How we met" → points by the ticket → tosses the cap at RSVP;
   - the left rail bar fills.
3. The theme toggle switches the page palette and the character re-tints (gown blue, outline color).
4. RSVP "Mình sẽ đến" shows the jade pill, a DB `Rsvp` row has `yes`, and an email arrives. Reload still shows the pill. "Đổi ý" → "Tiếc quá" shows the tomato pill, the row is `no`, and a second email says "Đổi từ: Sẽ đến". Stop the DB or delete the guest in admin, then click: the inline error appears.
5. Music:
   - with `musicYoutubeId` empty, clicking ♪ shows "Không phát được nhạc" for about 2.6s;
   - set a real ID, then click ♪: the mini player (200×200) appears bottom-left and plays, and ♪ turns canary;
   - click ♪ again to pause, and × to pause and hide;
   - the Network tab shows no youtube request before the first click.
6. "Thêm vào lịch" downloads `tot-nghiep-quang-vinh.ics`, and importing it shows 09:00–11:30 on 19.12.2026 local time. "Chỉ đường" opens Google Maps in a new tab.
7. DevTools → Rendering → emulate `prefers-reduced-motion: reduce`, then reload: the stage is one screen with the open card and the "02 · Lời chào" kicker, there is no canvas, sections show without animation, and music still works.
8. A 375px viewport: rails hidden, envelope ~86vw, the ticket stacks, the character is smaller, no horizontal scroll.
9. Admin regression: an old `admin_auth=true` cookie is rejected on `/admin` and `/api/visitor`.

- [ ] **Step 8: Commit**

```bash
git add components/graduation lib/graduation/get-invitation-guest.ts app/graduation
git commit -m "feat(graduation): compose invitation page with guest validation and 404"
```
