# Admin chỉnh toàn bộ nội dung thiệp – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin sửa được mọi nội dung trên `/graduation/[guest_id]`, ảnh OG, ảnh thiệp PNG và file `.ics` qua trang Cài đặt chung (VI + EN), và custom từng khách cũng theo VI + EN.

**Architecture:** Mặc định nằm trong code (`lib/graduation/i18n/copy/*.ts`, `lib/graduation/event.ts`). Một bảng Prisma một dòng (`GraduationSettings`) lưu những trường admin đã sửa. Một danh sách trường (`lib/graduation/content/fields/`) điều khiển việc ghép copy, validate và form admin. Hàm thuần `resolveGraduationContent()` ghép theo thứ tự: custom khách theo ngôn ngữ → Cài đặt chung theo ngôn ngữ → mặc định; client và server cùng dùng hàm này.

**Tech Stack:** Next.js 16 (App Router, server actions), React 19, TypeScript, Prisma 7 (PostgreSQL), zod 4, vitest 5, Tailwind 4, lucide-react.

**Spec:** `docs/superpowers/specs/2026-11-13-graduation-admin-settings-design.md`

## Global Constraints

Mọi task đều phải tuân thủ các điểm dưới đây, kể cả khi task không nhắc lại.

- **SOLID, dùng lại tối đa.** Mỗi file một trách nhiệm. Trước khi viết hàm/component mới, tìm xem đã có chưa (`grep`) và dùng lại: `ImageUploader`, `isAdminSession`, `LoginForm`, `AdminNav`, `getInvitationGuest`, `getGraduationLang`, `readOwnerPhone`, `toSlug`, `buildIcs`, `calendarLinks`, `withMomentStyle`, `LANGS`.
- **Không comment lung tung.** Chỉ viết comment khi lý do không thể đọc ra từ code (ví dụ một ràng buộc bên ngoài). Không comment kiểu "// set value", không comment mô tả lại tên hàm, không để comment "Task N". Comment hiện có trong file đang sửa thì giữ nguyên, trừ khi nó sai sau thay đổi.
- **File nhỏ.** Không gom nhiều trách nhiệm vào một file. Một component/hook/hàm thuần chính cho mỗi file. File mới không vượt ~150 dòng (trừ file dữ liệu như `vi.ts`, `en.ts`).
- **Task nhỏ, mỗi task tự đứng được.** Cuối mỗi task: `npx tsc --noEmit -p .` không lỗi, các test liên quan pass, rồi commit.
- **Không thêm thư viện mới.**
- **Không suy đoán.** Bước nào ghi **"Kiểm tra trước"** thì phải chạy lệnh kiểm tra và đối chiếu; nếu kết quả khác điều plan mô tả thì **dừng lại và hỏi**, không tự chế cách khác.
- **Code tiếng Anh, chữ hiển thị trong admin tiếng Việt** (nhãn, thông báo lỗi), giống admin hiện tại.
- **Giao diện admin** theo phong cách hiện có: nền `zinc-950`, viền `zinc-800`, nhấn `sky-400/500`.
- **Test:** vitest, đặt trong `tests/` theo cây thư mục nguồn, import qua alias `@/`. Chạy một file: `npx vitest run <đường-dẫn-test>`.
- **Hai test đang fail sẵn** (`tests/components/graduation/character/choreography/beats.test.ts`, `target-pose.test.ts`) không thuộc phạm vi này. Không sửa, chỉ đảm bảo không có test fail mới.
- **Commit:** dạng `type(graduation): mô tả` (xem `git log`). Mỗi commit kết thúc bằng:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01JvSBxKetjoRWNxLi74rKVy
  ```
  Dùng `git commit -F - <<'EOF' … EOF` để giữ xuống dòng.
- **Môi trường:** Windows, có cả Bash (Git Bash) và PowerShell. Các lệnh trong plan viết cho Bash, chạy từ `D:\portfolio`.

## Quyết định chi tiết bổ sung so với spec

Những điểm spec chưa nói rõ, plan chốt như sau:

1. **Mọi trường copy đều được dùng mọi chỗ trống tĩnh** (`{owner}`, `{initials}`, `{date}`, `{year}`, `{weekday}`, `{weekdayShort}`, `{time}`). Chỉ chỗ trống "theo lời gọi" là riêng từng trường: `{name}`, `{n}` (số lời chúc), `{calendar}` (tên lịch). Như vậy danh sách trường không cần khai báo `vars` từng dòng.
2. **`{date}` theo ngôn ngữ:** VI `28.11`, EN `Nov 28`. Thêm `{weekdayShort}`: VI `T7`, EN `Sat`. `event.dateShort` (số to trên vé) luôn là `dd.MM`.
3. **Thêm `event.mapLinkUrl`** (link Google Maps cho mã QR trong ảnh PNG, đang viết cứng là `MAP_URL`).
4. **Ký hiệu chủ thiệp:** `owner.initials` (mặc định `QV`) thay chữ "QV" viết cứng. Dấu bưu điện dùng `marks.school` + `{year}` + `marks.city`.
5. **Lời nhắn riêng của khách:** cột `Guest.note` (tab "Cơ bản") vẫn giữ, được coi là bản VI của `met.defaultNote` khi custom VI của khách không có trường này.
6. **Lịch Apple theo khách:** link `.ics` thêm `?g=<guestId>` để file `.ics` dùng đúng ngày giờ riêng của khách.
7. **Ảnh dùng chung** (`coverImage`, `togetherPhoto`, `badgeLogo`) nằm trong tab "Phong bì & Thiệp" và "Met & Kỷ niệm" của trang Cài đặt.

## Review Focus

Năm tình huống dễ làm hỏng trang mà spec không nói rõ. Test tương ứng đã nằm trong task sở hữu.

1. **JSON settings trong DB hỏng một phần** (sai kiểu, key lạ, chỗ trống lạ): trang vẫn render, chỉ bỏ đúng phần hỏng. Test ở Task 15 (`sanitize-settings.test.ts`).
2. **Khách chỉ nhập giờ bắt đầu**, hoặc giờ kết thúc trước giờ bắt đầu: kết thúc tự thành bắt đầu + 2 giờ. Test ở Task 20 (`resolve-event.test.ts`).
3. **Admin gõ sai chỗ trống** (`{nam}`, `{Name}`): lưu bị chặn và báo đúng ô; nếu đã lỡ nằm trong DB thì bị bỏ khi đọc. Test ở Task 13 (`copy-entry-rules.test.ts`) và Task 15.
4. **Ô EN chỉ có khoảng trắng**, hoặc danh sách chỉ có dòng trống: coi như trống, dùng nội dung chung EN, không lấy VI. Test ở Task 10 (`apply-overrides.test.ts`) và Task 21 (`layer-texts.test.ts`).
5. **`customContent` cũ** có `dateShort`/`timeRange`, `met.note` và `Guest.note`: chuyển đúng, bỏ ngày giờ cũ, `met.note` thắng `Guest.note`. Test ở Task 16 (`legacy-guest-content.test.ts`) và Task 17 (`normalize-guest-content.test.ts`).

## Thứ tự và phụ thuộc

- Làm đúng thứ tự task. Mỗi task chỉ dùng những gì task trước đã tạo (xem mục **Interfaces** của từng task).
- Các test có giờ cụ thể (`16:30 — 18:30`, `093000Z`) giả định Task 1 đã xong. Nếu Task 1 bị hoãn thì dừng lại, không sửa kỳ vọng của test.
- Từ Task 23 trở đi cần DB dev đang chạy.

## Cấu trúc file

```
lib/graduation/content/
  is-record.ts            kiểm tra object thường
  vn-time.ts              tách giờ VN từ ISO, chuyển qua lại với <input type="datetime-local">
  event-vars.ts           {date, year, weekday, weekdayShort, time, dateShort} theo ngôn ngữ
  template.ts             điền chỗ trống, liệt kê chỗ trống
  paths.ts                getPath / setPath / leafKeys trên cây object
  list-format.ts          splitList / joinList cho trường danh sách
  overrides.ts            CopyOverrides, setOverride
  fields/
    types.ts              CopyField, CopySection, CallVar
    tokens.ts             STATIC_VARS, allowedTokens
    define.ts             defineFields(section, group)
    meta.ts header.ts gate.ts envelope.ts met.ts ends.ts guide.ts
    rsvp.ts wishes.ts finale.ts narrator.ts misc.ts png.ts
    index.ts              COPY_FIELDS, COPY_FIELD_BY_KEY
    guest-keys.ts         GUEST_COPY_TABS, GUEST_COPY_KEYS, GUEST_COPY_FIELDS
  build-copy.ts           dựng cây copy (chuỗi → chuỗi đã điền / hàm)
  copy-texts.ts           kiểu CopyTexts
  copy-vars.ts            gộp event vars + owner vars
  compose-copy.ts         CopyTexts + moments → GraduationCopy
  defaults.ts             DEFAULT_OWNER, DEFAULT_IMAGES
  apply-overrides.ts      đè overrides lên CopyTexts
  flatten-texts.ts        CopyTexts → Record<key, string>
  settings-types.ts       GraduationSettingsContent, GuestContent, …
  settings-rules.ts       các schema zod nhỏ dùng chung
  copy-entry-rules.ts     copyEntryError, copyOverridesSchema
  issue-paths.ts          zod issues → fieldErrors
  validate-settings.ts    validate chặt khi lưu
  sanitize-settings.ts    đọc dễ dãi từ DB
  legacy-guest-content.ts chuyển customContent dạng cũ
  guest-content-schema.ts schema custom khách (dạng mới, nhận cả dạng cũ)
  normalize-guest-content.ts
  resolve-owner.ts resolve-images.ts resolve-moments.ts resolve-event.ts
  layer-texts.ts          mặc định → chung → khách
  resolve-content.ts      resolveGraduationContent
  settings-store.ts       kiểu SettingsStore
  read-settings.ts        đọc + sanitize, nuốt lỗi DB
  load-settings.ts        React cache + repository
  load-content.ts         dùng ở server (page, OG, PNG, ics, 404)
  settings-service.ts     validate + ghi
  guest-placeholders.ts   placeholder cho form khách
  guest-content-summary.ts tóm tắt cho bảng khách
lib/graduation/settings-repository.ts   Prisma
lib/graduation/ics-response.ts          Response cho file .ics
app/admin/components/admin-shell.tsx
app/admin/graduation/session-expired.ts
app/admin/graduation/components/fields/
  field-classes.ts token-labels.ts insert-token.ts riso-color-options.ts row-field.ts
  template-chips.tsx localized-input.tsx bilingual-row.tsx
  plain-field.tsx datetime-field.tsx
  moment-list.ts moment-editor-card.tsx moments-editor.tsx
  guest-copy-fields.tsx
app/admin/graduation/components/tabs/guest-tab-props.ts
app/admin/graduation/settings/
  page.tsx actions.ts
  draft/settings-draft.ts
  fields/filter-fields.ts fields/group-fields.ts
  sections.ts
  components/section-nav.tsx field-search.tsx copy-section-panel.tsx
              owner-panel.tsx event-panel.tsx envelope-extras.tsx met-extras.tsx
              settings-tab-panel.tsx save-bar.tsx use-unsaved-guard.ts settings-editor.tsx
components/graduation/shared/use-postmark-lines.ts
```

---

## Giai đoạn 0: Sửa dữ liệu giờ sự kiện

### Task 1: Đưa giờ sự kiện về đúng UTC

> **CHỜ XÁC NHẬN:** chỉ làm task này khi chủ dự án đã xác nhận lễ diễn ra **16:30 – 18:30 giờ Việt Nam ngày 28/11/2026**. Hiện `startUtc` ghi `16:30Z`, tức 23:30 giờ VN, nên link Google Calendar, file `.ics` và đồng hồ đếm ngược đang lệch 7 tiếng. Nếu chưa có xác nhận thì dừng và hỏi.

**Files:**
- Modify: `lib/graduation/event.ts:25-26`
- Modify: `tests/lib/graduation/ics.test.ts:8-9`
- Modify: `tests/lib/graduation/calendar.test.ts:17`
- Modify: `tests/app/graduation/calendar-ics-route.test.ts:12`

`tests/components/graduation/finale/countdown.test.ts` dùng chuỗi giờ riêng của nó, **không** sửa.

**Interfaces:**
- Produces: `GRADUATION_EVENT.startUtc = "2026-11-28T09:30:00Z"`, `GRADUATION_EVENT.endUtc = "2026-11-28T11:30:00Z"`.

- [ ] **Step 1: Sửa kỳ vọng trong test trước**

`tests/lib/graduation/ics.test.ts`:
```ts
    expect(ics).toContain("DTSTART:20261128T093000Z");
    expect(ics).toContain("DTEND:20261128T113000Z");
```
`tests/lib/graduation/calendar.test.ts`:
```ts
    expect(url.searchParams.get("dates")).toBe("20261128T093000Z/20261128T113000Z");
```
`tests/app/graduation/calendar-ics-route.test.ts`:
```ts
    expect(body).toContain("DTSTART:20261128T093000Z");
```

- [ ] **Step 2: Chạy test, xác nhận fail**

Run: `npx vitest run tests/lib/graduation/ics.test.ts tests/lib/graduation/calendar.test.ts tests/app/graduation/calendar-ics-route.test.ts`
Expected: 3 test FAIL, nội dung lỗi chứa `163000Z`.

- [ ] **Step 3: Sửa dữ liệu** trong `lib/graduation/event.ts`:
```ts
  startUtc: "2026-11-28T09:30:00Z",
  endUtc: "2026-11-28T11:30:00Z",
```

- [ ] **Step 4: Chạy lại lệnh ở Step 2** → PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/graduation/event.ts tests/lib/graduation/ics.test.ts tests/lib/graduation/calendar.test.ts tests/app/graduation/calendar-ics-route.test.ts
git commit -F - <<'MSG'
fix(graduation): store the ceremony time in real UTC (16:30 ICT)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01JvSBxKetjoRWNxLi74rKVy
MSG
```

Các task sau commit theo cùng cách. Plan chỉ ghi dòng tiêu đề commit và danh sách file cần `git add`.

---

## Giai đoạn A: Lõi nội dung (hàm thuần, TDD)

Mọi file của giai đoạn này nằm trong `lib/graduation/content/`, test trong `tests/lib/graduation/content/`.

### Task 2: `is-record.ts` và `vn-time.ts`

**Files:**
- Create: `lib/graduation/content/is-record.ts`
- Create: `lib/graduation/content/vn-time.ts`
- Test: `tests/lib/graduation/content/vn-time.test.ts`

**Interfaces:**
- Produces:
  - `isRecord(value: unknown): value is Record<string, unknown>`
  - `pad(value: number): string`. Thêm số 0 đằng trước cho đủ 2 chữ số.
  - `type VnParts = { year: number; month: number; day: number; weekday: number; hours: number; minutes: number }` (`month` 0–11, `weekday` 0 = Chủ Nhật)
  - `vnParts(iso: string): VnParts`
  - `toVnLocalInput(iso: string): string` → `"YYYY-MM-DDTHH:mm"`
  - `fromVnLocalInput(local: string): string | null` → ISO UTC (`toISOString()`), `null` nếu sai định dạng

- [ ] **Step 1: Viết test** `tests/lib/graduation/content/vn-time.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { fromVnLocalInput, toVnLocalInput, vnParts } from "@/lib/graduation/content/vn-time";

describe("vnParts", () => {
  it("reads the wall clock in Vietnam (UTC+7)", () => {
    expect(vnParts("2026-11-28T09:30:00Z")).toEqual({ year: 2026, month: 10, day: 28, weekday: 6, hours: 16, minutes: 30 });
  });
  it("rolls over to the next day after 17:00 UTC", () => {
    expect(vnParts("2026-12-31T17:15:00Z")).toEqual({ year: 2027, month: 0, day: 1, weekday: 5, hours: 0, minutes: 15 });
  });
});

describe("toVnLocalInput / fromVnLocalInput", () => {
  it("formats an ISO instant for a datetime-local input in Vietnam time", () => {
    expect(toVnLocalInput("2026-11-28T09:30:00Z")).toBe("2026-11-28T16:30");
  });
  it("parses a datetime-local value as Vietnam time", () => {
    expect(fromVnLocalInput("2026-11-28T16:30")).toBe("2026-11-28T09:30:00.000Z");
  });
  it("round-trips", () => {
    expect(fromVnLocalInput(toVnLocalInput("2027-01-01T00:05:00.000Z"))).toBe("2027-01-01T00:05:00.000Z");
  });
  it("rejects malformed values", () => {
    expect(fromVnLocalInput("")).toBeNull();
    expect(fromVnLocalInput("28/11/2026 16:30")).toBeNull();
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận fail**

Run: `npx vitest run tests/lib/graduation/content/vn-time.test.ts`
Expected: FAIL, không tìm thấy module.

- [ ] **Step 3: Viết code**

`lib/graduation/content/is-record.ts`:
```ts
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
```

`lib/graduation/content/vn-time.ts`:
```ts
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;
const LOCAL_INPUT = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

export type VnParts = { year: number; month: number; day: number; weekday: number; hours: number; minutes: number };

export const pad = (value: number) => String(value).padStart(2, "0");

export function vnParts(iso: string): VnParts {
  const shifted = new Date(Date.parse(iso) + VN_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
    weekday: shifted.getUTCDay(),
    hours: shifted.getUTCHours(),
    minutes: shifted.getUTCMinutes(),
  };
}

export function toVnLocalInput(iso: string): string {
  const p = vnParts(iso);
  return `${p.year}-${pad(p.month + 1)}-${pad(p.day)}T${pad(p.hours)}:${pad(p.minutes)}`;
}

export function fromVnLocalInput(local: string): string | null {
  const match = LOCAL_INPUT.exec(local);
  if (!match) return null;
  const [year, month, day, hours, minutes] = match.slice(1).map(Number);
  return new Date(Date.UTC(year, month - 1, day, hours, minutes) - VN_OFFSET_MS).toISOString();
}
```

- [ ] **Step 4: Chạy test** → PASS.

- [ ] **Step 5: Commit** `feat(graduation): Vietnam wall-clock helpers for event times`. Các file: `lib/graduation/content/is-record.ts lib/graduation/content/vn-time.ts tests/lib/graduation/content/vn-time.test.ts`.

---

### Task 3: `event-vars.ts`

**Files:**
- Create: `lib/graduation/content/event-vars.ts`
- Test: `tests/lib/graduation/content/event-vars.test.ts`

**Interfaces:**
- Consumes: `vnParts`, `pad` (Task 2), `Lang` từ `lib/graduation/i18n/types.ts`.
- Produces:
  - `type EventTimes = { startUtc: string; endUtc: string }`
  - `type EventVars = { date: string; dateShort: string; year: string; weekday: string; weekdayShort: string; time: string }`
  - `eventVars(times: EventTimes, lang: Lang): EventVars`

- [ ] **Step 1: Viết test**

```ts
import { describe, expect, it } from "vitest";
import { eventVars } from "@/lib/graduation/content/event-vars";

const times = { startUtc: "2026-11-28T09:30:00Z", endUtc: "2026-11-28T11:30:00Z" };

describe("eventVars", () => {
  it("formats Vietnamese date parts in Vietnam time", () => {
    expect(eventVars(times, "vi")).toEqual({
      date: "28.11",
      dateShort: "28.11",
      year: "2026",
      weekday: "Thứ Bảy",
      weekdayShort: "T7",
      time: "16:30 — 18:30",
    });
  });
  it("formats English date parts", () => {
    expect(eventVars(times, "en")).toEqual({
      date: "Nov 28",
      dateShort: "28.11",
      year: "2026",
      weekday: "Saturday",
      weekdayShort: "Sat",
      time: "16:30 — 18:30",
    });
  });
  it("uses the Vietnam calendar day, not the UTC one", () => {
    const late = { startUtc: "2026-11-28T18:00:00Z", endUtc: "2026-11-28T19:00:00Z" };
    expect(eventVars(late, "vi")).toMatchObject({ date: "29.11", weekday: "Chủ Nhật", time: "01:00 — 02:00" });
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận fail.**

- [ ] **Step 3: Viết code**

```ts
import type { Lang } from "../i18n/types";
import { pad, vnParts } from "./vn-time";

export type EventTimes = { startUtc: string; endUtc: string };
export type EventVars = { date: string; dateShort: string; year: string; weekday: string; weekdayShort: string; time: string };

const WEEKDAYS: Record<Lang, { long: readonly string[]; short: readonly string[] }> = {
  vi: {
    long: ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"],
    short: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
  },
  en: {
    long: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    short: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  },
};
const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function eventVars({ startUtc, endUtc }: EventTimes, lang: Lang): EventVars {
  const start = vnParts(startUtc);
  const end = vnParts(endUtc);
  const dateShort = `${pad(start.day)}.${pad(start.month + 1)}`;
  return {
    date: lang === "vi" ? dateShort : `${EN_MONTHS[start.month]} ${start.day}`,
    dateShort,
    year: String(start.year),
    weekday: WEEKDAYS[lang].long[start.weekday],
    weekdayShort: WEEKDAYS[lang].short[start.weekday],
    time: `${pad(start.hours)}:${pad(start.minutes)} — ${pad(end.hours)}:${pad(end.minutes)}`,
  };
}
```

- [ ] **Step 4: Chạy test** → PASS.

- [ ] **Step 5: Commit** `feat(graduation): localized date/time template values from the event times`

---

### Task 4: `template.ts`

**Files:**
- Create: `lib/graduation/content/template.ts`
- Test: `tests/lib/graduation/content/template.test.ts`

**Interfaces:**
- Produces:
  - `type TemplateVars = Readonly<Record<string, string | undefined>>`
  - `fillTemplate(template: string, vars: TemplateVars): string`. Chỗ trống không có giá trị thì thành `""`.
  - `templateTokens(template: string): string[]`. Danh sách tên chỗ trống, không trùng, theo thứ tự xuất hiện.

- [ ] **Step 1: Viết test**

```ts
import { describe, expect, it } from "vitest";
import { fillTemplate, templateTokens } from "@/lib/graduation/content/template";

describe("fillTemplate", () => {
  it("replaces known tokens", () => {
    expect(fillTemplate("Và bạn, {name}", { name: "Lan" })).toBe("Và bạn, Lan");
  });
  it("replaces every occurrence", () => {
    expect(fillTemplate("{year}-{year}", { year: "2026" })).toBe("2026-2026");
  });
  it("blanks tokens without a value instead of leaking braces", () => {
    expect(fillTemplate("Hi {name}!", {})).toBe("Hi !");
  });
  it("leaves text without tokens untouched", () => {
    expect(fillTemplate("Xin chào,", { name: "Lan" })).toBe("Xin chào,");
  });
});

describe("templateTokens", () => {
  it("lists unique token names in order", () => {
    expect(templateTokens("{weekday} {date}.{year} {date}")).toEqual(["weekday", "date", "year"]);
  });
  it("ignores braces that are not word tokens", () => {
    expect(templateTokens("{ name } {} {a-b}")).toEqual([]);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận fail.**

- [ ] **Step 3: Viết code**

```ts
export type TemplateVars = Readonly<Record<string, string | undefined>>;

const TOKEN = /\{(\w+)\}/g;

export function fillTemplate(template: string, vars: TemplateVars): string {
  return template.replace(TOKEN, (_, name: string) => vars[name] ?? "");
}

export function templateTokens(template: string): string[] {
  return [...new Set(Array.from(template.matchAll(TOKEN), (match) => match[1]))];
}
```

- [ ] **Step 4: Chạy test** → PASS.

- [ ] **Step 5: Commit** `feat(graduation): copy template filling`

---

### Task 5: `paths.ts`, `list-format.ts`, `overrides.ts`

Ba tiện ích nhỏ cùng phục vụ việc đọc/ghi copy theo key phẳng. Gộp một task vì chung một lượt test, nhưng vẫn là ba file riêng.

**Files:**
- Create: `lib/graduation/content/paths.ts`
- Create: `lib/graduation/content/list-format.ts`
- Create: `lib/graduation/content/overrides.ts`
- Test: `tests/lib/graduation/content/paths.test.ts`
- Test: `tests/lib/graduation/content/overrides.test.ts`

**Interfaces:**
- Consumes: `isRecord` (Task 2).
- Produces:
  - `type Tree = Record<string, unknown>`
  - `getPath(tree: Tree, key: string): unknown` (`key` dạng `"a.b.c"`)
  - `setPath<T extends Tree>(tree: T, key: string, value: unknown): T`. Trả object mới, không sửa object cũ.
  - `leafKeys(tree: Tree, prefix?: string): string[]`. Lá là mọi giá trị không phải object thường.
  - `splitList(value: string): string[]` (tách theo `\n`, trim, bỏ dòng trống), `joinList(items: readonly string[]): string`
  - `type CopyOverrides = Partial<Record<string, string>>`
  - `setOverride(overrides: CopyOverrides | undefined, key: string, value: string): CopyOverrides`. `value === ""` thì xóa key.

- [ ] **Step 1: Viết test**

`tests/lib/graduation/content/paths.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { getPath, leafKeys, setPath } from "@/lib/graduation/content/paths";
import { joinList, splitList } from "@/lib/graduation/content/list-format";

describe("getPath", () => {
  it("reads nested values", () => {
    expect(getPath({ a: { b: { c: "x" } } }, "a.b.c")).toBe("x");
  });
  it("returns undefined for missing branches", () => {
    expect(getPath({ a: "x" }, "a.b")).toBeUndefined();
  });
});

describe("setPath", () => {
  it("returns a new tree and keeps the original", () => {
    const original = { a: { b: "old", keep: "k" } };
    const next = setPath(original, "a.b", "new");
    expect(next).toEqual({ a: { b: "new", keep: "k" } });
    expect(original.a.b).toBe("old");
  });
  it("creates missing branches", () => {
    expect(setPath({}, "a.b", 1)).toEqual({ a: { b: 1 } });
  });
});

describe("leafKeys", () => {
  it("treats strings, arrays and functions as leaves", () => {
    const fn = () => "";
    expect(leafKeys({ a: "x", b: { c: ["1"], d: fn } })).toEqual(["a", "b.c", "b.d"]);
  });
});

describe("list format", () => {
  it("splits lines, trims and drops blanks", () => {
    expect(splitList(" A \n\n B\n")).toEqual(["A", "B"]);
  });
  it("joins with newlines", () => {
    expect(joinList(["A", "B"])).toBe("A\nB");
  });
});
```

`tests/lib/graduation/content/overrides.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { setOverride } from "@/lib/graduation/content/overrides";

describe("setOverride", () => {
  it("adds a value", () => {
    expect(setOverride(undefined, "met.intro", "Hi")).toEqual({ "met.intro": "Hi" });
  });
  it("removes the key when the value is empty", () => {
    expect(setOverride({ "met.intro": "Hi", "card.body": "B" }, "met.intro", "")).toEqual({ "card.body": "B" });
  });
  it("keeps whitespace while typing", () => {
    expect(setOverride({}, "card.body", "a ")).toEqual({ "card.body": "a " });
  });
});
```

- [ ] **Step 2: Chạy hai file test, xác nhận fail.**

- [ ] **Step 3: Viết code**

`lib/graduation/content/paths.ts`:
```ts
import { isRecord } from "./is-record";

export type Tree = Record<string, unknown>;

export function getPath(tree: Tree, key: string): unknown {
  return key.split(".").reduce<unknown>((node, part) => (isRecord(node) ? node[part] : undefined), tree);
}

export function setPath<T extends Tree>(tree: T, key: string, value: unknown): T {
  const [head, ...rest] = key.split(".");
  const child = tree[head];
  const next = rest.length === 0 ? value : setPath(isRecord(child) ? child : {}, rest.join("."), value);
  return { ...tree, [head]: next } as T;
}

export function leafKeys(tree: Tree, prefix = ""): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return isRecord(value) ? leafKeys(value, path) : [path];
  });
}
```

`lib/graduation/content/list-format.ts`:
```ts
export const splitList = (value: string): string[] =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

export const joinList = (items: readonly string[]): string => items.join("\n");
```

`lib/graduation/content/overrides.ts`:
```ts
export type CopyOverrides = Partial<Record<string, string>>;

export function setOverride(overrides: CopyOverrides | undefined, key: string, value: string): CopyOverrides {
  const next = { ...overrides };
  if (value === "") delete next[key];
  else next[key] = value;
  return next;
}
```

- [ ] **Step 4: Chạy test** → PASS.

- [ ] **Step 5: Commit** `feat(graduation): path, list and override helpers for flat copy keys`

---

### Task 6: Kiểu trường và chỗ trống

**Files:**
- Create: `lib/graduation/content/fields/types.ts`
- Create: `lib/graduation/content/fields/tokens.ts`
- Create: `lib/graduation/content/fields/define.ts`
- Test: `tests/lib/graduation/content/fields/tokens.test.ts`

**Interfaces:**
- Produces:
  - `type CopySection = "gate" | "header" | "envelope" | "met" | "ends" | "rsvp" | "wishes" | "finale" | "narrator" | "misc" | "png"`
  - `type CallVar = "name" | "n" | "calendar"`
  - `type CopyFieldKind = "text" | "textarea" | "list"`
  - `type CopyField = { key: string; section: CopySection; label: string; kind: CopyFieldKind; group?: string; call?: CallVar; optional?: true }`
  - `STATIC_VARS` (tuple `as const`), `type StaticVar`
  - `allowedTokens(field: Pick<CopyField, "call">): string[]`
  - `defineFields(section, group?) => (key, label, options?) => CopyField`

- [ ] **Step 1: Viết test**

```ts
import { describe, expect, it } from "vitest";
import { defineFields } from "@/lib/graduation/content/fields/define";
import { STATIC_VARS, allowedTokens } from "@/lib/graduation/content/fields/tokens";

describe("allowedTokens", () => {
  it("allows every static var", () => {
    expect(allowedTokens({})).toEqual([...STATIC_VARS]);
  });
  it("adds the call var", () => {
    expect(allowedTokens({ call: "name" })).toEqual([...STATIC_VARS, "name"]);
  });
});

describe("defineFields", () => {
  it("binds section and group and defaults to a single-line text field", () => {
    const field = defineFields("met", "Tiêu đề")("met.heading.lead", "Phần đầu");
    expect(field).toEqual({ key: "met.heading.lead", section: "met", label: "Phần đầu", kind: "text", group: "Tiêu đề" });
  });
  it("omits the group when none is given and applies options", () => {
    const field = defineFields("met")("met.andYou", "Nhãn", { call: "name" });
    expect(field).toEqual({ key: "met.andYou", section: "met", label: "Nhãn", kind: "text", call: "name" });
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận fail.**

- [ ] **Step 3: Viết code**

`fields/types.ts`:
```ts
export type CopySection = "gate" | "header" | "envelope" | "met" | "ends" | "rsvp" | "wishes" | "finale" | "narrator" | "misc" | "png";
export type CallVar = "name" | "n" | "calendar";
export type CopyFieldKind = "text" | "textarea" | "list";

export type CopyField = {
  key: string;
  section: CopySection;
  label: string;
  kind: CopyFieldKind;
  group?: string;
  call?: CallVar;
  optional?: true;
};
```

`fields/tokens.ts`:
```ts
import type { CopyField } from "./types";

export const STATIC_VARS = ["owner", "initials", "date", "year", "weekday", "weekdayShort", "time"] as const;
export type StaticVar = (typeof STATIC_VARS)[number];

export const allowedTokens = (field: Pick<CopyField, "call">): string[] =>
  field.call ? [...STATIC_VARS, field.call] : [...STATIC_VARS];
```

`fields/define.ts`:
```ts
import type { CopyField, CopySection } from "./types";

type FieldOptions = Partial<Pick<CopyField, "kind" | "call" | "optional">>;

export const defineFields =
  (section: CopySection, group?: string) =>
  (key: string, label: string, options: FieldOptions = {}): CopyField => ({
    key,
    section,
    label,
    kind: "text",
    ...(group ? { group } : {}),
    ...options,
  });
```

- [ ] **Step 4: Chạy test** → PASS.

- [ ] **Step 5: Commit** `feat(graduation): copy field model and template tokens`

---


### Task 7: Danh sách trường copy

Đây là nguồn duy nhất liệt kê mọi trường admin sửa được. Thứ tự trong mảng chính là thứ tự hiển thị trong admin.

**Files:**
- Create: `lib/graduation/content/fields/meta.ts`
- Create: `lib/graduation/content/fields/header.ts`
- Create: `lib/graduation/content/fields/gate.ts`
- Create: `lib/graduation/content/fields/envelope.ts`
- Create: `lib/graduation/content/fields/met.ts`
- Create: `lib/graduation/content/fields/ends.ts`
- Create: `lib/graduation/content/fields/guide.ts`
- Create: `lib/graduation/content/fields/rsvp.ts`
- Create: `lib/graduation/content/fields/wishes.ts`
- Create: `lib/graduation/content/fields/finale.ts`
- Create: `lib/graduation/content/fields/narrator.ts`
- Create: `lib/graduation/content/fields/misc.ts`
- Create: `lib/graduation/content/fields/png.ts`
- Create: `lib/graduation/content/fields/index.ts`
- Create: `lib/graduation/content/fields/guest-keys.ts`
- Test: `tests/lib/graduation/content/fields/registry.test.ts`

**Interfaces:**
- Consumes: `defineFields`, `CopyField` (Task 6).
- Produces:
  - `COPY_FIELDS: readonly CopyField[]`, `COPY_FIELD_BY_KEY: ReadonlyMap<string, CopyField>` (từ `fields/index.ts`)
  - `GUEST_COPY_TABS: { envelope: readonly string[]; met: readonly string[]; ends: readonly string[]; rsvp: readonly string[] }`
  - `GUEST_COPY_KEYS: readonly string[]`, `GUEST_COPY_FIELDS: readonly CopyField[]` (từ `fields/guest-keys.ts`)

- [ ] **Step 1: Viết test**

```ts
import { describe, expect, it } from "vitest";
import { COPY_FIELDS, COPY_FIELD_BY_KEY } from "@/lib/graduation/content/fields";
import { GUEST_COPY_FIELDS, GUEST_COPY_KEYS, GUEST_COPY_TABS } from "@/lib/graduation/content/fields/guest-keys";

describe("COPY_FIELDS", () => {
  it("has unique keys", () => {
    expect(COPY_FIELD_BY_KEY.size).toBe(COPY_FIELDS.length);
  });
  it("gives every field a label", () => {
    expect(COPY_FIELDS.every((field) => field.label.trim().length > 0)).toBe(true);
  });
  it("only marks free-text fields as optional", () => {
    expect(COPY_FIELDS.filter((field) => field.optional).map((field) => field.key)).toEqual(["ends.specialMessage"]);
  });
});

describe("guest keys", () => {
  it("only reference registered fields", () => {
    expect(GUEST_COPY_KEYS.filter((key) => !COPY_FIELD_BY_KEY.has(key))).toEqual([]);
  });
  it("flattens the guest tabs in order", () => {
    expect(GUEST_COPY_KEYS).toEqual([...GUEST_COPY_TABS.envelope, ...GUEST_COPY_TABS.met, ...GUEST_COPY_TABS.ends, ...GUEST_COPY_TABS.rsvp]);
    expect(GUEST_COPY_FIELDS.map((field) => field.key).sort()).toEqual([...GUEST_COPY_KEYS].sort());
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận fail** — `npx vitest run tests/lib/graduation/content/fields/registry.test.ts`.

- [ ] **Step 3: Viết các file danh sách**

Mỗi file export đúng một hằng số mảng. Ghi y nguyên nhãn bên dưới.

`fields/meta.ts`:
```ts
import { defineFields } from "./define";

const field = defineFields("misc", "Meta & tab trình duyệt");

export const META_FIELDS = [
  field("meta.title", "Tiêu đề trang (khi không có khách)"),
  field("meta.guestTitle", "Tiêu đề trang theo khách", { call: "name" }),
  field("meta.description", "Mô tả khi chia sẻ link", { kind: "textarea" }),
  field("meta.eventTitle", "Tên sự kiện trong lịch"),
];
```

`fields/header.ts`:
```ts
import { defineFields } from "./define";

const header = defineFields("header", "Header");
const rails = defineFields("header", "Rails hai bên");

export const HEADER_FIELDS = [
  header("header.title", "Tiêu đề header"),
  header("header.back", "Nút quay về portfolio"),
  header("header.music", "Nhãn nút nhạc"),
  header("header.musicUnavailable", "Thông báo không phát được nhạc"),
  header("header.switchLang", "Nhãn chọn ngôn ngữ"),
  rails("rails.when", "Nhãn thời gian"),
  rails("rails.whenValue", "Giá trị thời gian"),
  rails("rails.where", "Nhãn địa điểm"),
  rails("rails.whereValue", "Giá trị địa điểm"),
  rails("rails.whereSub", "Dòng phụ địa điểm"),
];
```

`fields/gate.ts`:
```ts
import { defineFields } from "./define";

const field = defineFields("gate");

export const GATE_FIELDS = [
  field("gate.tapBee", "Gợi ý dưới chú ong"),
  field("gate.silent", "Nút vào không nhạc"),
  field("gate.soundHint", "Gợi ý bật âm thanh"),
  field("gate.desktopHint", "Gợi ý xem trên máy tính (chỉ hiện trên điện thoại)"),
  field("gate.nowPlaying", "Nhãn đang phát nhạc"),
  field("gate.beePreparing", "Ong nói khi đang tải"),
  field("gate.beeNotice", "Ong nói khi sẵn sàng", { call: "name" }),
  field("gate.dialogLabel", "Tên hộp thoại (trình đọc màn hình)"),
  field("gate.wake", "Tên nút đánh thức ong (trình đọc màn hình)"),
];
```

`fields/envelope.ts`:
```ts
import { defineFields } from "./define";

const cover = defineFields("envelope", "Bìa");
const envelope = defineFields("envelope", "Phong bì");
const card = defineFields("envelope", "Thiệp");

export const ENVELOPE_FIELDS = [
  cover("stage.coverKicker", "Dòng nhỏ trên bìa"),
  cover("stage.cover.lead", "Tiêu đề bìa (phần đầu)"),
  cover("stage.cover.accent", "Tiêu đề bìa (phần nhấn)"),
  cover("stage.greetKicker", "Dòng nhỏ phần lời chào"),
  cover("stage.scrollHint", "Gợi ý cuộn để mở thư"),
  envelope("envelope.airMail", "Nhãn thư"),
  envelope("envelope.invitationNo", "Dòng dưới nhãn thư"),
  envelope("envelope.to", "Nhãn người nhận"),
  envelope("envelope.cordially", "Lời mời trên phong bì"),
  envelope("envelope.from", "Người gửi trên phong bì"),
  envelope("envelope.returnTo", "Nhãn địa chỉ người gửi"),
  envelope("envelope.faculty", "Khoa / lớp"),
  envelope("envelope.guest", "Chú thích dưới tên khách"),
  card("card.label", "Nhãn thiệp"),
  card("card.fig", "Ký hiệu góc thiệp"),
  card("card.greeting", "Lời chào"),
  card("card.body", "Nội dung thiệp", { kind: "textarea" }),
  card("card.author", "Chữ ký"),
  card("card.keepScrolling", "Gợi ý cuộn tiếp"),
  card("card.coverAlt", "Mô tả ảnh bìa (trình đọc màn hình)"),
];
```

`fields/met.ts`:
```ts
import { defineFields } from "./define";

const field = defineFields("met");

export const MET_FIELDS = [
  field("met.heading.lead", "Tiêu đề (phần đầu)"),
  field("met.heading.accent", "Tiêu đề (phần nhấn)"),
  field("met.intro", "Đoạn giới thiệu", { kind: "textarea" }),
  field("met.andYou", "Nhãn trên lời nhắn cá nhân", { call: "name" }),
  field("met.defaultNote", "Lời nhắn cá nhân", { kind: "textarea" }),
  field("met.togetherCaption", "Chú thích ảnh chụp chung", { call: "name" }),
  field("met.polaroidCaption", "Chú thích khung polaroid", { call: "name" }),
];
```

`fields/ends.ts`:
```ts
import { defineFields } from "./define";

const content = defineFields("ends", "Nội dung");
const ticket = defineFields("ends", "Vé");
const calendar = defineFields("ends", "Lịch");

export const ENDS_FIELDS = [
  content("ends.heading.lead", "Tiêu đề (phần đầu)"),
  content("ends.heading.accent", "Tiêu đề (phần nhấn)"),
  content("ends.intro", "Đoạn giới thiệu", { kind: "textarea" }),
  content("ends.specialMessage", "Lời nhắn riêng (để trống để ẩn)", { kind: "textarea", optional: true }),
  ticket("ends.stamp", "Con dấu vé (mỗi dòng là một dòng chữ)", { kind: "list" }),
  ticket("ends.when", "Nhãn thời gian"),
  ticket("ends.day", "Dòng ngày"),
  ticket("ends.where", "Nhãn địa điểm"),
  ticket("ends.venue", "Hội trường"),
  ticket("ends.address", "Địa chỉ"),
  ticket("ends.venueSub", "Dòng phụ địa điểm"),
  ticket("ends.notes", "Ghi chú (mỗi dòng một ghi chú)", { kind: "list" }),
  ticket("ends.directions", "Nút chỉ đường"),
  calendar("ends.addToCalendar", "Nút thêm vào lịch"),
  calendar("ends.calendar.google", "Tên Google Calendar"),
  calendar("ends.calendar.apple", "Tên lịch Apple"),
  calendar("ends.calendar.orOther", "Dòng gợi ý lịch còn lại", { call: "calendar" }),
];
```

`fields/guide.ts`:
```ts
import { defineFields } from "./define";

const field = defineFields("ends", "Bản đồ & tour 360°");

export const GUIDE_FIELDS = [
  field("ends.guide.map.tab", "Tab bản đồ"),
  field("ends.guide.map.hint", "Gợi ý dùng bản đồ (máy tính)"),
  field("ends.guide.map.touchHint", "Gợi ý dùng bản đồ (cảm ứng)"),
  field("ends.guide.tour.tab", "Tab tour"),
  field("ends.guide.tour.load", "Nút bắt đầu tour"),
  field("ends.guide.tour.open", "Nút mở toàn màn hình"),
  field("ends.guide.tour.credit.label", "Nhãn nguồn"),
  field("ends.guide.tour.credit.owner", "Tên đơn vị nguồn"),
  field("ends.guide.loading", "Chữ đang tải"),
  field("ends.guide.tabsLabel", "Tên nhóm tab (trình đọc màn hình)"),
  field("ends.guide.map.frameTitle", "Tên khung bản đồ (trình đọc màn hình)"),
  field("ends.guide.tour.frameTitle", "Tên khung tour (trình đọc màn hình)"),
];
```

`fields/rsvp.ts`:
```ts
import { defineFields } from "./define";

const ask = defineFields("rsvp", "Câu hỏi");
const form = defineFields("rsvp", "Form");
const notice = defineFields("rsvp", "Thông báo");
const letter = defineFields("rsvp", "Thư hồi âm");

export const RSVP_FIELDS = [
  ask("rsvp.heading.lead", "Tiêu đề (phần đầu)"),
  ask("rsvp.heading.accent", "Tiêu đề (phần nhấn)"),
  ask("rsvp.prompt", "Câu hỏi", { call: "name" }),
  ask("rsvp.yes", "Nút sẽ đến"),
  ask("rsvp.no", "Nút không đến"),
  ask("rsvp.change", "Nút đổi ý"),
  form("rsvp.contact.label", "Nhãn ô liên hệ"),
  form("rsvp.contact.placeholder", "Gợi ý ô liên hệ"),
  form("rsvp.reason.label", "Nhãn ô lý do"),
  form("rsvp.reason.placeholder", "Gợi ý ô lý do"),
  form("rsvp.wish.label", "Nhãn ô lời chúc"),
  form("rsvp.wish.placeholder", "Gợi ý ô lời chúc"),
  form("rsvp.optional", "Chữ 'không bắt buộc'"),
  form("rsvp.submit", "Nút gửi"),
  form("rsvp.sending", "Chữ đang gửi"),
  form("rsvp.ownerPhone", "Nhãn số điện thoại chủ thiệp"),
  notice("rsvp.result.yes", "Thông báo khi sẽ đến"),
  notice("rsvp.result.no", "Thông báo khi không đến"),
  notice("rsvp.stamp", "Con dấu khi sẽ đến"),
  notice("rsvp.error", "Lỗi gửi"),
  notice("rsvp.fieldErrors.required", "Lỗi: chưa điền"),
  notice("rsvp.fieldErrors.invalid_contact", "Lỗi: liên hệ sai"),
  notice("rsvp.fieldErrors.too_long", "Lỗi: quá dài"),
  letter("rsvp.letter.to", "Người nhận"),
  letter("rsvp.letter.from", "Người gửi", { call: "name" }),
  letter("rsvp.letter.sent", "Thông báo đã gửi"),
];
```

`fields/wishes.ts`:
```ts
import { defineFields } from "./define";

const content = defineFields("wishes", "Nội dung");
const card = defineFields("wishes", "Bưu thiếp");
const controls = defineFields("wishes", "Điều khiển");

export const WISHES_FIELDS = [
  content("wishes.heading.lead", "Tiêu đề (phần đầu)"),
  content("wishes.heading.accent", "Tiêu đề (phần nhấn)"),
  content("wishes.intro", "Đoạn giới thiệu", { kind: "textarea" }),
  content("wishes.count", "Chú thích số lời chúc"),
  content("wishes.mine", "Nhãn lời chúc của bạn"),
  content("wishes.loading", "Chữ đang tải"),
  content("wishes.error", "Lỗi kết nối"),
  content("wishes.empty", "Khi chưa có lời chúc"),
  card("wishes.airMail", "Dòng đầu bưu thiếp", { call: "n" }),
  card("wishes.to", "Nhãn người nhận"),
  card("wishes.from", "Nhãn người gửi"),
  card("wishes.wishFrom", "Tên ô lời chúc (trình đọc màn hình)", { call: "name" }),
  controls("wishes.close", "Nút đóng"),
  controls("wishes.zoomIn", "Nút phóng to"),
  controls("wishes.zoomOut", "Nút thu nhỏ"),
  controls("wishes.recenter", "Nút về giữa"),
];
```

`fields/finale.ts`:
```ts
import { defineFields } from "./define";

const content = defineFields("finale", "Nội dung");
const countdown = defineFields("finale", "Đếm ngược");
const reply = defineFields("finale", "Thẻ hồi âm");

export const FINALE_FIELDS = [
  content("finale.heading.lead", "Tiêu đề (phần đầu)"),
  content("finale.heading.accent", "Tiêu đề (phần nhấn)"),
  content("finale.downloadCard", "Nút tải ảnh thiệp"),
  content("finale.backToTop", "Nút lên đầu trang"),
  countdown("finale.countdown.days", "Ngày"),
  countdown("finale.countdown.hours", "Giờ"),
  countdown("finale.countdown.minutes", "Phút"),
  countdown("finale.countdown.seconds", "Giây"),
  countdown("finale.countdown.during", "Khi đang diễn ra"),
  countdown("finale.countdown.after", "Khi đã kết thúc"),
  reply("finale.replyOf", "Tiêu đề thẻ hồi âm", { call: "name" }),
  reply("finale.status.yes", "Trạng thái sẽ đến"),
  reply("finale.status.no", "Trạng thái không đến"),
  reply("finale.noReply", "Khi chưa hồi âm"),
  reply("finale.replyNow", "Nút hồi âm ngay"),
  reply("finale.dateMark", "Ngày ở chân thẻ"),
];
```

`fields/narrator.ts`:
```ts
import { defineFields } from "./define";

const field = defineFields("narrator");

export const NARRATOR_FIELDS = [
  field("narrator.wave", "Khi vẫy chào", { call: "name" }),
  field("narrator.bow", "Khi cúi chào", { call: "name" }),
  field("narrator.desk", "Phần bốn năm", { call: "name" }),
  field("narrator.cheer", "Phần dành cho bạn", { call: "name" }),
  field("narrator.point", "Phần địa điểm", { call: "name" }),
  field("narrator.toss", "Phần hồi âm", { call: "name" }),
  field("narrator.play", "Phần lời chúc", { call: "name" }),
  field("narrator.farewell", "Tạm biệt", { call: "name" }),
];
```

`fields/misc.ts`:
```ts
import { defineFields } from "./define";

const marks = defineFields("misc", "Dấu & ký hiệu");
const footer = defineFields("misc", "Footer");
const notFound = defineFields("misc", "Trang 404");

export const MISC_FIELDS = [
  marks("marks.school", "Tên trường viết tắt (dấu bưu điện)"),
  marks("marks.city", "Thành phố (dấu bưu điện)"),
  marks("marks.signature", "Ký hiệu chủ thiệp"),
  footer("footer", "Lời cảm ơn cuối trang", { kind: "textarea" }),
  notFound("notFound.kicker", "Dòng nhỏ"),
  notFound("notFound.heading.lead", "Tiêu đề (phần đầu)"),
  notFound("notFound.heading.accent", "Tiêu đề (phần nhấn)"),
  notFound("notFound.body", "Nội dung", { kind: "textarea" }),
];
```

`fields/png.ts`:
```ts
import { defineFields } from "./define";

const field = defineFields("png");

export const PNG_FIELDS = [
  field("png.attend", "Dòng mời tham dự"),
  field("png.faculty", "Khoa / trường"),
  field("png.guestFallback", "Tên thay thế khi không có khách"),
  field("png.qrWebTitle", "Tiêu đề mã QR thiệp"),
  field("png.qrWebBody", "Mô tả mã QR thiệp"),
  field("png.qrWebAlt", "Mô tả ảnh mã QR thiệp"),
  field("png.qrMapTitle", "Tiêu đề mã QR chỉ đường"),
  field("png.qrMapBody", "Mô tả mã QR chỉ đường"),
  field("png.qrMapAlt", "Mô tả ảnh mã QR chỉ đường"),
  field("png.footer", "Dòng cuối thiệp"),
];
```

`fields/index.ts`:
```ts
import { ENDS_FIELDS } from "./ends";
import { ENVELOPE_FIELDS } from "./envelope";
import { FINALE_FIELDS } from "./finale";
import { GATE_FIELDS } from "./gate";
import { GUIDE_FIELDS } from "./guide";
import { HEADER_FIELDS } from "./header";
import { META_FIELDS } from "./meta";
import { MET_FIELDS } from "./met";
import { MISC_FIELDS } from "./misc";
import { NARRATOR_FIELDS } from "./narrator";
import { PNG_FIELDS } from "./png";
import { RSVP_FIELDS } from "./rsvp";
import type { CopyField } from "./types";
import { WISHES_FIELDS } from "./wishes";

export const COPY_FIELDS: readonly CopyField[] = [
  ...GATE_FIELDS,
  ...HEADER_FIELDS,
  ...ENVELOPE_FIELDS,
  ...MET_FIELDS,
  ...ENDS_FIELDS,
  ...GUIDE_FIELDS,
  ...RSVP_FIELDS,
  ...WISHES_FIELDS,
  ...FINALE_FIELDS,
  ...NARRATOR_FIELDS,
  ...META_FIELDS,
  ...MISC_FIELDS,
  ...PNG_FIELDS,
];

export const COPY_FIELD_BY_KEY: ReadonlyMap<string, CopyField> = new Map(COPY_FIELDS.map((field) => [field.key, field]));

export type { CopyField, CopyFieldKind, CopySection, CallVar } from "./types";
```

`fields/guest-keys.ts`:
```ts
import { COPY_FIELDS } from ".";

export const GUEST_COPY_TABS = {
  envelope: ["stage.cover.lead", "stage.cover.accent", "card.greeting", "card.body", "card.author"],
  met: ["met.heading.lead", "met.heading.accent", "met.intro", "met.defaultNote"],
  ends: [
    "ends.heading.lead",
    "ends.heading.accent",
    "ends.intro",
    "ends.venue",
    "ends.address",
    "rails.whereValue",
    "rails.whereSub",
    "ends.notes",
    "ends.specialMessage",
  ],
  rsvp: ["rsvp.heading.lead", "rsvp.heading.accent", "rsvp.prompt"],
} as const satisfies Record<string, readonly string[]>;

export const GUEST_COPY_KEYS: readonly string[] = Object.values(GUEST_COPY_TABS).flat();

const guestKeySet = new Set(GUEST_COPY_KEYS);
export const GUEST_COPY_FIELDS = COPY_FIELDS.filter((field) => guestKeySet.has(field.key));
```

**Kiểm tra trước khi chạy test:** `import { COPY_FIELDS } from "."` trong `guest-keys.ts`. Nếu ESLint của dự án báo lỗi import thư mục `.`, đổi thành `from "./index"`. Chạy `npx eslint lib/graduation/content/fields` để biết.

- [ ] **Step 4: Chạy test** → PASS. Chạy `npx tsc --noEmit -p .` → không lỗi.

- [ ] **Step 5: Commit** `feat(graduation): registry of every admin-editable copy field`

---

### Task 8: `build-copy.ts`

Dựng cây copy hoàn chỉnh từ cây chuỗi. Trường có `call` thành hàm, trường `list` điền mẫu từng phần tử, trường `optional` trống thành `undefined`.

**Files:**
- Create: `lib/graduation/content/build-copy.ts`
- Test: `tests/lib/graduation/content/build-copy.test.ts`

**Interfaces:**
- Consumes: `getPath`, `setPath`, `Tree` (Task 5); `fillTemplate`, `TemplateVars` (Task 4); `CopyField` (Task 6).
- Produces: `buildCopy(texts: Tree, fields: readonly CopyField[], vars: TemplateVars): Tree`

- [ ] **Step 1: Viết test**

```ts
import { describe, expect, it } from "vitest";
import { buildCopy } from "@/lib/graduation/content/build-copy";
import type { CopyField } from "@/lib/graduation/content/fields";

const fields: CopyField[] = [
  { key: "a.title", section: "misc", label: "t", kind: "text" },
  { key: "a.greet", section: "misc", label: "g", kind: "text", call: "name" },
  { key: "a.lines", section: "misc", label: "l", kind: "list" },
  { key: "a.extra", section: "misc", label: "e", kind: "textarea", optional: true },
];

describe("buildCopy", () => {
  const texts = { a: { title: "Năm {year}", greet: "Chào {name}, {year}", lines: ["{date}", "x"], extra: "" }, other: "keep" };
  const built = buildCopy(texts, fields, { year: "2026", date: "28.11" }) as {
    a: { title: string; greet: (name: string) => string; lines: string[]; extra?: string };
    other: string;
  };

  it("fills static tokens", () => {
    expect(built.a.title).toBe("Năm 2026");
  });
  it("turns call fields into functions", () => {
    expect(built.a.greet("Lan")).toBe("Chào Lan, 2026");
  });
  it("fills each list item", () => {
    expect(built.a.lines).toEqual(["28.11", "x"]);
  });
  it("drops blank optional fields", () => {
    expect(built.a.extra).toBeUndefined();
  });
  it("keeps keys that are not fields", () => {
    expect(built.other).toBe("keep");
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận fail.**

- [ ] **Step 3: Viết code**

```ts
import type { CopyField } from "./fields";
import { getPath, setPath, type Tree } from "./paths";
import { fillTemplate, type TemplateVars } from "./template";

function renderField(field: CopyField, raw: unknown, vars: TemplateVars): unknown {
  if (Array.isArray(raw)) return raw.map((item) => fillTemplate(String(item), vars));
  const text = typeof raw === "string" ? raw : "";
  const { call } = field;
  if (call) return (value: string) => fillTemplate(text, { ...vars, [call]: value });
  if (field.optional && text.trim() === "") return undefined;
  return fillTemplate(text, vars);
}

export function buildCopy(texts: Tree, fields: readonly CopyField[], vars: TemplateVars): Tree {
  return fields.reduce((tree, field) => setPath(tree, field.key, renderField(field, getPath(texts, field.key), vars)), texts);
}
```

- [ ] **Step 4: Chạy test** → PASS.

- [ ] **Step 5: Commit** `feat(graduation): build runtime copy from template texts`

---


### Task 9: Chuyển copy mặc định sang chuỗi mẫu

Task này phải làm trọn trong một commit: đổi kiểu `GraduationCopy` (thêm key mới, `card.author` bắt buộc) thì `vi.ts`/`en.ts` phải đổi cùng lúc, nếu không `tsc` sẽ lỗi. Component **không** cần sửa ở task này. `GRADUATION_COPY` vẫn được export và có đúng giá trị như trước (cộng thêm các key mới).

**Files:**
- Modify: `lib/graduation/i18n/types.ts`
- Modify: `lib/graduation/i18n/moments.ts`
- Modify (viết lại): `lib/graduation/i18n/copy/vi.ts`
- Modify (viết lại): `lib/graduation/i18n/copy/en.ts`
- Modify (viết lại): `lib/graduation/i18n/index.ts`
- Modify: `lib/graduation/resolve-invitation-copy.ts:28` (dòng `author:`)
- Create: `lib/graduation/content/copy-texts.ts`
- Create: `lib/graduation/content/defaults.ts`
- Create: `lib/graduation/content/copy-vars.ts`
- Create: `lib/graduation/content/compose-copy.ts`
- Test: `tests/lib/graduation/content/default-texts.test.ts`
- Modify: `tests/lib/graduation/i18n/i18n.test.ts`

**Interfaces:**
- Consumes: `buildCopy` (Task 8), `COPY_FIELDS` (Task 7), `eventVars`, `EventTimes` (Task 3), `TemplateVars` (Task 4), `leafKeys`, `getPath`, `Tree` (Task 5), `allowedTokens` (Task 6).
- Produces:
  - Trong `lib/graduation/i18n/types.ts`: `type MomentText = Pick<Moment, "title" | "body">`, và `GraduationCopy` có thêm các key mới liệt kê ở Step 3.
  - `type CopyTexts` (`lib/graduation/content/copy-texts.ts`)
  - `DEFAULT_OWNER: { name: string; initials: string; website: string }`, `DEFAULT_IMAGES: { badgeLogo: string }` (`content/defaults.ts`)
  - `type OwnerVars = { name: string; initials: string }`, `type CopyVars = EventVars & { owner: string; initials: string }`, `copyVars(lang: Lang, times: EventTimes, owner: OwnerVars): CopyVars` (`content/copy-vars.ts`)
  - `composeCopy(texts: CopyTexts, moments: Moment[], vars: TemplateVars, coverImage?: string): GraduationCopy` (`content/compose-copy.ts`)
  - Từ `@/lib/graduation/i18n`: `DEFAULT_TEXTS: Record<Lang, CopyTexts>`, `DEFAULT_MOMENT_TEXTS: Record<Lang, MomentText[]>`, `DEFAULT_MOMENTS: Record<Lang, Moment[]>`, `GRADUATION_COPY` (giữ nguyên tên), type `MomentText`.
  - Từ `lib/graduation/i18n/moments.ts`: `export const MOMENT_STYLE` (trước đây là hằng số nội bộ).

- [ ] **Step 1: Viết test mới** `tests/lib/graduation/content/default-texts.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { COPY_FIELDS } from "@/lib/graduation/content/fields";
import { allowedTokens } from "@/lib/graduation/content/fields/tokens";
import { getPath, leafKeys, type Tree } from "@/lib/graduation/content/paths";
import { templateTokens } from "@/lib/graduation/content/template";
import { DEFAULT_TEXTS, LANGS } from "@/lib/graduation/i18n";

describe.each(LANGS)("default %s texts", (lang) => {
  const texts = DEFAULT_TEXTS[lang] as unknown as Tree;

  it("cover exactly the registered fields", () => {
    expect(leafKeys(texts).sort()).toEqual(COPY_FIELDS.map((field) => field.key).sort());
  });

  it("only use tokens their field allows", () => {
    const misuses = COPY_FIELDS.flatMap((field) => {
      const value = getPath(texts, field.key);
      const items = Array.isArray(value) ? value : [value];
      return items.flatMap((item) =>
        templateTokens(String(item))
          .filter((token) => !allowedTokens(field).includes(token))
          .map((token) => `${field.key}: {${token}}`),
      );
    });
    expect(misuses).toEqual([]);
  });
});
```

Thêm vào cuối `describe("GRADUATION_COPY", …)` trong `tests/lib/graduation/i18n/i18n.test.ts`:
```ts
  it("renders the event date from the event times", () => {
    expect(GRADUATION_COPY.vi.rails.whenValue).toBe("Thứ Bảy 28.11.2026");
    expect(GRADUATION_COPY.en.rails.whenValue).toBe("Sat · Nov 28, 2026");
    expect(GRADUATION_COPY.vi.ends.day).toBe("Thứ Bảy, 28.11.2026");
    expect(GRADUATION_COPY.en.ends.day).toBe("Saturday, Nov 28, 2026");
    expect(GRADUATION_COPY.vi.narrator.farewell("Lan")).toBe("Hẹn gặp ngày 28.11.");
  });
  it("renders owner and call templates", () => {
    expect(GRADUATION_COPY.vi.meta.title).toBe("Thư mời tốt nghiệp – Võ Lê Quang Vinh");
    expect(GRADUATION_COPY.vi.met.andYou("Lan")).toBe("Và bạn, Lan");
    expect(GRADUATION_COPY.en.wishes.airMail("07")).toBe("Air Mail · Wish Nº 07");
    expect(GRADUATION_COPY.vi.ends.calendar.orOther("Lịch Apple")).toBe("hoặc dùng Lịch Apple");
    expect(GRADUATION_COPY.vi.card.author).toBe("— Vinh (Tom)");
    expect(GRADUATION_COPY.vi.ends.specialMessage).toBeUndefined();
  });
```

- [ ] **Step 2: Chạy test, xác nhận fail**

Run: `npx vitest run tests/lib/graduation/content/default-texts.test.ts tests/lib/graduation/i18n/i18n.test.ts`
Expected: FAIL (`DEFAULT_TEXTS` chưa có, `rails.whenValue` thiếu chỗ trống…).

- [ ] **Step 3: Sửa `lib/graduation/i18n/types.ts`**

Các thay đổi trong `GraduationCopy`, giữ nguyên mọi phần khác:
- `meta`: thêm `eventTitle: string`
- `header`: thêm `back: string`
- `card`: đổi thành `{ label: string; fig: string; greeting: string; body: string; author: string; keepScrolling: string; coverAlt: string; coverImage?: string }` (`author` không còn optional)
- `met`: thêm `polaroidCaption: (name: string) => string`
- `ends`: thêm `address: string`
- `finale`: thêm `dateMark: string`
- Thêm nhánh mới (đặt trước `narrator`):
  ```ts
  marks: { school: string; city: string; signature: string };
  png: {
    attend: string;
    faculty: string;
    guestFallback: string;
    qrWebTitle: string;
    qrWebBody: string;
    qrWebAlt: string;
    qrMapTitle: string;
    qrMapBody: string;
    qrMapAlt: string;
    footer: string;
  };
  ```
- Ngay dưới `export type Moment = …` thêm: `export type MomentText = Pick<Moment, "title" | "body">;`

- [ ] **Step 4: Tạo `lib/graduation/content/copy-texts.ts`**

```ts
import type { GraduationCopy } from "../i18n/types";

type Templated<T> = T extends (...args: never[]) => string
  ? string
  : T extends readonly string[]
    ? string[]
    : T extends object
      ? { [K in keyof T]-?: Templated<NonNullable<T[K]>> }
      : T;

type CopyShape = Omit<GraduationCopy, "met" | "card"> & {
  met: Omit<GraduationCopy["met"], "moments">;
  card: Omit<GraduationCopy["card"], "coverImage">;
};

export type CopyTexts = Templated<CopyShape>;
```

- [ ] **Step 5: Sửa `lib/graduation/i18n/moments.ts`**

```ts
import type { Moment, MomentText } from "./types";

export const MOMENT_STYLE = [
  { n: "01", year: "2022", color: "tomato", rot: -1.6, image: "/me.jpg" },
  { n: "02", year: "2023", color: "blue", rot: 1.4, image: "/me%202.jpg" },
  { n: "03", year: "2025", color: "jade", rot: -1.2, image: "/tma.webp" },
  { n: "04", year: "2026", color: "canary", rot: 1.8, image: "/portrait.jpg" },
] as const;

export const withMomentStyle = (text: readonly MomentText[]): Moment[] =>
  MOMENT_STYLE.map((style, i) => ({ ...style, ...text[i] }));
```
Giữ nguyên dòng doc comment hiện có phía trên `MOMENT_STYLE`.

- [ ] **Step 6: Viết lại `lib/graduation/i18n/copy/vi.ts`**

```ts
import type { CopyTexts } from "../../content/copy-texts";
import type { MomentText } from "../types";

export const viTexts: CopyTexts = {
  meta: {
    title: "Thư mời tốt nghiệp – {owner}",
    guestTitle: "Thư mời tốt nghiệp · {name}",
    description: "Bạn được mời đến dự lễ tốt nghiệp của mình.",
    eventTitle: "Lễ tốt nghiệp — {owner}",
  },
  header: { title: "Tốt nghiệp {year}", back: "Portfolio", musicUnavailable: "Không phát được nhạc", music: "Nhạc nền", switchLang: "Chọn ngôn ngữ" },
  rails: {
    when: "Thời gian",
    whenValue: "{weekday} {date}.{year}",
    where: "Địa điểm",
    whereValue: "Hội trường A5 · ĐH Bách Khoa",
    whereSub: "268 Lý Thường Kiệt · Q.10",
  },
  envelope: {
    airMail: "Thư mời",
    invitationNo: "Lễ tốt nghiệp {year}",
    to: "Gửi",
    cordially: "Trân trọng kính mời",
    from: "Từ: {owner}",
    returnTo: "Người gửi",
    faculty: "K22 · Khoa học Máy tính · HCMUT",
    guest: "Khách mời",
  },
  card: {
    label: "Thiệp mời",
    fig: "Fig · 01",
    greeting: "Xin chào,",
    body: "Mình là Quang Vinh. Sau bốn năm ở Bách Khoa, mình sắp khoác lên tấm áo cử nhân — và mình rất muốn có bạn ở đó.",
    author: "— Vinh (Tom)",
    keepScrolling: "Cuộn tiếp ↓",
    coverAlt: "Ảnh bìa",
  },
  stage: {
    coverKicker: "Bạn được mời",
    cover: { lead: "Ngày", accent: "tốt nghiệp." },
    greetKicker: "Lời chào",
    scrollHint: "Cuộn để mở thư",
  },
  met: {
    heading: { lead: "Bốn năm,", accent: "một hành trình." },
    intro: "Những tấm thẻ ghi dọc đường — ghim lại trên bảng, từ ngày đầu nhập học đến hôm nay.",
    andYou: "Và bạn, {name}",
    togetherCaption: "Mình & {name}",
    polaroidCaption: "{name} · {year}",
    defaultNote: "Ở đâu đó trên hành trình ấy, mình đã gặp bạn. Cảm ơn vì đã là một phần của câu chuyện.",
  },
  ends: {
    heading: { lead: "Và rồi,", accent: "tốt nghiệp." },
    intro: "Chương này khép lại bằng một buổi lễ — và sẽ thật ý nghĩa nếu được chia sẻ khoảnh khắc ấy cùng bạn.",
    stamp: ["Vé mời", "· Một ·", "Khách"],
    when: "Thời gian",
    day: "{weekday}, {date}.{year}",
    where: "Địa điểm",
    venue: "Hội trường A5, ĐH Bách Khoa",
    venueSub: "Trường ĐH Bách Khoa — ĐHQG-HCM",
    address: "268 Lý Thường Kiệt, Phường 14, Quận 10, TP. Hồ Chí Minh",
    notes: ["Trang phục · Lịch sự", "Gửi xe · Cổng Lý Thường Kiệt", "Chụp ảnh sau lễ"],
    specialMessage: "",
    directions: "Chỉ đường",
    addToCalendar: "Thêm vào lịch",
    calendar: { google: "Google Calendar", apple: "Lịch Apple", orOther: "hoặc dùng {calendar}" },
    guide: {
      tabsLabel: "Bản đồ và tham quan trường",
      loading: "Đang tải…",
      map: { tab: "Bản đồ", frameTitle: "Bản đồ đến hội trường", hint: "Ctrl + cuộn để phóng to · Bấm để dùng bản đồ", touchHint: "Chạm để dùng bản đồ" },
      tour: {
        tab: "Tham quan 360°",
        load: "Bắt đầu tham quan",
        open: "Mở toàn màn hình",
        frameTitle: "Tham quan 360° ĐH Bách Khoa",
        credit: { label: "Nguồn", owner: "Trường Đại học Bách Khoa – ĐHQG-HCM" },
      },
    },
  },
  rsvp: {
    heading: { lead: "Bạn sẽ", accent: "đến chứ?" },
    prompt: "Báo mình một tiếng để mình giữ chỗ nhé, {name}.",
    yes: "Mình sẽ đến",
    no: "Tiếc quá, không kịp",
    error: "Không gửi được, thử lại nhé",
    result: { yes: "✓ Đã nhận — hẹn gặp bạn ngày {date}!", no: "✓ Đã nhận — cảm ơn bạn đã báo" },
    stamp: "Sẽ đến · {date}.{year}",
    change: "Đổi ý",
    contact: { label: "Số điện thoại hoặc email", placeholder: "0901 234 567 hoặc ban@email.com" },
    reason: { label: "Lý do", placeholder: "Hôm đó mình bận…" },
    wish: { label: "Lời chúc", placeholder: "Vài lời gửi Vinh…" },
    optional: "không bắt buộc",
    submit: "Gửi",
    sending: "Đang gửi…",
    ownerPhone: "Cần gì cứ gọi mình",
    fieldErrors: {
      required: "Bạn điền giúp mình mục này nhé",
      invalid_contact: "Số điện thoại hoặc email chưa đúng",
      too_long: "Hơi dài, rút gọn giúp mình nhé",
    },
    letter: {
      to: "Gửi: {owner}",
      from: "Từ: {name}",
      sent: "Đã gửi thư hồi âm",
    },
  },
  wishes: {
    heading: { lead: "Một tổ ong", accent: "lời chúc." },
    intro: "Mỗi ô là một lời nhắn gửi tới mình. Bấm vào một ô — một chú ong sẽ mang lời chúc đến cho bạn.",
    loading: "[ đàn ong đang mang mật về tổ… ]",
    error: "[ không thể kết nối tới tổ ong lúc này ]",
    empty: "[ tổ ong đang chờ những lời chúc đầu tiên ]",
    mine: "Của bạn",
    count: "Lời chúc",
    wishFrom: "Lời chúc từ {name}",
    airMail: "Thư tay · Lời chúc Nº {n}",
    to: "Gửi",
    from: "Từ",
    close: "Đóng",
    zoomIn: "Phóng to",
    zoomOut: "Thu nhỏ",
    recenter: "Về giữa",
  },
  finale: {
    heading: { lead: "Hẹn gặp", accent: "bạn." },
    countdown: {
      days: "ngày",
      hours: "giờ",
      minutes: "phút",
      seconds: "giây",
      during: "Hôm nay là ngày ấy!",
      after: "Cảm ơn bạn đã đến chung vui!",
    },
    replyOf: "Thư hồi âm của {name}",
    status: {
      yes: "Sẽ đến chung vui",
      no: "Tiếc quá, vắng mặt",
    },
    noReply: "Bạn chưa gửi thư hồi âm",
    replyNow: "Viết hồi âm ngay ↑",
    downloadCard: "Tải ảnh thiệp mời (PNG)",
    backToTop: "Lên đầu trang",
    dateMark: "{date}.{year}",
  },
  gate: {
    dialogLabel: "Mở thiệp",
    wake: "Đánh thức chú ong để mở thiệp",
    tapBee: "chạm để mở thiệp",
    silent: "Vào không nhạc →",
    soundHint: "♪ Nên bật âm thanh",
    desktopHint: "Xem trên máy tính để có trải nghiệm tốt nhất",
    nowPlaying: "♪ Đang phát",
    beePreparing: "Đang chuẩn bị thư…",
    beeNotice: "{name}, bạn có thư mới.",
  },
  marks: { school: "HCMUT", city: "TP.HCM", signature: "{initials} · {year}" },
  png: {
    attend: "Đến tham dự Lễ tốt nghiệp Kỹ sư của {owner}",
    faculty: "K22 · Khoa học Máy tính · Trường ĐH Bách Khoa — ĐHQG-HCM",
    guestFallback: "Quý khách",
    qrWebTitle: "QUÉT XEM THIỆP",
    qrWebBody: "Trang web thiệp mời, gửi lời chúc & hồi âm",
    qrWebAlt: "QR Thiệp mời",
    qrMapTitle: "CHỈ ĐƯỜNG ĐẾN LỄ",
    qrMapBody: "Mở Google Maps chỉ đường đến Hội trường A5",
    qrMapAlt: "QR Chỉ đường",
    footer: "Rất vinh hạnh được đón tiếp bạn trong ngày vui này!",
  },
  narrator: {
    wave: "Chào {name}. Lật thư ra xem.",
    bow: "Cảm ơn bạn đã đến.",
    desk: "Bốn năm đại học. Kéo xuống xem tiếp.",
    cheer: "Phần này dành cho bạn.",
    point: "Địa điểm ở đây, có bản đồ và tour 360°.",
    toss: "Hồi âm cho mình, {name}.",
    play: "Lời chúc của mọi người.",
    farewell: "Hẹn gặp ngày {date}.",
  },
  footer: "Cảm ơn bạn đã đồng hành cùng mình trong hành trình này. Hẹn gặp bạn tại lễ tốt nghiệp!",
  notFound: {
    kicker: "404 · Trả lại người gửi",
    heading: { lead: "Thiệp này", accent: "không tồn tại." },
    body: "Kiểm tra lại đường link bạn nhận được nhé.",
  },
};

export const viMomentTexts: MomentText[] = [
  { title: "Nhập học Bách Khoa", body: "Bước chân vào Khoa học Máy tính — ĐHQG-HCM, Trường ĐH Bách Khoa." },
  { title: "Những đêm deadline", body: "Bài lab, đồ án và những dòng code đầu tiên chạy được lúc hai giờ sáng." },
  { title: "Thực tập đầu tiên", body: "Thực tập tại TMA Solutions — viết React thật cho khách hàng thật, học cách làm việc trong một đội Agile." },
  { title: "Đi làm & luận văn", body: "Front-end Developer ban ngày, TrackNest ban đêm — và chặng cuối của tấm bằng." },
];
```

**Kiểm tra trước khi ghi đè:** so từng chuỗi với file `vi.ts` hiện tại (`git show HEAD:lib/graduation/i18n/copy/vi.ts`). Mọi chuỗi không phải mẫu phải giống y hệt; chỉ các chỗ có `{…}` và các key mới là khác. Nếu file hiện tại đã khác nội dung trên (có người sửa sau khi plan được viết), giữ nội dung hiện tại và chỉ áp dụng các thay đổi mẫu/key mới.

- [ ] **Step 7: Viết lại `lib/graduation/i18n/copy/en.ts`**

```ts
import type { CopyTexts } from "../../content/copy-texts";
import type { MomentText } from "../types";

export const enTexts: CopyTexts = {
  meta: {
    title: "Graduation Invitation – {owner}",
    guestTitle: "Graduation invitation · {name}",
    description: "You're invited to celebrate my graduation.",
    eventTitle: "Graduation — {owner}",
  },
  header: { title: "Graduation {year}", back: "Portfolio", musicUnavailable: "Music unavailable", music: "Background music", switchLang: "Choose language" },
  rails: {
    when: "When",
    whenValue: "{weekdayShort} · {date}, {year}",
    where: "Where",
    whereValue: "Hall A5 · HCMUT",
    whereSub: "268 Ly Thuong Kiet · D.10",
  },
  envelope: {
    airMail: "Invitation",
    invitationNo: "Graduation {year}",
    to: "To",
    cordially: "Cordially invited",
    from: "From: {owner}",
    returnTo: "Return to",
    faculty: "K22 · Computer Science · HCMUT",
    guest: "Guest",
  },
  card: {
    label: "Invitation",
    fig: "Fig · 01",
    greeting: "Hello,",
    body: "I'm Quang Vinh. After four years at HCMUT, I'm finally graduating — and I'd love for you to be there.",
    author: "— Vinh (Tom)",
    keepScrolling: "Keep scrolling ↓",
    coverAlt: "Cover",
  },
  stage: {
    coverKicker: "You're invited",
    cover: { lead: "Graduation", accent: "day." },
    greetKicker: "Hello",
    scrollHint: "Scroll to open",
  },
  met: {
    heading: { lead: "Four years,", accent: "one journey." },
    intro: "Index cards from the road — pinned to the board, from the first day of school until today.",
    andYou: "And you, {name}",
    togetherCaption: "Us · {name}",
    polaroidCaption: "{name} · {year}",
    defaultNote: "Somewhere along the way, I met you. Thank you for being part of the story.",
  },
  ends: {
    heading: { lead: "And then,", accent: "graduation." },
    intro: "This chapter closes with a ceremony — and it would mean a lot to share it with you.",
    stamp: ["Admit", "· One ·", "Guest"],
    when: "When",
    day: "{weekday}, {date}, {year}",
    where: "Where",
    venue: "Hall A5, HCMUT",
    venueSub: "Ho Chi Minh City University of Technology",
    address: "268 Ly Thuong Kiet, Ward 14, District 10, Ho Chi Minh City",
    notes: ["Dress code · Smart casual", "Parking · Ly Thuong Kiet gate", "Photos after the ceremony"],
    specialMessage: "",
    directions: "Directions",
    addToCalendar: "Add to calendar",
    calendar: { google: "Google Calendar", apple: "Apple Calendar", orOther: "or use {calendar}" },
    guide: {
      tabsLabel: "Map and campus tour",
      loading: "Loading…",
      map: { tab: "Map", frameTitle: "Map to the hall", hint: "Ctrl + scroll to zoom · Click to use the map", touchHint: "Tap to use the map" },
      tour: {
        tab: "360° tour",
        load: "Start the tour",
        open: "Open full screen",
        frameTitle: "HCMUT 360° campus tour",
        credit: { label: "Source", owner: "Ho Chi Minh City University of Technology – VNU-HCM" },
      },
    },
  },
  rsvp: {
    heading: { lead: "Will you", accent: "be there?" },
    prompt: "Let me know so I can save you a seat, {name}.",
    yes: "I'll be there",
    no: "Sorry, can't make it",
    error: "Couldn't send, please try again",
    result: { yes: "✓ Postmarked — see you on {date}!", no: "✓ Noted — thanks for letting me know" },
    stamp: "Attending · {date}",
    change: "Change answer",
    contact: { label: "Phone or email", placeholder: "+84 901 234 567 or you@email.com" },
    reason: { label: "Reason", placeholder: "I'm busy that day…" },
    wish: { label: "Your wishes", placeholder: "A few words for Vinh…" },
    optional: "optional",
    submit: "Send",
    sending: "Sending…",
    ownerPhone: "Questions? Call me",
    fieldErrors: {
      required: "Please fill this in",
      invalid_contact: "That doesn't look like a phone number or email",
      too_long: "That's a bit long, please shorten it",
    },
    letter: {
      to: "To: {owner}",
      from: "From: {name}",
      sent: "Reply letter sent",
    },
  },
  wishes: {
    heading: { lead: "A hive of", accent: "wishes." },
    intro: "Each cell is a note someone left for me. Tap one — a little bee will carry the wish over to you.",
    loading: "[ the bees are bringing the honey home… ]",
    error: "[ can't reach the hive right now ]",
    empty: "[ the hive is waiting for its first wishes ]",
    mine: "Yours",
    count: "Wishes",
    wishFrom: "Wish from {name}",
    airMail: "Air Mail · Wish Nº {n}",
    to: "To",
    from: "From",
    close: "Close",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    recenter: "Recenter",
  },
  finale: {
    heading: { lead: "See you", accent: "soon." },
    countdown: {
      days: "days",
      hours: "hours",
      minutes: "mins",
      seconds: "secs",
      during: "Today is the day!",
      after: "Thank you for celebrating with me!",
    },
    replyOf: "Reply from {name}",
    status: {
      yes: "Attending",
      no: "Can't make it",
    },
    noReply: "You haven't replied yet",
    replyNow: "Send reply now ↑",
    downloadCard: "Download invitation card (PNG)",
    backToTop: "Back to top",
    dateMark: "{date}, {year}",
  },
  gate: {
    dialogLabel: "Open invitation",
    wake: "Wake the bee to open your invitation",
    tapBee: "tap to open",
    silent: "Enter silently →",
    soundHint: "♪ Sound on",
    desktopHint: "Best viewed on a desktop",
    nowPlaying: "♪ Now playing",
    beePreparing: "Preparing your letter…",
    beeNotice: "{name}, you've got mail.",
  },
  marks: { school: "HCMUT", city: "TP.HCM", signature: "{initials} · {year}" },
  png: {
    attend: "to the engineering graduation of {owner}",
    faculty: "K22 · Computer Science · HCMUT — VNU-HCM",
    guestFallback: "Dear guest",
    qrWebTitle: "SCAN FOR THE INVITATION",
    qrWebBody: "Invitation site, wishes & reply",
    qrWebAlt: "Invitation QR code",
    qrMapTitle: "DIRECTIONS",
    qrMapBody: "Open Google Maps directions to Hall A5",
    qrMapAlt: "Directions QR code",
    footer: "It would be an honour to welcome you on this happy day!",
  },
  narrator: {
    wave: "Hi {name}. Flip the letter over.",
    bow: "Thanks for coming.",
    desk: "Four years of university. Keep scrolling.",
    cheer: "This part is for you.",
    point: "The venue, with a map and a 360° tour.",
    toss: "Send me a reply, {name}.",
    play: "Wishes from everyone.",
    farewell: "See you on {date}.",
  },
  footer: "Thanks for celebrating with me",
  notFound: {
    kicker: "404 · Return to sender",
    heading: { lead: "This invitation", accent: "doesn't exist." },
    body: "Please double-check the link you received.",
  },
};

export const enMomentTexts: MomentText[] = [
  { title: "Freshman at HCMUT", body: "Stepping into Computer Science at Ho Chi Minh City University of Technology — VNU-HCM." },
  { title: "Late-night deadlines", body: "Labs, projects, and the first lines of code that finally ran at 2 a.m." },
  { title: "First internship", body: "Interning at TMA Solutions — writing real React for real clients and learning to work in an Agile team." },
  { title: "Work meets thesis", body: "Front-end Developer by day, TrackNest by night — and the final stretch of the degree." },
];
```

Lưu ý: `rsvp.letter.to` bản EN trước đây là "To: Vo Le Quang Vinh" (không dấu), giờ thành "To: Võ Lê Quang Vinh" (có dấu, theo `{owner}`). Đây là thay đổi có chủ đích. Cũng làm bước **Kiểm tra trước khi ghi đè** như Step 6, với file `en.ts`.

- [ ] **Step 8: Tạo `defaults.ts`, `copy-vars.ts`, `compose-copy.ts`**

`lib/graduation/content/defaults.ts`:
```ts
export const DEFAULT_OWNER = { name: "Võ Lê Quang Vinh", initials: "QV", website: "vinhvolequang.io.vn" } as const;
export const DEFAULT_IMAGES = { badgeLogo: "/01_logobachkhoatoi.webp" } as const;
```

`lib/graduation/content/copy-vars.ts`:
```ts
import type { Lang } from "../i18n/types";
import { eventVars, type EventTimes, type EventVars } from "./event-vars";

export type OwnerVars = { name: string; initials: string };
export type CopyVars = EventVars & { owner: string; initials: string };

export const copyVars = (lang: Lang, times: EventTimes, owner: OwnerVars): CopyVars => ({
  ...eventVars(times, lang),
  owner: owner.name,
  initials: owner.initials,
});
```

`lib/graduation/content/compose-copy.ts`:
```ts
import type { GraduationCopy, Moment } from "../i18n/types";
import { buildCopy } from "./build-copy";
import type { CopyTexts } from "./copy-texts";
import { COPY_FIELDS } from "./fields";
import type { Tree } from "./paths";
import type { TemplateVars } from "./template";

export function composeCopy(texts: CopyTexts, moments: Moment[], vars: TemplateVars, coverImage?: string): GraduationCopy {
  const built = buildCopy(texts as unknown as Tree, COPY_FIELDS, vars) as unknown as GraduationCopy;
  return { ...built, met: { ...built.met, moments }, card: { ...built.card, coverImage } };
}
```

- [ ] **Step 9: Viết lại `lib/graduation/i18n/index.ts`**

```ts
import { composeCopy } from "../content/compose-copy";
import type { CopyTexts } from "../content/copy-texts";
import { copyVars } from "../content/copy-vars";
import { DEFAULT_OWNER } from "../content/defaults";
import { GRADUATION_EVENT } from "../event";
import { enMomentTexts, enTexts } from "./copy/en";
import { viMomentTexts, viTexts } from "./copy/vi";
import { withMomentStyle } from "./moments";
import type { GraduationCopy, Lang, Moment, MomentText } from "./types";

export const DEFAULT_TEXTS: Record<Lang, CopyTexts> = { vi: viTexts, en: enTexts };
export const DEFAULT_MOMENT_TEXTS: Record<Lang, MomentText[]> = { vi: viMomentTexts, en: enMomentTexts };
export const DEFAULT_MOMENTS: Record<Lang, Moment[]> = { vi: withMomentStyle(viMomentTexts), en: withMomentStyle(enMomentTexts) };

const defaultCopy = (lang: Lang): GraduationCopy =>
  composeCopy(DEFAULT_TEXTS[lang], DEFAULT_MOMENTS[lang], copyVars(lang, GRADUATION_EVENT, DEFAULT_OWNER));

export const GRADUATION_COPY: Record<Lang, GraduationCopy> = { vi: defaultCopy("vi"), en: defaultCopy("en") };

export { DEFAULT_LANG, LANG_COOKIE, LANGS, parseLang } from "./config";
export type { Credit, Field, GraduationCopy, GuideTab, Heading, Lang, Moment, MomentText, VenueGuideCopy } from "./types";
```

- [ ] **Step 10: Sửa `lib/graduation/resolve-invitation-copy.ts`**

Đổi dòng `author: custom.envelope?.cardAuthor,` thành:
```ts
      author: custom.envelope?.cardAuthor || baseCopy.card.author,
```

- [ ] **Step 11: Chạy test và tsc**

Run: `npx vitest run tests/lib/graduation` → PASS (kể cả `resolve-invitation-copy.test.ts`, `calendar.test.ts`, `ics.test.ts`).
Run: `npx tsc --noEmit -p .` → không lỗi. Nếu `tsc` báo `CopyTexts` không khớp (ví dụ key thiếu), sửa `vi.ts`/`en.ts` cho khớp kiểu, **không** nới kiểu.

- [ ] **Step 12: Kiểm tra trên trình duyệt**

Mở `http://localhost:3000/graduation/<id khách bất kỳ>` (lấy id ở `/admin/graduation`). Kiểm tra rail trái vẫn hiện "Thứ Bảy 28.11.2026", nút "Đổi ý"/RSVP vẫn đúng, chuyển EN thấy "Sat · Nov 28, 2026". Trang không được có chữ `{` nào: chạy trong DevTools `document.body.innerText.includes("{")` → `false`.

- [ ] **Step 13: Commit** `refactor(graduation): default copy as templates with event and owner placeholders`. `git add` tất cả file ở mục Files.

---

### Task 10: `apply-overrides.ts` và `flatten-texts.ts`

**Files:**
- Create: `lib/graduation/content/apply-overrides.ts`
- Create: `lib/graduation/content/flatten-texts.ts`
- Test: `tests/lib/graduation/content/apply-overrides.test.ts`
- Test: `tests/lib/graduation/content/flatten-texts.test.ts`

**Interfaces:**
- Consumes: `CopyTexts`, `DEFAULT_TEXTS`, `COPY_FIELDS`, `CopyField`, `setPath`, `getPath`, `Tree`, `splitList`, `joinList`, `CopyOverrides`.
- Produces:
  - `applyOverrides(texts: CopyTexts, overrides: CopyOverrides | undefined, fields?: readonly CopyField[]): CopyTexts`. Mặc định `fields = COPY_FIELDS`. Bỏ qua key không có trong `fields`, giá trị trống hoặc chỉ khoảng trắng, và danh sách không còn dòng nào.
  - `flattenTexts(texts: CopyTexts, fields?: readonly CopyField[]): Record<string, string>`. Danh sách được nối bằng `\n`.

- [ ] **Step 1: Viết test**

`apply-overrides.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { applyOverrides } from "@/lib/graduation/content/apply-overrides";
import type { CopyField } from "@/lib/graduation/content/fields";
import { DEFAULT_TEXTS } from "@/lib/graduation/i18n";

const base = DEFAULT_TEXTS.vi;

describe("applyOverrides", () => {
  it("returns the same texts when there is nothing to apply", () => {
    expect(applyOverrides(base, undefined)).toBe(base);
  });
  it("replaces a nested string", () => {
    expect(applyOverrides(base, { "met.intro": "Mới" }).met.intro).toBe("Mới");
  });
  it("trims values", () => {
    expect(applyOverrides(base, { "met.intro": "  Mới  " }).met.intro).toBe("Mới");
  });
  it("ignores blank and whitespace-only values", () => {
    expect(applyOverrides(base, { "met.intro": "   " }).met.intro).toBe(base.met.intro);
  });
  it("splits list fields by line", () => {
    expect(applyOverrides(base, { "ends.notes": "A\n\nB" }).ends.notes).toEqual(["A", "B"]);
  });
  it("ignores a list made only of blank lines", () => {
    expect(applyOverrides(base, { "ends.notes": "\n \n" }).ends.notes).toEqual(base.ends.notes);
  });
  it("ignores keys that are not fields", () => {
    expect(applyOverrides(base, { "met.moments": "x", nope: "y" })).toEqual(base);
  });
  it("only applies the given fields", () => {
    const onlyIntro: CopyField[] = [{ key: "met.intro", section: "met", label: "", kind: "text" }];
    const result = applyOverrides(base, { "met.intro": "A", "card.body": "B" }, onlyIntro);
    expect(result.met.intro).toBe("A");
    expect(result.card.body).toBe(base.card.body);
  });
  it("does not mutate the defaults", () => {
    applyOverrides(base, { "met.intro": "Mới" });
    expect(DEFAULT_TEXTS.vi.met.intro).not.toBe("Mới");
  });
});
```

`flatten-texts.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { COPY_FIELDS } from "@/lib/graduation/content/fields";
import { flattenTexts } from "@/lib/graduation/content/flatten-texts";
import { DEFAULT_TEXTS } from "@/lib/graduation/i18n";

describe("flattenTexts", () => {
  const flat = flattenTexts(DEFAULT_TEXTS.vi);
  it("has one entry per field", () => {
    expect(Object.keys(flat).sort()).toEqual(COPY_FIELDS.map((field) => field.key).sort());
  });
  it("keeps templates raw", () => {
    expect(flat["met.andYou"]).toBe("Và bạn, {name}");
  });
  it("joins lists by line", () => {
    expect(flat["ends.stamp"]).toBe("Vé mời\n· Một ·\nKhách");
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận fail.**

- [ ] **Step 3: Viết code**

`apply-overrides.ts`:
```ts
import type { CopyTexts } from "./copy-texts";
import { COPY_FIELDS, type CopyField } from "./fields";
import { splitList } from "./list-format";
import type { CopyOverrides } from "./overrides";
import { setPath, type Tree } from "./paths";

function overrideValue(field: CopyField, raw: string | undefined): string | string[] | undefined {
  const text = raw?.trim();
  if (!text) return undefined;
  if (field.kind !== "list") return text;
  const items = splitList(text);
  return items.length > 0 ? items : undefined;
}

export function applyOverrides(texts: CopyTexts, overrides: CopyOverrides | undefined, fields: readonly CopyField[] = COPY_FIELDS): CopyTexts {
  if (!overrides) return texts;
  const tree = fields.reduce<Tree>((acc, field) => {
    const value = overrideValue(field, overrides[field.key]);
    return value === undefined ? acc : setPath(acc, field.key, value);
  }, texts as unknown as Tree);
  return tree as unknown as CopyTexts;
}
```

`flatten-texts.ts`:
```ts
import type { CopyTexts } from "./copy-texts";
import { COPY_FIELDS, type CopyField } from "./fields";
import { joinList } from "./list-format";
import { getPath, type Tree } from "./paths";

const asText = (value: unknown): string => (Array.isArray(value) ? joinList(value.map(String)) : typeof value === "string" ? value : "");

export const flattenTexts = (texts: CopyTexts, fields: readonly CopyField[] = COPY_FIELDS): Record<string, string> =>
  Object.fromEntries(fields.map((field) => [field.key, asText(getPath(texts as unknown as Tree, field.key))]));
```

- [ ] **Step 4: Chạy test** → PASS.

- [ ] **Step 5: Commit** `feat(graduation): apply flat copy overrides onto default texts`

---


### Task 11: Kiểu dữ liệu settings và custom khách; mở rộng `GraduationEvent`

Task này chỉ có kiểu dữ liệu, nên không có test riêng; kiểm bằng `tsc` và chạy lại test hiện có.

**Files:**
- Create: `lib/graduation/content/settings-types.ts`
- Modify: `lib/graduation/event.ts`

**Interfaces:**
- Produces (`settings-types.ts`):
  ```ts
  type LocalizedMomentText = Partial<MomentText>;
  type SettingsMoment = { year: string; image: string; color?: RisoColor; vi?: LocalizedMomentText; en?: LocalizedMomentText };
  type OwnerSettings = { name?: string; initials?: string; website?: string; phone?: string };
  type EventSettings = { start?: string; end?: string; mapEmbedUrl?: string; mapLinkUrl?: string; virtualTourUrl?: string; virtualTourOwnerUrl?: string; musicYoutubeId?: string };
  type ImageSettings = { coverImage?: string; togetherPhoto?: string; badgeLogo?: string };
  type GraduationSettingsContent = { owner?: OwnerSettings; event?: EventSettings; images?: ImageSettings; moments?: SettingsMoment[]; copy?: Partial<Record<Lang, CopyOverrides>> };
  type GuestContent = {
    vi?: CopyOverrides; en?: CopyOverrides;
    images?: Pick<ImageSettings, "coverImage" | "togetherPhoto">;
    moments?: SettingsMoment[];
    event?: Pick<EventSettings, "start" | "end">;
    music?: { youtubeId?: string };
  };
  ```
- Produces (`event.ts`): `GraduationEvent` có thêm `year: string` và `mapLinkUrl: string`.

- [ ] **Step 1: Tạo `lib/graduation/content/settings-types.ts`**

```ts
import type { RisoColor } from "../event";
import type { Lang, MomentText } from "../i18n/types";
import type { CopyOverrides } from "./overrides";

export type LocalizedMomentText = Partial<MomentText>;

export type SettingsMoment = {
  year: string;
  image: string;
  color?: RisoColor;
  vi?: LocalizedMomentText;
  en?: LocalizedMomentText;
};

export type OwnerSettings = { name?: string; initials?: string; website?: string; phone?: string };

export type EventSettings = {
  start?: string;
  end?: string;
  mapEmbedUrl?: string;
  mapLinkUrl?: string;
  virtualTourUrl?: string;
  virtualTourOwnerUrl?: string;
  musicYoutubeId?: string;
};

export type ImageSettings = { coverImage?: string; togetherPhoto?: string; badgeLogo?: string };

export type GraduationSettingsContent = {
  owner?: OwnerSettings;
  event?: EventSettings;
  images?: ImageSettings;
  moments?: SettingsMoment[];
  copy?: Partial<Record<Lang, CopyOverrides>>;
};

export type GuestContent = {
  vi?: CopyOverrides;
  en?: CopyOverrides;
  images?: Pick<ImageSettings, "coverImage" | "togetherPhoto">;
  moments?: SettingsMoment[];
  event?: Pick<EventSettings, "start" | "end">;
  music?: { youtubeId?: string };
};
```

- [ ] **Step 2: Sửa `lib/graduation/event.ts`**

Trong `type GraduationEvent` thêm, ngay dưới `endUtc: string;`:
```ts
  year: string;
```
và ngay dưới `mapEmbedUrl: string;`:
```ts
  /** Google Maps link the printable card's QR code opens. */
  mapLinkUrl: string;
```
Trong `GRADUATION_EVENT` thêm, cùng vị trí tương ứng:
```ts
  year: "2026",
```
```ts
  mapLinkUrl: "https://www.google.com/maps/search/?api=1&query=10.774599,106.659381",
```
(Giá trị lấy từ `MAP_URL` trong `app/graduation/[guest_id]/card/route.tsx:21`.) Comment trên `mapLinkUrl` là comment hợp lệ, theo đúng kiểu comment của `mapEmbedUrl` ngay trên.

- [ ] **Step 3: Kiểm tra**

Run: `npx tsc --noEmit -p .` → không lỗi.
Run: `npx vitest run tests/lib/graduation` → PASS.

- [ ] **Step 4: Commit** `feat(graduation): settings and bilingual guest content types`

---

### Task 12: `settings-rules.ts`

Các schema zod nhỏ, dùng chung cho validate settings, validate custom khách và đọc dễ dãi từ DB.

**Files:**
- Create: `lib/graduation/content/settings-rules.ts`
- Modify: `lib/graduation/guest-custom-schema.ts` (bỏ khai báo `risoColorSchema`, import từ `settings-rules`, rồi export lại để code cũ không đổi)
- Modify: `lib/graduation/guest-schema.ts` (bỏ hàm `blankToUndefined` cục bộ, import từ `settings-rules`)
- Test: `tests/lib/graduation/content/settings-rules.test.ts`

**Kiểm tra trước:**
```bash
node -e "console.log(require('zod/package.json').version)"
node -e "const { z } = require('zod'); console.log(typeof z.iso.datetime)"
```
Expected: `4.x.x` và `function`. Nếu khác thì dừng lại và hỏi.

**Interfaces:**
- Produces:
  - `blankToUndefined(value: unknown): unknown`
  - `optionalField<T extends z.ZodType>(schema: T)`: chuỗi trống thành `undefined`, rồi thành optional
  - `LIMITS = { copy: 2000, ownerName: 80, initials: 4, url: 500, phone: 30, moments: 12, year: 10, momentTitle: 120, momentBody: 600 } as const`
  - `risoColorSchema`, `httpsUrlSchema`, `imageUrlSchema`, `isoDateTimeSchema`, `youtubeIdSchema`, `mapEmbedUrlSchema`
  - `ownerSchema`, `eventTimesShape`, `eventSchema`, `imagesSchema`, `guestImagesSchema`, `momentSchema`, `momentsSchema`, `musicSchema`

- [ ] **Step 1: Viết test**

```ts
import { describe, expect, it } from "vitest";
import {
  eventSchema,
  imageUrlSchema,
  isoDateTimeSchema,
  mapEmbedUrlSchema,
  momentSchema,
  ownerSchema,
  youtubeIdSchema,
} from "@/lib/graduation/content/settings-rules";

describe("settings rules", () => {
  it("turns blank owner fields into undefined and trims the rest", () => {
    expect(ownerSchema.parse({ name: "  Vinh ", initials: "" })).toEqual({ name: "Vinh" });
  });
  it("caps initials", () => {
    expect(ownerSchema.safeParse({ initials: "ABCDE" }).success).toBe(false);
  });
  it("accepts site-relative and https images only", () => {
    expect(imageUrlSchema.safeParse("/me.jpg").success).toBe(true);
    expect(imageUrlSchema.safeParse("https://blob.vercel-storage.com/a.jpg").success).toBe(true);
    expect(imageUrlSchema.safeParse("http://x.com/a.jpg").success).toBe(false);
  });
  it("accepts ISO instants with milliseconds", () => {
    expect(isoDateTimeSchema.safeParse("2026-11-28T09:30:00.000Z").success).toBe(true);
    expect(isoDateTimeSchema.safeParse("28/11/2026").success).toBe(false);
  });
  it("requires an 11-character YouTube id", () => {
    expect(youtubeIdSchema.safeParse("hfavqkBrwXI").success).toBe(true);
    expect(youtubeIdSchema.safeParse("https://youtu.be/hfavqkBrwXI").success).toBe(false);
  });
  it("requires a Google Maps embed link for the map", () => {
    expect(mapEmbedUrlSchema.safeParse("https://www.google.com/maps/embed?pb=1").success).toBe(true);
    expect(mapEmbedUrlSchema.safeParse("https://maps.app.goo.gl/x").success).toBe(false);
  });
  it("rejects non-https tour links", () => {
    expect(eventSchema.safeParse({ virtualTourUrl: "http://x" }).success).toBe(false);
  });
  it("lets a moment keep an empty image", () => {
    expect(momentSchema.parse({ year: "2024", image: "" })).toEqual({ year: "2024", image: "" });
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận fail.**

- [ ] **Step 3: Viết code** `lib/graduation/content/settings-rules.ts`

```ts
import { z } from "zod";

export const LIMITS = {
  copy: 2000,
  ownerName: 80,
  initials: 4,
  url: 500,
  phone: 30,
  moments: 12,
  year: 10,
  momentTitle: 120,
  momentBody: 600,
} as const;

export const blankToUndefined = (value: unknown) => (typeof value === "string" && value.trim() === "" ? undefined : value);

export const optionalField = <T extends z.ZodType>(schema: T) => z.preprocess(blankToUndefined, schema.optional());

const text = (max: number) => z.string().trim().max(max, `Tối đa ${max} ký tự`);
const IMAGE_PATH = /^(\/|https:\/\/)\S+$/;

export const risoColorSchema = z.enum(["tomato", "blue", "jade", "canary"]);
export const httpsUrlSchema = text(LIMITS.url).regex(/^https:\/\/\S+$/, "Link phải bắt đầu bằng https://");
export const imageUrlSchema = text(LIMITS.url).regex(IMAGE_PATH, "Ảnh phải là đường dẫn bắt đầu bằng / hoặc https://");
export const isoDateTimeSchema = z.iso.datetime({ error: "Thời gian không hợp lệ" });
export const youtubeIdSchema = z.string().trim().regex(/^[A-Za-z0-9_-]{11}$/, "ID YouTube gồm đúng 11 ký tự");
export const mapEmbedUrlSchema = httpsUrlSchema.refine(
  (value) => value.startsWith("https://www.google.com/maps/embed"),
  "Dùng link nhúng của Google Maps (Chia sẻ → Nhúng bản đồ)",
);

export const ownerSchema = z.object({
  name: optionalField(text(LIMITS.ownerName)),
  initials: optionalField(text(LIMITS.initials)),
  website: optionalField(text(LIMITS.url)),
  phone: optionalField(text(LIMITS.phone)),
});

export const eventTimesShape = {
  start: optionalField(isoDateTimeSchema),
  end: optionalField(isoDateTimeSchema),
};

export const eventSchema = z.object({
  ...eventTimesShape,
  mapEmbedUrl: optionalField(mapEmbedUrlSchema),
  mapLinkUrl: optionalField(httpsUrlSchema),
  virtualTourUrl: optionalField(httpsUrlSchema),
  virtualTourOwnerUrl: optionalField(httpsUrlSchema),
  musicYoutubeId: optionalField(youtubeIdSchema),
});

export const imagesSchema = z.object({
  coverImage: optionalField(imageUrlSchema),
  togetherPhoto: optionalField(imageUrlSchema),
  badgeLogo: optionalField(imageUrlSchema),
});

export const guestImagesSchema = imagesSchema.pick({ coverImage: true, togetherPhoto: true });

const momentTextSchema = z.object({
  title: optionalField(text(LIMITS.momentTitle)),
  body: optionalField(text(LIMITS.momentBody)),
});

export const momentSchema = z.object({
  year: text(LIMITS.year),
  image: z
    .string()
    .trim()
    .max(LIMITS.url)
    .refine((value) => value === "" || IMAGE_PATH.test(value), "Ảnh phải là đường dẫn bắt đầu bằng / hoặc https://"),
  color: risoColorSchema.optional(),
  vi: momentTextSchema.optional(),
  en: momentTextSchema.optional(),
});

export const momentsSchema = z.array(momentSchema).max(LIMITS.moments, `Tối đa ${LIMITS.moments} kỷ niệm`);

export const musicSchema = z.object({ youtubeId: optionalField(youtubeIdSchema) });
```

- [ ] **Step 4: Dùng lại trong code cũ**

`lib/graduation/guest-custom-schema.ts`: xóa dòng `export const risoColorSchema = z.enum([...]);`, thêm
```ts
import { risoColorSchema } from "./content/settings-rules";

export { risoColorSchema };
```
`lib/graduation/guest-schema.ts`: xóa khai báo `const blankToUndefined = …` và thêm `import { blankToUndefined } from "./content/settings-rules";`.

- [ ] **Step 5: Chạy test**

Run: `npx vitest run tests/lib/graduation` → PASS. Run: `npx tsc --noEmit -p .` → không lỗi.

- [ ] **Step 6: Commit** `feat(graduation): shared zod rules for settings and guest content`

---

### Task 13: `copy-entry-rules.ts`

**Files:**
- Create: `lib/graduation/content/copy-entry-rules.ts`
- Test: `tests/lib/graduation/content/copy-entry-rules.test.ts`

**Interfaces:**
- Consumes: `CopyField`, `COPY_FIELD_BY_KEY`, `allowedTokens`, `templateTokens`, `LIMITS`.
- Produces:
  - `copyEntryError(field: CopyField | undefined, value: string): string | null`
  - `copyOverridesSchema(fields: readonly CopyField[])`: schema zod nhận `Record<string, string>`, trim, bỏ giá trị trống, báo lỗi theo key.

- [ ] **Step 1: Viết test**

```ts
import { describe, expect, it } from "vitest";
import { copyEntryError, copyOverridesSchema } from "@/lib/graduation/content/copy-entry-rules";
import { COPY_FIELDS, COPY_FIELD_BY_KEY } from "@/lib/graduation/content/fields";

describe("copyEntryError", () => {
  it("accepts allowed tokens", () => {
    expect(copyEntryError(COPY_FIELD_BY_KEY.get("met.andYou"), "Hi {name}, {year}")).toBeNull();
  });
  it("rejects unknown fields", () => {
    expect(copyEntryError(undefined, "x")).toBe("Trường không tồn tại");
  });
  it("names the unsupported tokens", () => {
    expect(copyEntryError(COPY_FIELD_BY_KEY.get("met.intro"), "{name} {nam}")).toBe("Chỗ trống không hỗ trợ: {name}, {nam}");
  });
  it("is case-sensitive about tokens", () => {
    expect(copyEntryError(COPY_FIELD_BY_KEY.get("met.andYou"), "{Name}")).toBe("Chỗ trống không hỗ trợ: {Name}");
  });
  it("caps the length", () => {
    expect(copyEntryError(COPY_FIELD_BY_KEY.get("met.intro"), "x".repeat(2001))).toBe("Tối đa 2000 ký tự");
  });
});

describe("copyOverridesSchema", () => {
  const schema = copyOverridesSchema(COPY_FIELDS);
  it("trims and drops blank entries", () => {
    expect(schema.parse({ "met.intro": "  A ", "card.body": "  " })).toEqual({ "met.intro": "A" });
  });
  it("reports errors under the field key", () => {
    const result = schema.safeParse({ "met.intro": "{nam}" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(["met.intro"]);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận fail.**

- [ ] **Step 3: Viết code**

```ts
import { z } from "zod";
import type { CopyField } from "./fields";
import { allowedTokens } from "./fields/tokens";
import { LIMITS } from "./settings-rules";
import { templateTokens } from "./template";

export function copyEntryError(field: CopyField | undefined, value: string): string | null {
  if (!field) return "Trường không tồn tại";
  if (value.length > LIMITS.copy) return `Tối đa ${LIMITS.copy} ký tự`;
  const allowed = allowedTokens(field);
  const unsupported = templateTokens(value).filter((token) => !allowed.includes(token));
  return unsupported.length > 0 ? `Chỗ trống không hỗ trợ: ${unsupported.map((token) => `{${token}}`).join(", ")}` : null;
}

const dropBlank = (entries: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(entries)
      .map(([key, value]) => [key, value.trim()] as const)
      .filter(([, value]) => value !== ""),
  );

export function copyOverridesSchema(fields: readonly CopyField[]) {
  const byKey = new Map(fields.map((field) => [field.key, field]));
  return z
    .record(z.string(), z.string())
    .transform(dropBlank)
    .superRefine((entries, ctx) => {
      for (const [key, value] of Object.entries(entries)) {
        const message = copyEntryError(byKey.get(key), value);
        if (message) ctx.addIssue({ code: "custom", path: [key], message });
      }
    });
}
```

Lưu ý: test `names the unsupported tokens` kỳ vọng `{name}` bị báo lỗi ở `met.intro`, vì `met.intro` không có `call`.

- [ ] **Step 4: Chạy test** → PASS.

- [ ] **Step 5: Commit** `feat(graduation): validate copy overrides against the field registry`

---

### Task 14: `issue-paths.ts` và `validate-settings.ts`

**Files:**
- Create: `lib/graduation/content/issue-paths.ts`
- Create: `lib/graduation/content/validate-settings.ts`
- Test: `tests/lib/graduation/content/validate-settings.test.ts`

**Interfaces:**
- Consumes: `ownerSchema`, `eventSchema`, `imagesSchema`, `momentsSchema` (Task 12), `copyOverridesSchema` (Task 13), `COPY_FIELDS`, `GRADUATION_EVENT`, `GraduationSettingsContent`.
- Produces:
  - `issuesToFieldErrors(issues: readonly { path: readonly PropertyKey[]; message: string }[]): Record<string, string>`. Lấy lỗi đầu tiên cho mỗi đường dẫn, nối đường dẫn bằng `.`.
  - `type SettingsValidation = { ok: true; data: GraduationSettingsContent } | { ok: false; fieldErrors: Record<string, string> }`
  - `validateSettings(raw: unknown): SettingsValidation`
  - `endAfterStart(start: string | undefined, end: string | undefined): boolean`. Dùng lại ở Task 16.

- [ ] **Step 1: Viết test**

```ts
import { describe, expect, it } from "vitest";
import { validateSettings } from "@/lib/graduation/content/validate-settings";

const errorsOf = (raw: unknown) => {
  const result = validateSettings(raw);
  return result.ok ? {} : result.fieldErrors;
};

describe("validateSettings", () => {
  it("accepts an empty object", () => {
    expect(validateSettings({})).toEqual({ ok: true, data: {} });
  });
  it("accepts and trims a full payload", () => {
    const result = validateSettings({
      owner: { name: " Vinh " },
      event: { start: "2026-12-01T02:00:00.000Z", end: "2026-12-01T04:00:00.000Z" },
      copy: { vi: { "met.intro": " Xin chào " }, en: { "met.intro": "Hello" } },
      moments: [{ year: "2024", image: "", vi: { title: "A" } }],
    });
    expect(result.ok && result.data.owner?.name).toBe("Vinh");
    expect(result.ok && result.data.copy?.vi?.["met.intro"]).toBe("Xin chào");
  });
  it("reports unknown copy keys per language", () => {
    expect(errorsOf({ copy: { vi: { nope: "x" } } })).toEqual({ "copy.vi.nope": "Trường không tồn tại" });
  });
  it("reports unsupported tokens", () => {
    expect(errorsOf({ copy: { en: { "met.andYou": "And {nam}" } } })["copy.en.met.andYou"]).toContain("{nam}");
  });
  it("requires the end after the start", () => {
    expect(errorsOf({ event: { start: "2026-12-01T04:00:00.000Z", end: "2026-12-01T02:00:00.000Z" } })).toHaveProperty("event.end");
  });
  it("checks a lone end against the default start", () => {
    expect(errorsOf({ event: { end: "2026-01-01T00:00:00.000Z" } })).toHaveProperty("event.end");
  });
  it("reports invalid links", () => {
    expect(errorsOf({ event: { virtualTourUrl: "http://x" } })).toHaveProperty("event.virtualTourUrl");
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận fail.**

- [ ] **Step 3: Viết code**

`issue-paths.ts`:
```ts
type IssueLike = { path: readonly PropertyKey[]; message: string };

export function issuesToFieldErrors(issues: readonly IssueLike[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const path = issue.path.map(String).join(".");
    errors[path] ??= issue.message;
  }
  return errors;
}
```

`validate-settings.ts`:
```ts
import { z } from "zod";
import { GRADUATION_EVENT } from "../event";
import { copyOverridesSchema } from "./copy-entry-rules";
import { COPY_FIELDS } from "./fields";
import { issuesToFieldErrors } from "./issue-paths";
import { eventSchema, imagesSchema, momentsSchema, ownerSchema } from "./settings-rules";
import type { GraduationSettingsContent } from "./settings-types";

export type SettingsValidation = { ok: true; data: GraduationSettingsContent } | { ok: false; fieldErrors: Record<string, string> };

export const endAfterStart = (start: string | undefined, end: string | undefined) =>
  Date.parse(end ?? GRADUATION_EVENT.endUtc) > Date.parse(start ?? GRADUATION_EVENT.startUtc);

const copySchema = copyOverridesSchema(COPY_FIELDS);

const settingsSchema = z
  .object({
    owner: ownerSchema.optional(),
    event: eventSchema.optional(),
    images: imagesSchema.optional(),
    moments: momentsSchema.optional(),
    copy: z.object({ vi: copySchema.optional(), en: copySchema.optional() }).optional(),
  })
  .superRefine((data, ctx) => {
    if (!endAfterStart(data.event?.start, data.event?.end)) {
      ctx.addIssue({ code: "custom", path: ["event", "end"], message: "Giờ kết thúc phải sau giờ bắt đầu" });
    }
  });

export function validateSettings(raw: unknown): SettingsValidation {
  const parsed = settingsSchema.safeParse(raw);
  if (parsed.success) return { ok: true, data: parsed.data as GraduationSettingsContent };
  return { ok: false, fieldErrors: issuesToFieldErrors(parsed.error.issues) };
}
```

Test `accepts an empty object` kỳ vọng `data: {}`. Nếu zod trả về `{ owner: undefined, … }` thì `toEqual` vẫn pass, vì `toEqual` bỏ qua key có giá trị `undefined`.

- [ ] **Step 4: Chạy test** → PASS.

- [ ] **Step 5: Commit** `feat(graduation): strict validation for saved invitation settings`

---

### Task 15: `sanitize-settings.ts`

Đọc settings từ DB một cách dễ dãi: chỉ bỏ đúng trường hỏng, phần còn lại vẫn dùng.

**Files:**
- Create: `lib/graduation/content/sanitize-settings.ts`
- Test: `tests/lib/graduation/content/sanitize-settings.test.ts`

**Interfaces:**
- Consumes: `isRecord`, `ownerSchema`, `eventSchema`, `imagesSchema`, `momentSchema`, `copyEntryError`, `COPY_FIELD_BY_KEY`, `LANGS`.
- Produces: `sanitizeSettings(raw: unknown): GraduationSettingsContent`

- [ ] **Step 1: Viết test**

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sanitizeSettings } from "@/lib/graduation/content/sanitize-settings";

describe("sanitizeSettings", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns an empty object for missing or malformed rows", () => {
    expect(sanitizeSettings(null)).toEqual({});
    expect(sanitizeSettings("oops")).toEqual({});
    expect(sanitizeSettings([1])).toEqual({});
  });
  it("keeps valid fields and drops only the broken ones", () => {
    const result = sanitizeSettings({ event: { start: "2026-12-01T02:00:00.000Z", mapEmbedUrl: "http://bad" } });
    expect(result.event).toEqual({ start: "2026-12-01T02:00:00.000Z" });
  });
  it("drops unknown keys, bad tokens and non-strings in copy", () => {
    const result = sanitizeSettings({ copy: { vi: { "met.intro": "Ok", nope: "x", "met.andYou": "{nam}", "card.body": 3 } } });
    expect(result.copy?.vi).toEqual({ "met.intro": "Ok" });
  });
  it("keeps good moments and drops broken ones", () => {
    const result = sanitizeSettings({ moments: [{ year: "2024", image: "" }, { year: 5 }] });
    expect(result.moments).toEqual([{ year: "2024", image: "" }]);
  });
  it("warns about what it dropped", () => {
    sanitizeSettings({ copy: { en: { nope: "x" } } });
    expect(console.warn).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận fail.**

- [ ] **Step 3: Viết code**

```ts
import type { z } from "zod";
import { LANGS } from "../i18n/config";
import { copyEntryError } from "./copy-entry-rules";
import { COPY_FIELD_BY_KEY } from "./fields";
import { isRecord } from "./is-record";
import type { CopyOverrides } from "./overrides";
import { eventSchema, imagesSchema, momentSchema, ownerSchema } from "./settings-rules";
import type { GraduationSettingsContent } from "./settings-types";

const warn = (what: string) => console.warn(`[graduation-settings] ignored invalid ${what}`);

function keepObject<S extends z.ZodRawShape>(schema: z.ZodObject<S>, value: unknown, label: string) {
  if (!isRecord(value)) return undefined;
  const kept: Record<string, unknown> = {};
  for (const [key, fieldSchema] of Object.entries(schema.shape)) {
    const parsed = (fieldSchema as z.ZodType).safeParse(value[key]);
    if (!parsed.success) warn(`${label}.${key}`);
    else if (parsed.data !== undefined) kept[key] = parsed.data;
  }
  return Object.keys(kept).length > 0 ? (kept as z.output<z.ZodObject<S>>) : undefined;
}

function keepCopy(value: unknown, lang: string): CopyOverrides | undefined {
  if (!isRecord(value)) return undefined;
  const kept: CopyOverrides = {};
  for (const [key, text] of Object.entries(value)) {
    const valid = typeof text === "string" && text.trim() !== "" && copyEntryError(COPY_FIELD_BY_KEY.get(key), text) === null;
    if (valid) kept[key] = text.trim();
    else warn(`copy.${lang}.${key}`);
  }
  return Object.keys(kept).length > 0 ? kept : undefined;
}

function keepMoments(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  const kept = value.flatMap((moment, index) => {
    const parsed = momentSchema.safeParse(moment);
    if (!parsed.success) warn(`moments.${index}`);
    return parsed.success ? [parsed.data] : [];
  });
  return kept.length > 0 ? kept : undefined;
}

export function sanitizeSettings(raw: unknown): GraduationSettingsContent {
  if (!isRecord(raw)) return {};
  const copy = isRecord(raw.copy) ? raw.copy : {};
  return {
    owner: keepObject(ownerSchema, raw.owner, "owner"),
    event: keepObject(eventSchema, raw.event, "event"),
    images: keepObject(imagesSchema, raw.images, "images"),
    moments: keepMoments(raw.moments),
    copy: Object.fromEntries(LANGS.map((lang) => [lang, keepCopy(copy[lang], lang)])),
  };
}
```

**Kiểm tra trước:** `LANGS` nằm ở `lib/graduation/i18n/config.ts`. Import thẳng từ `../i18n/config` (không qua `../i18n`) để `sanitize-settings` không kéo theo toàn bộ copy mặc định.

- [ ] **Step 4: Chạy test** → PASS. Nếu test `returns an empty object…` fail vì `copy: { vi: undefined, en: undefined }`, thì vẫn đúng ý (vì `toEqual` bỏ qua key `undefined`). Nếu vẫn fail thì báo lại, không đổi test.

- [ ] **Step 5: Commit** `feat(graduation): lenient reading of stored settings`

---

### Task 16: `legacy-guest-content.ts`

**Files:**
- Create: `lib/graduation/content/legacy-guest-content.ts`
- Test: `tests/lib/graduation/content/legacy-guest-content.test.ts`

**Interfaces:**
- Consumes: `getPath`, `joinList`, `isRecord`.
- Produces:
  - `isLegacyGuestContent(raw: Record<string, unknown>): boolean`. `true` nếu có một trong các key `envelope`, `met`, `ends`, `rsvp`.
  - `convertLegacyGuestContent(raw: Record<string, unknown>): Record<string, unknown>`. Trả object dạng `GuestContent` chưa validate.

- [ ] **Step 1: Viết test**

```ts
import { describe, expect, it } from "vitest";
import { convertLegacyGuestContent, isLegacyGuestContent } from "@/lib/graduation/content/legacy-guest-content";

describe("isLegacyGuestContent", () => {
  it("detects the old section-shaped content", () => {
    expect(isLegacyGuestContent({ envelope: {} })).toBe(true);
    expect(isLegacyGuestContent({ music: {} })).toBe(false);
    expect(isLegacyGuestContent({ vi: {} })).toBe(false);
  });
});

describe("convertLegacyGuestContent", () => {
  const legacy = {
    envelope: { coverLead: "Ngày", cardGreeting: "Kính gửi,", coverImage: "/c.jpg" },
    met: {
      headingLead: "Những năm,",
      note: "Cảm ơn",
      togetherPhoto: "/us.jpg",
      moments: [{ year: "2023", title: "Đà Lạt", body: "Hồ", image: "/d.jpg", color: "jade" }],
    },
    ends: { venue: "Sân A", address: "Cổng 1", notes: ["A", "B"], dateShort: "20.12", timeRange: "14:00 — 16:00" },
    rsvp: { prompt: "Đến nhé" },
    music: { youtubeId: "hfavqkBrwXI" },
  };
  const result = convertLegacyGuestContent(legacy);

  it("moves texts into the Vietnamese overrides", () => {
    expect(result.vi).toEqual({
      "stage.cover.lead": "Ngày",
      "card.greeting": "Kính gửi,",
      "met.heading.lead": "Những năm,",
      "met.defaultNote": "Cảm ơn",
      "ends.venue": "Sân A",
      "rails.whereValue": "Sân A",
      "ends.address": "Cổng 1",
      "rails.whereSub": "Cổng 1",
      "ends.notes": "A\nB",
      "rsvp.prompt": "Đến nhé",
    });
  });
  it("drops the free-text date and time", () => {
    expect(JSON.stringify(result)).not.toContain("20.12");
    expect(JSON.stringify(result)).not.toContain("14:00");
  });
  it("moves images, moments and music", () => {
    expect(result.images).toEqual({ coverImage: "/c.jpg", togetherPhoto: "/us.jpg" });
    expect(result.moments).toEqual([{ year: "2023", image: "/d.jpg", color: "jade", vi: { title: "Đà Lạt", body: "Hồ" } }]);
    expect(result.music).toEqual({ youtubeId: "hfavqkBrwXI" });
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận fail.**

- [ ] **Step 3: Viết code**

```ts
import { isRecord } from "./is-record";
import { joinList } from "./list-format";
import { getPath } from "./paths";

const LEGACY_SECTIONS = ["envelope", "met", "ends", "rsvp"];

const LEGACY_TEXT_KEYS: Readonly<Record<string, readonly string[]>> = {
  "envelope.coverLead": ["stage.cover.lead"],
  "envelope.coverAccent": ["stage.cover.accent"],
  "envelope.cardGreeting": ["card.greeting"],
  "envelope.cardBody": ["card.body"],
  "envelope.cardAuthor": ["card.author"],
  "met.headingLead": ["met.heading.lead"],
  "met.headingAccent": ["met.heading.accent"],
  "met.intro": ["met.intro"],
  "met.note": ["met.defaultNote"],
  "ends.headingLead": ["ends.heading.lead"],
  "ends.headingAccent": ["ends.heading.accent"],
  "ends.intro": ["ends.intro"],
  "ends.venue": ["ends.venue", "rails.whereValue"],
  "ends.address": ["ends.address", "rails.whereSub"],
  "ends.specialMessage": ["ends.specialMessage"],
  "rsvp.headingLead": ["rsvp.heading.lead"],
  "rsvp.headingAccent": ["rsvp.heading.accent"],
  "rsvp.prompt": ["rsvp.prompt"],
};

export const isLegacyGuestContent = (raw: Record<string, unknown>) => LEGACY_SECTIONS.some((section) => section in raw);

function legacyTexts(raw: Record<string, unknown>): Record<string, string> {
  const texts: Record<string, string> = {};
  for (const [legacyKey, keys] of Object.entries(LEGACY_TEXT_KEYS)) {
    const value = getPath(raw, legacyKey);
    if (typeof value === "string" && value.trim() !== "") keys.forEach((key) => (texts[key] = value));
  }
  const notes = getPath(raw, "ends.notes");
  if (Array.isArray(notes) && notes.length > 0) texts["ends.notes"] = joinList(notes.map(String));
  return texts;
}

function legacyMoment(value: unknown) {
  const moment = isRecord(value) ? value : {};
  return { year: moment.year ?? "", image: moment.image ?? "", color: moment.color, vi: { title: moment.title, body: moment.body } };
}

export function convertLegacyGuestContent(raw: Record<string, unknown>): Record<string, unknown> {
  const moments = getPath(raw, "met.moments");
  return {
    vi: legacyTexts(raw),
    images: { coverImage: getPath(raw, "envelope.coverImage"), togetherPhoto: getPath(raw, "met.togetherPhoto") },
    moments: Array.isArray(moments) && moments.length > 0 ? moments.map(legacyMoment) : undefined,
    music: raw.music,
  };
}
```

`forEach` có hàm callback gán giá trị. Nếu ESLint báo `no-return-assign`, đổi thành `for (const key of keys) texts[key] = value;`.

- [ ] **Step 4: Chạy test** → PASS. (`toEqual` bỏ qua `color: undefined` và `title: undefined`.)

- [ ] **Step 5: Commit** `feat(graduation): convert legacy guest customizations to bilingual content`

---

### Task 17: `guest-content-schema.ts` và `normalize-guest-content.ts`

**Files:**
- Create: `lib/graduation/content/guest-content-schema.ts`
- Create: `lib/graduation/content/normalize-guest-content.ts`
- Test: `tests/lib/graduation/content/guest-content-schema.test.ts`
- Test: `tests/lib/graduation/content/normalize-guest-content.test.ts`

**Interfaces:**
- Consumes: `copyOverridesSchema`, `GUEST_COPY_FIELDS`, `guestImagesSchema`, `momentsSchema`, `eventTimesShape`, `musicSchema`, `endAfterStart` (Task 14), `isLegacyGuestContent`, `convertLegacyGuestContent`, `isRecord`, `GuestContent`.
- Produces:
  - `guestContentSchema`: chỉ nhận dạng mới
  - `guestContentInputSchema`: nhận cả dạng cũ (tự chuyển) lẫn dạng mới
  - `normalizeGuestContent(raw: unknown, guestNote: string | null): GuestContent`

`endAfterStart` của Task 14 so với giờ mặc định khi thiếu một đầu. Với custom khách, chỉ so khi **cả hai** đều có, nên ở đây kiểm tra `start && end` trước khi gọi.

- [ ] **Step 1: Viết test**

`guest-content-schema.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { guestContentInputSchema, guestContentSchema } from "@/lib/graduation/content/guest-content-schema";

describe("guestContentSchema", () => {
  it("accepts guest-editable keys in both languages", () => {
    const result = guestContentSchema.safeParse({ vi: { "card.greeting": "Chào" }, en: { "card.greeting": "Hi" } });
    expect(result.success).toBe(true);
  });
  it("rejects keys a guest cannot override", () => {
    const result = guestContentSchema.safeParse({ vi: { "gate.tapBee": "x" } });
    expect(result.error?.issues[0].path).toEqual(["vi", "gate.tapBee"]);
  });
  it("rejects an end before the start", () => {
    const result = guestContentSchema.safeParse({ event: { start: "2026-12-01T04:00:00.000Z", end: "2026-12-01T02:00:00.000Z" } });
    expect(result.error?.issues[0].path).toEqual(["event", "end"]);
  });
  it("accepts a lone start", () => {
    expect(guestContentSchema.safeParse({ event: { start: "2026-12-20T07:00:00.000Z" } }).success).toBe(true);
  });
});

describe("guestContentInputSchema", () => {
  it("converts the legacy shape", () => {
    expect(guestContentInputSchema.parse({ envelope: { cardGreeting: "Kính gửi," } }).vi).toEqual({ "card.greeting": "Kính gửi," });
  });
});
```

`normalize-guest-content.test.ts`:
```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { normalizeGuestContent } from "@/lib/graduation/content/normalize-guest-content";

describe("normalizeGuestContent", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns empty content for nothing", () => {
    expect(normalizeGuestContent(null, null)).toEqual({});
  });
  it("treats the guest note as the Vietnamese personal note", () => {
    expect(normalizeGuestContent(null, " Cảm ơn ")).toEqual({ vi: { "met.defaultNote": "Cảm ơn" } });
  });
  it("ignores a blank guest note", () => {
    expect(normalizeGuestContent({}, "   ")).toEqual({});
  });
  it("lets a custom note win over the guest note", () => {
    const result = normalizeGuestContent({ met: { note: "Riêng" } }, "Ghi chú");
    expect(result.vi?.["met.defaultNote"]).toBe("Riêng");
  });
  it("passes new content through", () => {
    expect(normalizeGuestContent({ en: { "card.greeting": "Hi" } }, null)).toEqual({ en: { "card.greeting": "Hi" } });
  });
  it("falls back to empty content when stored content is invalid", () => {
    expect(normalizeGuestContent({ vi: { "gate.tapBee": "x" } }, null)).toEqual({});
    expect(console.warn).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Chạy hai file test, xác nhận fail.**

- [ ] **Step 3: Viết code**

`guest-content-schema.ts`:
```ts
import { z } from "zod";
import { copyOverridesSchema } from "./copy-entry-rules";
import { GUEST_COPY_FIELDS } from "./fields/guest-keys";
import { isRecord } from "./is-record";
import { convertLegacyGuestContent, isLegacyGuestContent } from "./legacy-guest-content";
import { eventTimesShape, guestImagesSchema, momentsSchema, musicSchema } from "./settings-rules";
import { endAfterStart } from "./validate-settings";

const guestCopySchema = copyOverridesSchema(GUEST_COPY_FIELDS);

export const guestContentSchema = z
  .object({
    vi: guestCopySchema.optional(),
    en: guestCopySchema.optional(),
    images: guestImagesSchema.optional(),
    moments: momentsSchema.optional(),
    event: z.object(eventTimesShape).optional(),
    music: musicSchema.optional(),
  })
  .superRefine((data, ctx) => {
    const { start, end } = data.event ?? {};
    if (start && end && !endAfterStart(start, end)) {
      ctx.addIssue({ code: "custom", path: ["event", "end"], message: "Giờ kết thúc phải sau giờ bắt đầu" });
    }
  });

export const guestContentInputSchema = z.preprocess(
  (raw) => (isRecord(raw) && isLegacyGuestContent(raw) ? convertLegacyGuestContent(raw) : raw),
  guestContentSchema,
);
```

`normalize-guest-content.ts`:
```ts
import { guestContentInputSchema } from "./guest-content-schema";
import type { GuestContent } from "./settings-types";

function parseStored(raw: unknown): GuestContent {
  if (raw == null) return {};
  const parsed = guestContentInputSchema.safeParse(raw);
  if (parsed.success) return parsed.data as GuestContent;
  console.warn("[graduation-guest] ignored invalid custom content");
  return {};
}

export function normalizeGuestContent(raw: unknown, guestNote: string | null): GuestContent {
  const content = parseStored(raw);
  const note = guestNote?.trim();
  if (!note || content.vi?.["met.defaultNote"]) return content;
  return { ...content, vi: { ...content.vi, "met.defaultNote": note } };
}
```

**Kiểm tra trước:** `guest-content-schema.ts` import `endAfterStart` từ `validate-settings.ts`, kéo theo schema settings. Như vậy là chấp nhận được. Nếu gặp lỗi import vòng (circular), chuyển `endAfterStart` sang file riêng `lib/graduation/content/event-range.ts` và import từ đó ở cả hai nơi.

- [ ] **Step 4: Chạy test** → PASS.

- [ ] **Step 5: Commit** `feat(graduation): bilingual guest content schema with legacy support`

---


### Task 18: `resolve-owner.ts` và `resolve-images.ts`

**Files:**
- Create: `lib/graduation/content/resolve-owner.ts`
- Create: `lib/graduation/content/resolve-images.ts`
- Test: `tests/lib/graduation/content/resolve-owner.test.ts`
- Test: `tests/lib/graduation/content/resolve-images.test.ts`

**Interfaces:**
- Consumes: `DEFAULT_OWNER`, `DEFAULT_IMAGES`, `OwnerSettings`, `ImageSettings`, `GuestContent`.
- Produces:
  - `type ResolvedOwner = { name: string; initials: string; website: string; phone: string | null }`
  - `resolveOwner(settings: OwnerSettings | undefined, envPhone: string | null): ResolvedOwner`
  - `type ResolvedImages = { coverImage?: string; togetherPhoto?: string; badgeLogo: string }`
  - `resolveImages(settings: ImageSettings | undefined, guest: GuestContent["images"]): ResolvedImages`

- [ ] **Step 1: Viết test**

`resolve-owner.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { resolveOwner } from "@/lib/graduation/content/resolve-owner";

describe("resolveOwner", () => {
  it("falls back to the defaults and the env phone", () => {
    expect(resolveOwner(undefined, "0901")).toEqual({ name: "Võ Lê Quang Vinh", initials: "QV", website: "vinhvolequang.io.vn", phone: "0901" });
  });
  it("prefers the stored values", () => {
    expect(resolveOwner({ name: "A", initials: "AB", website: "a.dev", phone: "0123" }, "0901")).toEqual({ name: "A", initials: "AB", website: "a.dev", phone: "0123" });
  });
  it("has no phone when neither is set", () => {
    expect(resolveOwner({}, null).phone).toBeNull();
  });
});
```

`resolve-images.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { resolveImages } from "@/lib/graduation/content/resolve-images";

describe("resolveImages", () => {
  it("uses the default badge and no photos by default", () => {
    expect(resolveImages(undefined, undefined)).toEqual({ badgeLogo: "/01_logobachkhoatoi.webp" });
  });
  it("lets the guest override the shared photos", () => {
    expect(resolveImages({ coverImage: "/a.jpg", togetherPhoto: "/b.jpg", badgeLogo: "/l.png" }, { coverImage: "/g.jpg" })).toEqual({
      coverImage: "/g.jpg",
      togetherPhoto: "/b.jpg",
      badgeLogo: "/l.png",
    });
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận fail.**

- [ ] **Step 3: Viết code**

`resolve-owner.ts`:
```ts
import { DEFAULT_OWNER } from "./defaults";
import type { OwnerSettings } from "./settings-types";

export type ResolvedOwner = { name: string; initials: string; website: string; phone: string | null };

export const resolveOwner = (settings: OwnerSettings | undefined, envPhone: string | null): ResolvedOwner => ({
  name: settings?.name || DEFAULT_OWNER.name,
  initials: settings?.initials || DEFAULT_OWNER.initials,
  website: settings?.website || DEFAULT_OWNER.website,
  phone: settings?.phone || envPhone || null,
});
```

`resolve-images.ts`:
```ts
import { DEFAULT_IMAGES } from "./defaults";
import type { GuestContent, ImageSettings } from "./settings-types";

export type ResolvedImages = { coverImage?: string; togetherPhoto?: string; badgeLogo: string };

export const resolveImages = (settings: ImageSettings | undefined, guest: GuestContent["images"]): ResolvedImages => ({
  coverImage: guest?.coverImage || settings?.coverImage,
  togetherPhoto: guest?.togetherPhoto || settings?.togetherPhoto,
  badgeLogo: settings?.badgeLogo || DEFAULT_IMAGES.badgeLogo,
});
```

- [ ] **Step 4: Chạy test** → PASS.

- [ ] **Step 5: Commit** `feat(graduation): resolve owner details and shared images`

---

### Task 19: `resolve-moments.ts`

**Files:**
- Create: `lib/graduation/content/resolve-moments.ts`
- Test: `tests/lib/graduation/content/resolve-moments.test.ts`

**Interfaces:**
- Consumes: `MOMENT_STYLE` (Task 9), `Moment`, `Lang`, `SettingsMoment`.
- Produces: `resolveMoments(input: { lang: Lang; defaults: readonly Moment[]; settings?: readonly SettingsMoment[]; guest?: readonly SettingsMoment[] }): Moment[]`

Quy tắc:
- Danh sách dùng là: danh sách của khách nếu khác rỗng; nếu không thì danh sách chung nếu khác rỗng; nếu không nữa thì `defaults`.
- Text theo ngôn ngữ ở phần tử `i`: lấy của danh sách đang dùng; nếu trống thì lấy danh sách chung (chỉ khi đang dùng danh sách khách); nếu vẫn trống thì `defaults[i]`; cuối cùng là `""`.
- `image`, `year` trống thì lấy `defaults[i]`. `color` không có thì lấy `MOMENT_STYLE[i % 4].color`; `rot` luôn lấy `MOMENT_STYLE[i % 4].rot`; `n` là số thứ tự 2 chữ số.

- [ ] **Step 1: Viết test**

```ts
import { describe, expect, it } from "vitest";
import { resolveMoments } from "@/lib/graduation/content/resolve-moments";
import { DEFAULT_MOMENTS } from "@/lib/graduation/i18n";

const defaults = DEFAULT_MOMENTS.en;

describe("resolveMoments", () => {
  it("returns the defaults when nobody customised the list", () => {
    expect(resolveMoments({ lang: "en", defaults })).toEqual(defaults);
  });
  it("uses the shared list over the defaults", () => {
    const result = resolveMoments({ lang: "en", defaults, settings: [{ year: "2030", image: "/x.jpg", en: { title: "T", body: "B" } }] });
    expect(result).toEqual([{ n: "01", year: "2030", title: "T", body: "B", image: "/x.jpg", color: "tomato", rot: -1.6 }]);
  });
  it("uses the guest list over the shared list", () => {
    const result = resolveMoments({
      lang: "en",
      defaults,
      settings: [{ year: "2030", image: "/x.jpg", en: { title: "Shared" } }],
      guest: [{ year: "2031", image: "", color: "jade", en: { title: "Guest" } }],
    });
    expect(result[0]).toMatchObject({ year: "2031", title: "Guest", color: "jade", image: defaults[0].image });
  });
  it("fills a blank English text from the shared list, then the defaults, never from Vietnamese", () => {
    const result = resolveMoments({
      lang: "en",
      defaults,
      settings: [{ year: "2030", image: "", en: { title: "Shared EN" } }],
      guest: [{ year: "2031", image: "", vi: { title: "Riêng", body: "Thân" } }],
    });
    expect(result[0].title).toBe("Shared EN");
    expect(result[0].body).toBe(defaults[0].body);
  });
  it("leaves text empty past the end of every fallback", () => {
    const guest = Array.from({ length: 6 }, (_, i) => ({ year: String(2020 + i), image: "" }));
    const result = resolveMoments({ lang: "vi", defaults: DEFAULT_MOMENTS.vi, guest });
    expect(result[5]).toMatchObject({ n: "06", title: "", body: "", image: "", color: "blue", rot: 1.4 });
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận fail.**

- [ ] **Step 3: Viết code**

```ts
import { MOMENT_STYLE } from "../i18n/moments";
import type { Lang, Moment, MomentText } from "../i18n/types";
import type { SettingsMoment } from "./settings-types";

type MomentsInput = {
  lang: Lang;
  defaults: readonly Moment[];
  settings?: readonly SettingsMoment[];
  guest?: readonly SettingsMoment[];
};

const nonEmpty = (list?: readonly SettingsMoment[]) => (list && list.length > 0 ? list : undefined);

export function resolveMoments({ lang, defaults, settings, guest }: MomentsInput): Moment[] {
  const own = nonEmpty(guest) ?? nonEmpty(settings);
  if (!own) return [...defaults];
  const shared = own === guest ? nonEmpty(settings) : undefined;

  return own.map((moment, i) => {
    const base = defaults[i];
    const style = MOMENT_STYLE[i % MOMENT_STYLE.length];
    const text = (part: keyof MomentText) => moment[lang]?.[part] || shared?.[i]?.[lang]?.[part] || base?.[part] || "";
    return {
      n: String(i + 1).padStart(2, "0"),
      year: moment.year || base?.year || "",
      title: text("title"),
      body: text("body"),
      image: moment.image || base?.image || "",
      color: moment.color ?? style.color,
      rot: style.rot,
    };
  });
}
```

- [ ] **Step 4: Chạy test** → PASS.

- [ ] **Step 5: Commit** `feat(graduation): resolve memory cards per language with layered fallbacks`

---

### Task 20: `resolve-event.ts`

**Files:**
- Create: `lib/graduation/content/resolve-event.ts`
- Test: `tests/lib/graduation/content/resolve-event.test.ts`

**Interfaces:**
- Consumes: `GRADUATION_EVENT`, `GraduationEvent`, `GraduationCopy`, `EventTimes`, `EventVars`, `EventSettings`, `GuestContent`.
- Produces:
  - `resolveEventTimes(settings: EventSettings | undefined, guest: GuestContent["event"]): EventTimes`. Khách → chung → mặc định, tính riêng cho từng đầu. Nếu `end <= start` thì `end = start + 2 giờ`.
  - `resolveEvent(input: { times: EventTimes; vars: EventVars; copy: GraduationCopy; settings?: EventSettings; musicOverride?: string }): GraduationEvent`

- [ ] **Step 1: Viết test**

```ts
import { describe, expect, it } from "vitest";
import { eventVars } from "@/lib/graduation/content/event-vars";
import { resolveEvent, resolveEventTimes } from "@/lib/graduation/content/resolve-event";
import { GRADUATION_EVENT } from "@/lib/graduation/event";
import { GRADUATION_COPY } from "@/lib/graduation/i18n";

describe("resolveEventTimes", () => {
  it("uses the defaults", () => {
    expect(resolveEventTimes(undefined, undefined)).toEqual({ startUtc: GRADUATION_EVENT.startUtc, endUtc: GRADUATION_EVENT.endUtc });
  });
  it("prefers the guest, then the shared settings, per end", () => {
    const times = resolveEventTimes(
      { start: "2026-12-01T02:00:00.000Z", end: "2026-12-01T05:00:00.000Z" },
      { start: "2026-12-01T03:00:00.000Z" },
    );
    expect(times).toEqual({ startUtc: "2026-12-01T03:00:00.000Z", endUtc: "2026-12-01T05:00:00.000Z" });
  });
  it("gives a lone later start a two-hour slot", () => {
    expect(resolveEventTimes(undefined, { start: "2026-12-20T07:00:00.000Z" })).toEqual({
      startUtc: "2026-12-20T07:00:00.000Z",
      endUtc: "2026-12-20T09:00:00.000Z",
    });
  });
});

describe("resolveEvent", () => {
  const times = { startUtc: "2026-12-20T07:00:00.000Z", endUtc: "2026-12-20T09:00:00.000Z" };
  const event = resolveEvent({ times, vars: eventVars(times, "vi"), copy: GRADUATION_COPY.vi, settings: { virtualTourUrl: "https://tour.example" } });

  it("derives display values from the times", () => {
    expect(event).toMatchObject({ ...times, dateShort: "20.12", timeRange: "14:00 — 16:00", year: "2026" });
  });
  it("takes the title and place from the copy", () => {
    expect(event).toMatchObject({ title: GRADUATION_COPY.vi.meta.eventTitle, venue: GRADUATION_COPY.vi.ends.venue, address: GRADUATION_COPY.vi.ends.address });
  });
  it("layers links and music", () => {
    expect(event.virtualTourUrl).toBe("https://tour.example");
    expect(event.mapEmbedUrl).toBe(GRADUATION_EVENT.mapEmbedUrl);
    expect(resolveEvent({ times, vars: eventVars(times, "vi"), copy: GRADUATION_COPY.vi, musicOverride: "abcdefghijk" }).musicYoutubeId).toBe("abcdefghijk");
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận fail.**

- [ ] **Step 3: Viết code**

```ts
import { GRADUATION_EVENT, type GraduationEvent } from "../event";
import type { GraduationCopy } from "../i18n/types";
import type { EventTimes, EventVars } from "./event-vars";
import type { EventSettings, GuestContent } from "./settings-types";

const FALLBACK_DURATION_MS = 2 * 60 * 60 * 1000;

export function resolveEventTimes(settings: EventSettings | undefined, guest: GuestContent["event"]): EventTimes {
  const startUtc = guest?.start || settings?.start || GRADUATION_EVENT.startUtc;
  const end = guest?.end || settings?.end || GRADUATION_EVENT.endUtc;
  const endUtc = Date.parse(end) > Date.parse(startUtc) ? end : new Date(Date.parse(startUtc) + FALLBACK_DURATION_MS).toISOString();
  return { startUtc, endUtc };
}

type EventInput = { times: EventTimes; vars: EventVars; copy: GraduationCopy; settings?: EventSettings; musicOverride?: string };

export const resolveEvent = ({ times, vars, copy, settings, musicOverride }: EventInput): GraduationEvent => ({
  title: copy.meta.eventTitle,
  ...times,
  dateShort: vars.dateShort,
  timeRange: vars.time,
  year: vars.year,
  venue: copy.ends.venue,
  address: copy.ends.address,
  mapEmbedUrl: settings?.mapEmbedUrl || GRADUATION_EVENT.mapEmbedUrl,
  mapLinkUrl: settings?.mapLinkUrl || GRADUATION_EVENT.mapLinkUrl,
  virtualTourUrl: settings?.virtualTourUrl || GRADUATION_EVENT.virtualTourUrl,
  virtualTourOwnerUrl: settings?.virtualTourOwnerUrl || GRADUATION_EVENT.virtualTourOwnerUrl,
  musicYoutubeId: musicOverride || settings?.musicYoutubeId || GRADUATION_EVENT.musicYoutubeId,
});
```

- [ ] **Step 4: Chạy test** → PASS.

- [ ] **Step 5: Commit** `feat(graduation): resolve event times, links and music with guest overrides`

---

### Task 21: `layer-texts.ts`

**Files:**
- Create: `lib/graduation/content/layer-texts.ts`
- Test: `tests/lib/graduation/content/layer-texts.test.ts`

**Interfaces:**
- Consumes: `applyOverrides` (Task 10), `DEFAULT_TEXTS`, `GUEST_COPY_FIELDS`, `GraduationSettingsContent`, `GuestContent`.
- Produces: `layerTexts(lang: Lang, settings?: GraduationSettingsContent | null, guest?: GuestContent | null): CopyTexts`

- [ ] **Step 1: Viết test**

```ts
import { describe, expect, it } from "vitest";
import { layerTexts } from "@/lib/graduation/content/layer-texts";
import { DEFAULT_TEXTS } from "@/lib/graduation/i18n";

describe("layerTexts", () => {
  it("is the defaults without overrides", () => {
    expect(layerTexts("vi")).toEqual(DEFAULT_TEXTS.vi);
  });
  it("applies shared settings for the language only", () => {
    const settings = { copy: { vi: { "met.intro": "Chung VI" } } };
    expect(layerTexts("vi", settings).met.intro).toBe("Chung VI");
    expect(layerTexts("en", settings).met.intro).toBe(DEFAULT_TEXTS.en.met.intro);
  });
  it("lets the guest win over shared settings", () => {
    const texts = layerTexts("vi", { copy: { vi: { "card.greeting": "Chung" } } }, { vi: { "card.greeting": "Riêng" } });
    expect(texts.card.greeting).toBe("Riêng");
  });
  it("falls back to shared English when the guest English is blank", () => {
    const texts = layerTexts("en", { copy: { en: { "card.greeting": "Shared" } } }, { vi: { "card.greeting": "Riêng" }, en: { "card.greeting": "  " } });
    expect(texts.card.greeting).toBe("Shared");
  });
  it("ignores guest keys outside the guest list", () => {
    expect(layerTexts("vi", null, { vi: { "gate.tapBee": "x" } }).gate.tapBee).toBe(DEFAULT_TEXTS.vi.gate.tapBee);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận fail.**

- [ ] **Step 3: Viết code**

```ts
import { DEFAULT_TEXTS } from "../i18n";
import type { Lang } from "../i18n/types";
import { applyOverrides } from "./apply-overrides";
import type { CopyTexts } from "./copy-texts";
import { GUEST_COPY_FIELDS } from "./fields/guest-keys";
import type { GraduationSettingsContent, GuestContent } from "./settings-types";

export function layerTexts(lang: Lang, settings?: GraduationSettingsContent | null, guest?: GuestContent | null): CopyTexts {
  const shared = applyOverrides(DEFAULT_TEXTS[lang], settings?.copy?.[lang]);
  return applyOverrides(shared, guest?.[lang], GUEST_COPY_FIELDS);
}
```

- [ ] **Step 4: Chạy test** → PASS.

- [ ] **Step 5: Commit** `feat(graduation): layer default, shared and guest texts`

---

### Task 22: `resolve-content.ts`

**Files:**
- Create: `lib/graduation/content/resolve-content.ts`
- Test: `tests/lib/graduation/content/resolve-content.test.ts`

**Interfaces:**
- Consumes: `resolveOwner`, `resolveImages` (Task 18), `resolveMoments` (Task 19), `resolveEventTimes`, `resolveEvent` (Task 20), `layerTexts` (Task 21), `copyVars` (Task 9), `composeCopy` (Task 9), `DEFAULT_MOMENTS`.
- Produces:
  - `type ResolveInput = { lang: Lang; settings?: GraduationSettingsContent | null; guest?: GuestContent | null; envPhone?: string | null }`
  - `type ResolvedContent = { copy: GraduationCopy; event: GraduationEvent; owner: ResolvedOwner; images: ResolvedImages }`
  - `resolveGraduationContent(input: ResolveInput): ResolvedContent`

**Không được import** bất kỳ file nào dùng `zod` (`settings-rules`, `validate-settings`, `sanitize-settings`, `guest-content-schema`, `normalize-guest-content`). Hàm này chạy ở client, nên đừng kéo zod vào bundle client.

- [ ] **Step 1: Viết test**

```ts
import { describe, expect, it } from "vitest";
import { resolveGraduationContent } from "@/lib/graduation/content/resolve-content";
import { GRADUATION_COPY } from "@/lib/graduation/i18n";

describe("resolveGraduationContent", () => {
  it("matches the default copy without settings or guest", () => {
    const { copy, event } = resolveGraduationContent({ lang: "vi" });
    expect(copy.rails.whenValue).toBe(GRADUATION_COPY.vi.rails.whenValue);
    expect(copy.met.moments).toEqual(GRADUATION_COPY.vi.met.moments);
    expect(event.timeRange).toBe("16:30 — 18:30");
  });
  it("re-renders every date template from a guest's own time", () => {
    const { copy, event } = resolveGraduationContent({ lang: "vi", guest: { event: { start: "2026-12-20T07:00:00.000Z" } } });
    expect(copy.rails.whenValue).toBe("Chủ Nhật 20.12.2026");
    expect(copy.rsvp.stamp).toBe("Sẽ đến · 20.12.2026");
    expect(copy.narrator.farewell("Lan")).toBe("Hẹn gặp ngày 20.12.");
    expect(event.dateShort).toBe("20.12");
  });
  it("fills the owner into templates", () => {
    const { copy, owner } = resolveGraduationContent({ lang: "en", settings: { owner: { name: "Lan Anh", initials: "LA" } } });
    expect(copy.envelope.from).toBe("From: Lan Anh");
    expect(copy.marks.signature).toBe("LA · 2026");
    expect(owner.name).toBe("Lan Anh");
  });
  it("never mixes Vietnamese into English", () => {
    const { copy } = resolveGraduationContent({ lang: "en", guest: { vi: { "card.greeting": "Kính gửi," } } });
    expect(copy.card.greeting).toBe(GRADUATION_COPY.en.card.greeting);
  });
  it("passes the cover image into the card copy", () => {
    const { copy } = resolveGraduationContent({ lang: "vi", settings: { images: { coverImage: "/c.jpg" } } });
    expect(copy.card.coverImage).toBe("/c.jpg");
  });
  it("uses the guest's music", () => {
    const { event } = resolveGraduationContent({ lang: "vi", guest: { music: { youtubeId: "abcdefghijk" } } });
    expect(event.musicYoutubeId).toBe("abcdefghijk");
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận fail.**

- [ ] **Step 3: Viết code**

```ts
import type { GraduationEvent } from "../event";
import { DEFAULT_MOMENTS } from "../i18n";
import type { GraduationCopy, Lang } from "../i18n/types";
import { composeCopy } from "./compose-copy";
import { copyVars } from "./copy-vars";
import { layerTexts } from "./layer-texts";
import { resolveEvent, resolveEventTimes } from "./resolve-event";
import { resolveImages, type ResolvedImages } from "./resolve-images";
import { resolveMoments } from "./resolve-moments";
import { resolveOwner, type ResolvedOwner } from "./resolve-owner";
import type { GraduationSettingsContent, GuestContent } from "./settings-types";

export type ResolveInput = {
  lang: Lang;
  settings?: GraduationSettingsContent | null;
  guest?: GuestContent | null;
  envPhone?: string | null;
};

export type ResolvedContent = { copy: GraduationCopy; event: GraduationEvent; owner: ResolvedOwner; images: ResolvedImages };

export function resolveGraduationContent({ lang, settings, guest, envPhone = null }: ResolveInput): ResolvedContent {
  const owner = resolveOwner(settings?.owner, envPhone);
  const images = resolveImages(settings?.images, guest?.images);
  const times = resolveEventTimes(settings?.event, guest?.event);
  const vars = copyVars(lang, times, owner);
  const moments = resolveMoments({ lang, defaults: DEFAULT_MOMENTS[lang], settings: settings?.moments, guest: guest?.moments });
  const copy = composeCopy(layerTexts(lang, settings, guest), moments, vars, images.coverImage);
  const event = resolveEvent({ times, vars, copy, settings: settings?.event, musicOverride: guest?.music?.youtubeId });
  return { copy, event, owner, images };
}
```

- [ ] **Step 4: Chạy test** → PASS. Chạy toàn bộ `npx vitest run tests/lib/graduation` → PASS.

- [ ] **Step 5: Commit** `feat(graduation): resolve invitation content from defaults, settings and guest`

---

## Giai đoạn B: Lưu trữ

### Task 23: Model Prisma, migration và repository

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_graduation_settings/migration.sql` (sinh bằng lệnh)
- Create: `lib/graduation/content/settings-store.ts`
- Create: `lib/graduation/settings-repository.ts`

**Interfaces:**
- Produces:
  - `type SettingsStore = { read(): Promise<unknown>; write(content: GraduationSettingsContent): Promise<void> }` (`settings-store.ts`)
  - `settingsRepository: SettingsStore` (`lib/graduation/settings-repository.ts`)

**Kiểm tra trước:**
1. `git check-ignore -q generated && echo ignored || echo tracked`. Nếu `tracked`, các file trong `generated/prisma` sinh ra ở Step 3 phải được commit cùng task này.
2. DB dev đang chạy: `npx prisma migrate status` phải kết nối được và báo "Database schema is up to date". Nếu không kết nối được thì dừng và hỏi (cần bật DB, xem `compose.yaml`).

- [ ] **Step 1: Thêm model vào cuối `prisma/schema.prisma`**

```prisma
model GraduationSettings {
  id        String   @id @default("default")
  content   Json
  updatedAt DateTime @updatedAt
}
```

- [ ] **Step 2: Sinh migration**

Run: `npx prisma migrate dev --name graduation_settings`
Expected: tạo thư mục `prisma/migrations/<timestamp>_graduation_settings/` với `migration.sql` chứa `CREATE TABLE "GraduationSettings"`, và chạy `prisma generate`.

- [ ] **Step 3: Tạo `lib/graduation/content/settings-store.ts`**

```ts
import type { GraduationSettingsContent } from "./settings-types";

export type SettingsStore = {
  read(): Promise<unknown>;
  write(content: GraduationSettingsContent): Promise<void>;
};
```

- [ ] **Step 4: Tạo `lib/graduation/settings-repository.ts`** theo mẫu `guest-repository.ts`

```ts
import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import type { SettingsStore } from "./content/settings-store";

const SETTINGS_ID = "default";

export const settingsRepository: SettingsStore = {
  async read() {
    const row = await prisma.graduationSettings.findUnique({ where: { id: SETTINGS_ID }, select: { content: true } });
    return row?.content ?? null;
  },

  async write(content) {
    const json = content as unknown as Prisma.InputJsonValue;
    await prisma.graduationSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, content: json },
      update: { content: json },
    });
  },
};
```

`Prisma` được import dưới dạng giá trị (không phải `import type`), giống `guest-repository.ts`. Nếu ESLint yêu cầu `import type`, làm theo ESLint.

- [ ] **Step 5: Kiểm tra** — `npx tsc --noEmit -p .` → không lỗi.

- [ ] **Step 6: Commit** `feat(graduation): store invitation settings in a single-row table`. `git add` các file sau: `prisma/schema.prisma`, `prisma/migrations/*_graduation_settings`, `lib/graduation/content/settings-store.ts`, `lib/graduation/settings-repository.ts` (cộng thêm `generated/` nếu Kiểm tra trước #1 trả về `tracked`).

---

### Task 24: Đọc settings ở server

**Files:**
- Create: `lib/graduation/content/read-settings.ts`
- Create: `lib/graduation/content/load-settings.ts`
- Create: `lib/graduation/content/load-content.ts`
- Test: `tests/lib/graduation/content/read-settings.test.ts`

**Interfaces:**
- Consumes: `SettingsStore`, `sanitizeSettings`, `settingsRepository`, `resolveGraduationContent`, `normalizeGuestContent`, `readOwnerPhone`, `InvitationGuest`.
- Produces:
  - `readSettings(store: Pick<SettingsStore, "read">): Promise<GraduationSettingsContent>`. Lỗi DB thì trả `{}` và ghi `console.warn`.
  - `loadGraduationSettings(): Promise<GraduationSettingsContent>` (bọc `React.cache`)
  - `loadGraduationContent(lang: Lang, guest: InvitationGuest | null): Promise<ResolvedContent>`

`load-settings.ts` và `load-content.ts` import Prisma (thông qua repository). Prisma ném lỗi ngay khi import nếu không có `DATABASE_URL`, nên **không test trực tiếp** hai file này; chỉ test `read-settings.ts`.

- [ ] **Step 1: Viết test**

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readSettings } from "@/lib/graduation/content/read-settings";

describe("readSettings", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sanitizes the stored row", async () => {
    const store = { read: async () => ({ copy: { vi: { "met.intro": "A", nope: "x" } } }) };
    expect((await readSettings(store)).copy?.vi).toEqual({ "met.intro": "A" });
  });
  it("returns empty settings when there is no row", async () => {
    expect(await readSettings({ read: async () => null })).toEqual({});
  });
  it("returns empty settings when the database fails", async () => {
    const store = { read: async () => Promise.reject(new Error("down")) };
    expect(await readSettings(store)).toEqual({});
    expect(console.warn).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận fail.**

- [ ] **Step 3: Viết code**

`read-settings.ts`:
```ts
import { sanitizeSettings } from "./sanitize-settings";
import type { GraduationSettingsContent } from "./settings-types";
import type { SettingsStore } from "./settings-store";

export async function readSettings(store: Pick<SettingsStore, "read">): Promise<GraduationSettingsContent> {
  try {
    return sanitizeSettings(await store.read());
  } catch (error) {
    console.warn("[graduation-settings] using defaults, could not read settings", error);
    return {};
  }
}
```

`load-settings.ts`:
```ts
import { cache } from "react";
import { settingsRepository } from "../settings-repository";
import { readSettings } from "./read-settings";

export const loadGraduationSettings = cache(() => readSettings(settingsRepository));
```

`load-content.ts`:
```ts
import type { Lang } from "../i18n/types";
import { readOwnerPhone } from "../owner-phone";
import type { InvitationGuest } from "../types";
import { loadGraduationSettings } from "./load-settings";
import { normalizeGuestContent } from "./normalize-guest-content";
import { resolveGraduationContent, type ResolvedContent } from "./resolve-content";

export async function loadGraduationContent(lang: Lang, guest: InvitationGuest | null): Promise<ResolvedContent> {
  const settings = await loadGraduationSettings();
  return resolveGraduationContent({
    lang,
    settings,
    guest: guest ? normalizeGuestContent(guest.customContent, guest.note) : null,
    envPhone: readOwnerPhone(),
  });
}
```

- [ ] **Step 4: Chạy test** → PASS. `npx tsc --noEmit -p .` → không lỗi.

- [ ] **Step 5: Commit** `feat(graduation): load settings and resolved content on the server`

---

### Task 25: `settings-service.ts`

**Files:**
- Create: `lib/graduation/content/settings-service.ts`
- Test: `tests/lib/graduation/content/settings-service.test.ts`

**Interfaces:**
- Consumes: `validateSettings`, `SettingsStore`.
- Produces: `saveSettings(store: Pick<SettingsStore, "write">, raw: unknown): Promise<SettingsValidation>`

- [ ] **Step 1: Viết test**

```ts
import { describe, expect, it, vi } from "vitest";
import { saveSettings } from "@/lib/graduation/content/settings-service";

describe("saveSettings", () => {
  it("writes validated, trimmed settings", async () => {
    const write = vi.fn(async () => {});
    const result = await saveSettings({ write }, { copy: { en: { "met.intro": " Hi " } } });
    expect(result.ok).toBe(true);
    expect(write).toHaveBeenCalledWith(expect.objectContaining({ copy: { en: { "met.intro": "Hi" } } }));
  });
  it("does not write invalid settings", async () => {
    const write = vi.fn(async () => {});
    const result = await saveSettings({ write }, { copy: { vi: { nope: "x" } } });
    expect(result).toEqual({ ok: false, fieldErrors: { "copy.vi.nope": "Trường không tồn tại" } });
    expect(write).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận fail.**

- [ ] **Step 3: Viết code**

```ts
import type { SettingsStore } from "./settings-store";
import { validateSettings, type SettingsValidation } from "./validate-settings";

export async function saveSettings(store: Pick<SettingsStore, "write">, raw: unknown): Promise<SettingsValidation> {
  const result = validateSettings(raw);
  if (result.ok) await store.write(result.data);
  return result;
}
```

- [ ] **Step 4: Chạy test** → PASS.

- [ ] **Step 5: Commit** `feat(graduation): validate-then-write settings service`

---


## Giai đoạn C: Nối trang thiệp vào nội dung đã ghép

Từ giai đoạn này, mỗi task có bước kiểm tra trên trình duyệt. Dev server: `npm run dev` (nếu chưa chạy). Lấy id khách ở `http://localhost:3000/admin/graduation` (cột Guest ID). Chạy kiểm tra cả **VI và EN** (nút VI/EN ở header) và cả **màn rộng lẫn màn 390px** (DevTools → Toggle device toolbar).

### Task 26: `LangProvider` dùng `resolveGraduationContent`

**Files:**
- Modify (viết lại): `components/graduation/i18n/lang-context.tsx`
- Modify: `components/graduation/invitation.tsx`
- Modify: `components/graduation/met/met-section.tsx`
- Modify: `app/graduation/[guest_id]/page.tsx` (chỉ hàm `GraduationGuestPage`)
- Delete: `lib/graduation/resolve-invitation-copy.ts`
- Delete: `tests/lib/graduation/resolve-invitation-copy.test.ts`

**Interfaces:**
- Consumes: `resolveGraduationContent`, `ResolvedContent` (Task 22), `loadGraduationSettings` (Task 24), `normalizeGuestContent` (Task 17), `GraduationSettingsContent`, `GuestContent`.
- Produces (từ `lang-context.tsx`):
  - `LangProvider` props: `{ initialLang: Lang; settings: GraduationSettingsContent; guest: GuestContent | null; guestId?: string | null; envPhone?: string | null; children: ReactNode }`
  - `useLang(): ResolvedContent & { lang: Lang; guestId: string | null; setLang(lang: Lang): void }`
  - `useCopy()`, `useGradEvent()` (giữ nguyên), thêm `useOwner(): ResolvedOwner`, `useImages(): ResolvedImages`
- Produces (`invitation.tsx`): props `GraduationInvitation` là `{ guest: InvitationGuest; guestContent: GuestContent; settings: GraduationSettingsContent; initialRsvp: RsvpAnswer | null; initialLang: Lang; envPhone: string | null }`. Prop `ownerPhone` cũ đổi tên thành `envPhone`.

**Kiểm tra trước:** `grep -rn "LangProvider" components app`. Chỉ `invitation.tsx` được dùng `LangProvider`. Nếu có chỗ khác thì dừng và hỏi.

- [ ] **Step 1: Viết lại `components/graduation/i18n/lang-context.tsx`**

```tsx
"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { resolveGraduationContent, type ResolvedContent } from "@/lib/graduation/content/resolve-content";
import type { GraduationSettingsContent, GuestContent } from "@/lib/graduation/content/settings-types";
import type { Lang } from "@/lib/graduation/i18n";
import { writeLangCookie } from "@/lib/graduation/i18n/lang-cookie";

type LangValue = ResolvedContent & { lang: Lang; guestId: string | null; setLang: (lang: Lang) => void };

type LangProviderProps = {
  initialLang: Lang;
  settings: GraduationSettingsContent;
  guest: GuestContent | null;
  guestId?: string | null;
  envPhone?: string | null;
  children: ReactNode;
};

const LangContext = createContext<LangValue | null>(null);

/** Cookie (not localStorage) so the server renders the chosen language without a flash. */
export function LangProvider({ initialLang, settings, guest, guestId = null, envPhone = null, children }: LangProviderProps) {
  const [lang, setLangState] = useState(initialLang);

  useEffect(() => {
    const previous = document.documentElement.lang;
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = previous;
    };
  }, [lang]);

  const setLang = (next: Lang) => {
    writeLangCookie(next);
    setLangState(next);
  };

  const content = useMemo(() => resolveGraduationContent({ lang, settings, guest, envPhone }), [lang, settings, guest, envPhone]);

  return <LangContext.Provider value={{ ...content, lang, guestId, setLang }}>{children}</LangContext.Provider>;
}

export function useLang(): LangValue {
  const value = useContext(LangContext);
  if (!value) throw new Error("useLang must be used inside <LangProvider>");
  return value;
}

/** Shorthand for components that only read copy. */
export const useCopy = () => useLang().copy;

/** Event data with the guest's customizations applied. */
export const useGradEvent = () => useLang().event;

export const useOwner = () => useLang().owner;

export const useImages = () => useLang().images;
```

- [ ] **Step 2: Sửa `components/graduation/invitation.tsx`**

1. Xóa `import { GRADUATION_EVENT } from "@/lib/graduation/event";`.
2. Thêm `import type { GraduationSettingsContent, GuestContent } from "@/lib/graduation/content/settings-types";`.
3. Sửa import lang-context: `import { LangProvider, useLang } from "./i18n/lang-context";`.
4. Thay `type InvitationProps`:
   ```ts
   type InvitationProps = {
     guest: InvitationGuest;
     guestContent: GuestContent;
     settings: GraduationSettingsContent;
     initialRsvp: RsvpAnswer | null;
     initialLang: Lang;
     envPhone: string | null;
   };
   ```
5. Thay thẻ mở `LangProvider`:
   ```tsx
   <LangProvider initialLang={props.initialLang} settings={props.settings} guest={props.guestContent} guestId={props.guest.id} envPhone={props.envPhone}>
   ```
6. Trong `InvitationContent`: đổi chữ ký thành `function InvitationContent({ guest, initialRsvp }: InvitationProps)`, thêm dòng đầu `const { owner, images, event } = useLang();`, đổi `const musicId = …` thành `const musicId = event.musicYoutubeId;`.
7. Đổi `ownerPhone={ownerPhone}` thành `ownerPhone={owner.phone}` (prop của `RsvpSection` giữ nguyên tên).
8. Đổi dòng `MetSection` thành `<MetSection guestName={guest.name} togetherPhoto={images.togetherPhoto} />`.

- [ ] **Step 3: Sửa `components/graduation/met/met-section.tsx`**

Chữ ký thành `export function MetSection({ guestName, togetherPhoto }: { guestName: string; togetherPhoto?: string })`, và trong `NoteFinaleStage` đổi `note={note ?? t.defaultNote}` thành `note={t.defaultNote}`.

- [ ] **Step 4: Sửa `GraduationGuestPage` trong `app/graduation/[guest_id]/page.tsx`**

Thêm import:
```ts
import { loadGraduationSettings } from "@/lib/graduation/content/load-settings";
import { normalizeGuestContent } from "@/lib/graduation/content/normalize-guest-content";
```
Thay phần thân sau `if (!found) notFound();`:
```tsx
  const [lang, settings] = await Promise.all([getGraduationLang(), loadGraduationSettings()]);
  return (
    <GraduationInvitation
      guest={found.guest}
      guestContent={normalizeGuestContent(found.guest.customContent, found.guest.note)}
      settings={settings}
      initialRsvp={found.rsvp}
      initialLang={lang}
      envPhone={readOwnerPhone()}
    />
  );
```
`generateMetadata` chưa sửa ở task này.

- [ ] **Step 5: Xóa resolver cũ**

```bash
git rm lib/graduation/resolve-invitation-copy.ts tests/lib/graduation/resolve-invitation-copy.test.ts
```
Chạy `grep -rn "resolve-invitation-copy\|resolveInvitationCopy" app components lib tests`. Kết quả phải rỗng.

- [ ] **Step 6: Kiểm tra**

- `npx tsc --noEmit -p .` → không lỗi.
- `npx vitest run tests/lib tests/components` → không có test fail mới (chỉ 2 test character đã fail sẵn).
- Trình duyệt: mở thiệp của một khách **có** custom cũ (ví dụ khách "test" có cột Custom Content). Lời chào, nội dung thiệp, kỷ niệm và lời nhắn phải giống trước khi sửa. Chuyển EN: các trường khách chỉ custom VI hiện bản EN mặc định, không có tiếng Việt lẫn vào. `document.body.innerText.includes("{")` → `false`.

- [ ] **Step 7: Commit** `feat(graduation): invitation reads layered settings and bilingual guest content`

---

### Task 27: Đồng hồ đếm ngược dùng giờ đã ghép

**Files:**
- Modify: `components/graduation/finale/use-countdown.ts`
- Modify: `components/graduation/finale/finale-section.tsx`

- [ ] **Step 1: Sửa `use-countdown.ts`**

Xóa `import { GRADUATION_EVENT } …`. Chữ ký thành:
```ts
export function useCountdown(startUtc: string, endUtc: string): CountdownResult | null {
```

- [ ] **Step 2: Sửa `finale-section.tsx`**

Đổi `import { useCopy } from "../i18n/lang-context";` thành `import { useCopy, useGradEvent } from "../i18n/lang-context";`. Thay `const countdown = useCountdown();` bằng:
```ts
  const event = useGradEvent();
  const countdown = useCountdown(event.startUtc, event.endUtc);
```
**Kiểm tra trước:** nếu `finale-section.tsx` đã có biến tên `event` trong cùng hàm, dùng tên `gradEvent` thay cho `event`.

- [ ] **Step 3: Kiểm tra** — `npx tsc --noEmit -p .`; `npx vitest run tests/components/graduation/finale` → PASS. Trên trình duyệt, cuộn tới Finale: số ngày đếm ngược khớp với 16:30 ngày 28/11 giờ VN.

- [ ] **Step 4: Commit** `fix(graduation): countdown follows the resolved event time`

---

### Task 28: Lịch Google/Apple và file `.ics` theo khách

**Files:**
- Modify: `lib/graduation/calendar.ts`
- Modify: `components/graduation/shared/add-to-calendar.tsx`
- Create: `lib/graduation/ics-response.ts`
- Modify (viết lại): `app/graduation/calendar.ics/route.ts`
- Modify: `tests/lib/graduation/calendar.test.ts`
- Create: `tests/lib/graduation/ics-response.test.ts`
- Delete: `tests/app/graduation/calendar-ics-route.test.ts`

**Interfaces:**
- Produces:
  - `calendarLinks(event: GraduationEvent, guestId?: string | null): Record<CalendarTarget, string>`. Có `guestId` thì Apple dùng `${ICS_PATH}?g=<id đã encode>`.
  - `icsResponse(event: GraduationEvent, ownerName: string, now?: Date): Response`

`route.ts` gọi Prisma và `cookies()` nên không test được trực tiếp. Phần dựng Response được tách ra `ics-response.ts` để test.

- [ ] **Step 1: Viết test**

Thêm vào `tests/lib/graduation/calendar.test.ts` (trong `describe`):
```ts
  it("points Apple Calendar at the guest's own .ics file", () => {
    expect(calendarLinks(GRADUATION_EVENT, "a b").apple).toBe(`${ICS_PATH}?g=a%20b`);
  });
```

`tests/lib/graduation/ics-response.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { GRADUATION_EVENT } from "@/lib/graduation/event";
import { icsResponse } from "@/lib/graduation/ics-response";

describe("icsResponse", () => {
  const res = icsResponse(GRADUATION_EVENT, "Võ Lê Quang Vinh", new Date("2026-11-08T00:00:00Z"));

  it("serves an inline calendar file named after the owner", () => {
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/calendar; charset=utf-8");
    expect(res.headers.get("content-disposition")).toBe('inline; filename="tot-nghiep-vo-le-quang-vinh.ics"');
  });
  it("contains the event", async () => {
    const body = await res.text();
    expect(body.startsWith("BEGIN:VCALENDAR")).toBe(true);
    expect(body).toContain("DTSTART:20261128T093000Z");
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận fail.**

- [ ] **Step 3: Viết code**

`lib/graduation/calendar.ts`: đổi hàm thành
```ts
export function calendarLinks(event: GraduationEvent, guestId?: string | null): Record<CalendarTarget, string> {
  const dates = `${toIcsDate(new Date(event.startUtc))}/${toIcsDate(new Date(event.endUtc))}`;
  const google =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(event.title)}` +
    `&dates=${dates}` +
    `&location=${encodeURIComponent(eventLocation(event))}`;
  const apple = guestId ? `${ICS_PATH}?g=${encodeURIComponent(guestId)}` : ICS_PATH;
  return { google, apple };
}
```

`lib/graduation/ics-response.ts`:
```ts
import type { GraduationEvent } from "./event";
import { buildIcs } from "./ics";
import { toSlug } from "./slug";

export const icsResponse = (event: GraduationEvent, ownerName: string, now = new Date()) =>
  new Response(buildIcs(event, now), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="tot-nghiep-${toSlug(ownerName)}.ics"`,
    },
  });
```

`app/graduation/calendar.ics/route.ts`:
```ts
import { loadGraduationContent } from "@/lib/graduation/content/load-content";
import { getInvitationGuest } from "@/lib/graduation/get-invitation-guest";
import { getGraduationLang } from "@/lib/graduation/i18n/get-lang";
import { icsResponse } from "@/lib/graduation/ics-response";

export async function GET(request: Request) {
  const guestKey = new URL(request.url).searchParams.get("g");
  const found = guestKey ? await getInvitationGuest(guestKey).catch(() => null) : null;
  const { event, owner } = await loadGraduationContent(await getGraduationLang(), found?.guest ?? null);
  return icsResponse(event, owner.name);
}
```

`components/graduation/shared/add-to-calendar.tsx`: đổi import thành `import { useCopy, useLang } from "../i18n/lang-context";`, và thay `const links = calendarLinks(useGradEvent());` bằng:
```ts
  const { event, guestId } = useLang();
  const links = calendarLinks(event, guestId);
```

Xóa test route cũ: `git rm tests/app/graduation/calendar-ics-route.test.ts`.

- [ ] **Step 4: Chạy test** — `npx vitest run tests/lib/graduation` → PASS; `npx tsc --noEmit -p .` → không lỗi.

- [ ] **Step 5: Trình duyệt** — Ở phần Ends, bấm "Thêm vào lịch". Link Google mở với giờ 16:30–18:30 (giờ VN). Mở `http://localhost:3000/graduation/calendar.ics?g=<guestId>`: file tải về có `DTSTART:20261128T093000Z`.

- [ ] **Step 6: Commit** `feat(graduation): calendar links and .ics follow the guest's event time`

---

### Task 29: Bản đồ và tour 360° đọc event đã ghép

**Files:**
- Modify: `components/graduation/ends/venue-guide/venue-guide.tsx`

- [ ] **Step 1: Sửa code**

Xóa `import { GRADUATION_EVENT as E } from "@/lib/graduation/event";`. Đổi `import { useCopy } from "../../i18n/lang-context";` thành `import { useCopy, useGradEvent } from "../../i18n/lang-context";`. Trong hàm `VenueGuide`, ngay sau dòng `const { ends } = useCopy();` thêm:
```ts
  const E = useGradEvent();
```

**Kiểm tra trước:** `E` phải được khai báo trong thân component, trước mọi chỗ dùng `E.`. Nếu `E.` được dùng trong một hàm/const ở ngoài component, dừng lại và hỏi.

- [ ] **Step 2: Kiểm tra** — `npx tsc --noEmit -p .`. Trên trình duyệt: tab Bản đồ vẫn tải, tab Tour vẫn mở được.

- [ ] **Step 3: Commit** `feat(graduation): venue guide links come from settings`

---

### Task 30: Nút "Portfolio" ở header và trang 404

**Files:**
- Modify: `components/graduation/chrome/invitation-header.tsx:25`
- Modify (viết lại): `app/graduation/not-found.tsx`

- [ ] **Step 1: Header** — thay
```tsx
          ←<span className="max-sm:sr-only"> Portfolio</span>
```
bằng
```tsx
          ←<span className="max-sm:sr-only"> {t.header.back}</span>
```
(`t` đã là `useCopy()` trong file.)

- [ ] **Step 2: Trang 404**

```tsx
import { RisoButton } from "@/components/ui/riso/button";
import { SectionHeading } from "@/components/graduation/shared/section-heading";
import { SectionKicker } from "@/components/graduation/shared/section-kicker";
import { loadGraduationContent } from "@/lib/graduation/content/load-content";
import { getGraduationLang } from "@/lib/graduation/i18n/get-lang";

export default async function GraduationNotFound() {
  const lang = await getGraduationLang();
  const { copy } = await loadGraduationContent(lang, null);
  const t = copy.notFound;
  return (
    <main lang={lang} className="grid min-h-screen place-items-center bg-paper px-6 text-center text-ink">
      <div className="flex flex-col items-center gap-6">
        <SectionKicker align="center">{t.kicker}</SectionKicker>
        <SectionHeading as="h1" size="cover" lead={t.heading.lead} accent={t.heading.accent} />
        <p className="m-0 max-w-[40ch] text-ink-2">{t.body}</p>
        <RisoButton variant="secondary" size="md" href="/">← {copy.header.back}</RisoButton>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Kiểm tra** — `npx tsc --noEmit -p .`. Mở `http://localhost:3000/graduation/khong-ton-tai` → trang 404 hiện đúng, nút "← Portfolio".

- [ ] **Step 4: Commit** `feat(graduation): editable back link on the header and 404 page`

---

### Task 31: Thiệp mời (`invitation-card.tsx`)

**Files:**
- Modify: `components/graduation/envelope/invitation-card.tsx`

- [ ] **Step 1: Sửa ba chỗ**

- `<span className="text-tomato">Fig · 01</span>` → `<span className="text-tomato">{t.fig}</span>`
- `alt="Cover"` → `alt={t.coverAlt}`
- `{t.author || "— Vinh (Tom)"}` → `{t.author}`

- [ ] **Step 2: Kiểm tra** — `npx tsc --noEmit -p .`. Thiệp ở phần lời chào hiện "Fig · 01" và "— Vinh (Tom)" như trước.

- [ ] **Step 3: Commit** `feat(graduation): invitation card labels come from copy`

---

### Task 32: Khung polaroid và logo huy hiệu

**Files:**
- Modify: `components/graduation/met/components/polaroid-frame.tsx`
- Modify: `components/graduation/met/components/bk-badge.tsx`

- [ ] **Step 1: `polaroid-frame.tsx`**

Thêm `import { useCopy } from "../../i18n/lang-context";`. Trong `PolaroidFrame`, dòng đầu thân hàm thêm `const { met } = useCopy();`, và thay `{guestName} · 2026` bằng `{met.polaroidCaption(guestName)}`.

- [ ] **Step 2: `bk-badge.tsx`**

Thêm `import { useImages } from "../../i18n/lang-context";`. Dòng đầu thân `BkBadge` thêm `const { badgeLogo } = useImages();`. Trong `<Image …>` đổi `src="/01_logobachkhoatoi.webp"` thành `src={badgeLogo}` và thêm prop `unoptimized={!badgeLogo.startsWith("/")}`.

Lý do có `unoptimized`: `next.config.ts` chỉ cho `next/image` tối ưu đường dẫn nội bộ (`localPatterns`). Logo dán bằng link `https://` sẽ lỗi nếu không bỏ tối ưu. Đây là điều không đọc ra được từ code của file này, nên cho phép một comment ngắn ngay trên prop:
```tsx
          // next.config only allows local paths through the image optimizer.
          unoptimized={!badgeLogo.startsWith("/")}
```

**Kiểm tra trước:** `bk-badge.tsx` không có `"use client"` nhưng được render trong `met-section.tsx` (`"use client"`), nên dùng hook được. Kiểm tra mọi nơi import `BkBadge`: `grep -rn "BkBadge" components`. Nếu có nơi render ngoài cây `LangProvider` thì dừng và hỏi.

- [ ] **Step 3: Kiểm tra** — `npx tsc --noEmit -p .`. Trình duyệt: huy hiệu BK vẫn chạy dọc trail; chân polaroid hiện "<tên khách> · 2026".

- [ ] **Step 4: Commit** `feat(graduation): polaroid caption and badge logo from settings`

---

### Task 33: Tem, dấu sáp và dấu bưu điện

**Files:**
- Create: `components/graduation/shared/use-postmark-lines.ts`
- Modify: `components/graduation/shared/stamp.tsx`
- Modify: `components/graduation/shared/wax-seal.tsx`
- Modify: `components/graduation/envelope/envelope-front.tsx:18`
- Modify: `components/graduation/rsvp/reply-postcard.tsx:48`

**Interfaces:**
- Produces: `usePostmarkLines(): [string, string, string]` → `[marks.school, "· {year} ·", marks.city]`

- [ ] **Step 1: Tạo hook**

```ts
import { useCopy, useGradEvent } from "../i18n/lang-context";

export function usePostmarkLines(): [string, string, string] {
  const { marks } = useCopy();
  const { year } = useGradEvent();
  return [marks.school, `· ${year} ·`, marks.city];
}
```

- [ ] **Step 2: Dùng hook**

`envelope-front.tsx`: thêm `import { usePostmarkLines } from "../shared/use-postmark-lines";`, trong component thêm `const postmark = usePostmarkLines();`, đổi `lines={["HCMUT", "· 2026 ·", "TP.HCM"]}` thành `lines={postmark}`.

`reply-postcard.tsx`: làm y hệt (import từ `"../shared/use-postmark-lines"`). Gọi hook ở đầu component chứa dòng 48, **trước** mọi `return` sớm.

- [ ] **Step 3: `stamp.tsx`**

```tsx
import { useGradEvent, useOwner } from "../i18n/lang-context";

export function Stamp({ className = "" }: { className?: string }) {
  const { initials } = useOwner();
  const { year } = useGradEvent();
  return (
    <div
      aria-hidden
      className={`box-border flex h-20.5 w-17 flex-col items-center justify-center gap-0.5 border-[1.5px] border-ink bg-canary outline-[3px] outline-offset-[-7px] outline-paper outline-dotted ${className}`}
      style={{ boxShadow: "var(--offset-sm)" }}
    >
      <span className="font-heading text-2xl leading-none font-bold text-(--on-canary)">{initials}</span>
      <span className="font-mono text-[9px] tracking-[0.18em] text-(--on-canary)">{year}</span>
    </div>
  );
}
```

- [ ] **Step 4: `wax-seal.tsx`**

Thêm `import { useOwner } from "../i18n/lang-context";`. Đầu thân `WaxSeal` thêm `const { initials } = useOwner();`. Đổi `>QV<` thành `>{initials}<`. Sửa doc comment `/** The "QV" wax seal, …` thành `/** The owner's initials wax seal, drawn as two halves so \`split\` can crack it open. */`, vì comment cũ sẽ sai.

**Kiểm tra trước:** `grep -rn "WaxSeal\|<Stamp" components`. Mọi nơi dùng phải nằm trong cây `GraduationInvitation`. Nếu có nơi khác thì dừng và hỏi.

- [ ] **Step 5: Kiểm tra** — `npx tsc --noEmit -p .`. Trình duyệt: phong bì có tem "QV / 2026", dấu sáp "QV", dấu bưu điện "HCMUT · 2026 · TP.HCM"; gửi RSVP "không đến" → bưu thiếp hiện dấu bưu điện giống vậy.

- [ ] **Step 6: Commit** `feat(graduation): stamps and seals use the owner's initials and event year`

---

### Task 34: Thẻ hồi âm ở Finale

**Files:**
- Modify: `components/graduation/finale/finale-reply-card.tsx`

- [ ] **Step 1: Sửa code**

Đổi `const { finale: t, rsvp: rsvpCopy } = useCopy();` thành `const { finale: t, rsvp: rsvpCopy, marks } = useCopy();`. Thay:
- `QV · 2026` (dòng 39) → `{marks.signature}`
- `<span>HCMUT</span>` → `<span>{marks.school}</span>`
- `<span>28.11.2026</span>` → `<span>{t.dateMark}</span>`

- [ ] **Step 2: Kiểm tra** — `npx tsc --noEmit -p .`. Trình duyệt: thẻ hồi âm ở Finale hiện "QV · 2026", "HCMUT", "28.11.2026" (EN: "Nov 28, 2026").

- [ ] **Step 3: Commit** `feat(graduation): reply card marks come from copy`

---

### Task 35: Bưu thiếp lời chúc

**Files:**
- Modify: `components/graduation/wishes/wish-postcard.tsx`

- [ ] **Step 1: Sửa code**

Đổi import thành `import { useCopy, useGradEvent, useOwner } from "../i18n/lang-context";`.

Trong `AirmailCard`: đổi `const { wishes: t, envelope } = useCopy();` thành `const { wishes: t, envelope, marks } = useCopy();`, rồi thêm ngay dưới:
```ts
  const owner = useOwner();
  const { year } = useGradEvent();
```
Thay:
- hai chỗ `2026` trong JSX của `AirmailCard` (dòng 47 và 54) → `{year}`
- `TP.HCM` (dòng 51) → `{marks.city}`
- `[t.to, "Võ Lê Quang Vinh"],` → `[t.to, owner.name],`

Trong `IndexCard`: thêm `const { year } = useGradEvent();` ở đầu thân hàm, và đổi `{bee.date}.2026` thành `{bee.date}.{year}`.

**Kiểm tra trước:** đọc lại dòng 40–105 sau khi sửa. `grep -n "2026\|Võ Lê\|TP.HCM" components/graduation/wishes/wish-postcard.tsx` phải trả rỗng.

- [ ] **Step 2: Kiểm tra** — `npx tsc --noEmit -p .`. Trình duyệt: bấm một ô lời chúc, bưu thiếp hiện đúng tên chủ thiệp, năm, "TP.HCM".

- [ ] **Step 3: Commit** `feat(graduation): wish postcard uses owner name, city and event year`

---

### Task 36: Footer

`InvitationFooter` hiện không được render (bị comment trong `invitation.tsx`), nhưng vẫn sửa để không còn tên viết cứng.

**Files:**
- Modify: `components/graduation/chrome/invitation-footer.tsx`

- [ ] **Step 1: Viết lại**

```tsx
"use client";

import { useCopy, useOwner } from "../i18n/lang-context";

export function InvitationFooter() {
  const { marks } = useCopy();
  const owner = useOwner();
  return (
    <footer className="relative z-30 border-t-[1.5px] border-ink bg-ink px-6 py-6 text-paper min-[760px]:px-[clamp(72px,8vw,128px)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between font-mono text-[11px] tracking-[0.2em] uppercase">
        <span className="text-canary">{marks.signature}</span>
        <span>{owner.name}</span>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Kiểm tra** — `npx tsc --noEmit -p .`.

- [ ] **Step 3: Commit** `feat(graduation): footer reads owner details`

---

### Task 37: Metadata của trang thiệp

**Files:**
- Modify: `app/graduation/[guest_id]/page.tsx` (hàm `generateMetadata`)

- [ ] **Step 1: Sửa code**

Xóa `import { GRADUATION_COPY } from "@/lib/graduation/i18n";`, thêm `import { loadGraduationContent } from "@/lib/graduation/content/load-content";`. Thay thân `generateMetadata` từ dòng `const lang = …` tới trước `return {`:
```ts
  const lang = await getGraduationLang();
  const { copy, owner } = await loadGraduationContent(lang, found?.guest ?? null);
  const title = found ? copy.meta.guestTitle(found.guest.name) : copy.meta.title;
  const description = copy.meta.description;
```
và đổi `siteName: "Võ Lê Quang Vinh",` thành `siteName: owner.name,`.

- [ ] **Step 2: Kiểm tra** — `npx tsc --noEmit -p .`. Trình duyệt: tiêu đề tab là "Thư mời tốt nghiệp · <tên khách>".

- [ ] **Step 3: Commit** `feat(graduation): page metadata from resolved content`

---

### Task 38: Ảnh OG

**Files:**
- Modify: `app/graduation/[guest_id]/opengraph-image.tsx`

`alt` vẫn là hằng số, vì Next đọc nó lúc build (theo spec).

- [ ] **Step 1: Sửa code**

1. Xóa `import { GRADUATION_COPY } …` và dòng `const copy = GRADUATION_COPY.vi;`, cùng comment `// Link previews are always Vietnamese…` ngay trên nó.
2. Thêm import:
   ```ts
   import { loadGraduationContent } from "@/lib/graduation/content/load-content";
   import { getGraduationLang } from "@/lib/graduation/i18n/get-lang";
   import type { InvitationGuest } from "@/lib/graduation/types";
   ```
3. Thay hàm `guestName` bằng:
   ```ts
   async function findGuest(params: Params | Promise<Params>): Promise<InvitationGuest | null> {
     const { guest_id } = await params;
     if (!guest_id) return null;
     try {
       return (await getInvitationGuest(guest_id))?.guest ?? null;
     } catch {
       // A DB hiccup should still leave the link with the generic preview, not a broken image.
       return null;
     }
   }
   ```
4. Trong `Image`, thay dòng đầu bằng:
   ```ts
     const [guest, font, lang] = await Promise.all([findGuest(params), loadFont(), getGraduationLang()]);
     const { copy } = await loadGraduationContent(lang, guest);
     const name = guest?.name ?? null;
   ```
   Phần JSX bên dưới giữ nguyên (vẫn dùng `copy.` và `name`).

Crawler không gửi cookie, nên `getGraduationLang()` trả `vi`. Đúng hành vi cũ.

- [ ] **Step 2: Kiểm tra** — `npx tsc --noEmit -p .`. Mở `http://localhost:3000/graduation/<id>/opengraph-image` → ảnh hiện tên khách, "Từ: Võ Lê Quang Vinh", "Thứ Bảy 28.11.2026".

- [ ] **Step 3: Commit** `feat(graduation): link preview image from resolved content`

---

### Task 39: Ảnh thiệp PNG

**Files:**
- Modify: `app/graduation/[guest_id]/card/route.tsx`

- [ ] **Step 1: Sửa phần dữ liệu**

1. Xóa `import { GRADUATION_COPY } …`, dòng `const copy = GRADUATION_COPY.vi;` và hằng `MAP_URL`.
2. Thêm import:
   ```ts
   import { loadGraduationContent } from "@/lib/graduation/content/load-content";
   import { getGraduationLang } from "@/lib/graduation/i18n/get-lang";
   import type { InvitationGuest } from "@/lib/graduation/types";
   ```
3. Thay khối tìm tên khách (từ `let name = "";` tới hết khối `if (guest_id) { … }`) bằng:
   ```ts
   let guest: InvitationGuest | null = null;
   if (guest_id) {
     try {
       guest = (await getInvitationGuest(guest_id))?.guest ?? null;
     } catch {
       guest = null;
     }
   }
   const name = guest?.name ?? "";
   const { copy, event, owner } = await loadGraduationContent(await getGraduationLang(), guest);
   ```
4. Trong `QRCode.toDataURL(MAP_URL, …)` đổi `MAP_URL` thành `event.mapLinkUrl`.

- [ ] **Step 2: Sửa phần chữ trong JSX** (thay đúng từng chuỗi):

| Hiện tại | Thay bằng |
|---|---|
| `HCMUT · 2026 · TP.HCM` | `{`${copy.marks.school} · ${event.year} · ${copy.marks.city}`}` |
| `nameFontSize(name \|\| "Quý khách")` | `nameFontSize(name \|\| copy.png.guestFallback)` |
| `Đến tham dự Lễ tốt nghiệp Kỹ sư của Võ Lê Quang Vinh` | `{copy.png.attend}` |
| `K22 · Khoa học Máy tính · Trường ĐH Bách Khoa — ĐHQG-HCM` | `{copy.png.faculty}` |
| `{copy.rails.whenValue} · 16:30 — 18:30` | `{copy.rails.whenValue} · {event.timeRange}` |
| `alt="QR Thiệp mời"` | `alt={copy.png.qrWebAlt}` |
| `QUÉT XEM THIỆP` | `{copy.png.qrWebTitle}` |
| `Trang web thiệp mời, gửi lời chúc & hồi âm` | `{copy.png.qrWebBody}` |
| `alt="QR Chỉ đường"` | `alt={copy.png.qrMapAlt}` |
| `CHỈ ĐƯỜNG ĐẾN LỄ` | `{copy.png.qrMapTitle}` |
| `Mở Google Maps chỉ đường đến Hội trường A5` | `{copy.png.qrMapBody}` |
| `Rất vinh hạnh được đón tiếp bạn trong ngày vui này!` | `{copy.png.footer}` |
| `vinhvolequang.io.vn` | `{owner.website}` |

Các comment JSX đã có (`{/* Top header */}` …) giữ nguyên.

**Kiểm tra trước:** sau khi sửa, chạy `grep -nE "HCMUT|2026|Quý khách|Võ Lê|vinhvolequang|QUÉT|CHỈ ĐƯỜNG|Rất vinh hạnh|16:30" "app/graduation/[guest_id]/card/route.tsx"`. Kết quả phải rỗng.

- [ ] **Step 3: Kiểm tra** — `npx tsc --noEmit -p .`. Ở phần Finale, bấm "Tải ảnh thiệp mời (PNG)" ở cả VI và EN. Ảnh VI giống hệt trước; ảnh EN dùng chữ EN. Quét mã QR chỉ đường → mở đúng Google Maps.

- [ ] **Step 4: Commit** `feat(graduation): printable card follows settings and language`

---

### Task 40: Bỏ `GRADUATION_COPY`

Sau Task 39, `GRADUATION_COPY` chỉ còn được test dùng.

**Files:**
- Modify: `lib/graduation/i18n/index.ts`
- Modify: `tests/lib/graduation/i18n/i18n.test.ts`
- Modify: `tests/lib/graduation/content/resolve-event.test.ts`
- Modify: `tests/lib/graduation/content/resolve-content.test.ts`

**Kiểm tra trước:** `grep -rn "GRADUATION_COPY" app components lib`. Chỉ còn `lib/graduation/i18n/index.ts`. Nếu còn chỗ khác thì dừng và hỏi.

- [ ] **Step 1: Sửa test để dùng resolver**

Trong cả ba file test, bỏ `GRADUATION_COPY` khỏi dòng import từ `"@/lib/graduation/i18n"`, giữ các tên khác (`i18n.test.ts` còn `DEFAULT_LANG`, `parseLang`). Nếu dòng import đó không còn tên nào thì xóa cả dòng. Sau đó thêm:
```ts
import { resolveGraduationContent } from "@/lib/graduation/content/resolve-content";

const GRADUATION_COPY = { vi: resolveGraduationContent({ lang: "vi" }).copy, en: resolveGraduationContent({ lang: "en" }).copy };
```
(Trong `resolve-content.test.ts`, `resolveGraduationContent` đã được import, nên chỉ thêm dòng `const GRADUATION_COPY = …`.)

- [ ] **Step 2: Sửa `lib/graduation/i18n/index.ts`**

Xóa các import `composeCopy`, `copyVars`, `DEFAULT_OWNER`, `GRADUATION_EVENT`, `GraduationCopy`; xóa `defaultCopy` và `GRADUATION_COPY`. Giữ `DEFAULT_TEXTS`, `DEFAULT_MOMENT_TEXTS`, `DEFAULT_MOMENTS` và các dòng re-export. Dòng `export type { … }` vẫn export `GraduationCopy`.

- [ ] **Step 3: Kiểm tra** — `npx vitest run tests/lib/graduation` → PASS; `npx tsc --noEmit -p .` → không lỗi.

- [ ] **Step 4: Commit** `refactor(graduation): drop the static default copy export`

---


## Giai đoạn D: Component dùng chung cho admin

Component đặt trong `app/admin/graduation/components/fields/`. Mọi component tương tác đều có `"use client"` ở dòng đầu. Kiểu chữ, màu sắc theo `field-classes.ts`; không viết lại chuỗi class dài ở nơi khác.

### Task 41: `AdminShell` và thông báo hết phiên dùng chung

**Files:**
- Create: `app/admin/components/admin-shell.tsx`
- Create: `app/admin/graduation/session-expired.ts`
- Modify: `app/admin/graduation/page.tsx`
- Modify: `app/admin/graduation/actions.ts`

**Interfaces:**
- Produces:
  - `AdminShell({ title, description, children }: { title: string; description: ReactNode; children: ReactNode })`
  - `SESSION_EXPIRED_ERROR` (chuỗi). File `"use server"` chỉ được export hàm async, nên hằng số này phải nằm ở file riêng.

**Kiểm tra trước:** đọc `app/admin/page.tsx`. Nếu khối header (h1 "Admin Dashboard" + mô tả + `AdminNav`) giống hệt `app/admin/graduation/page.tsx` thì dùng `AdminShell` cho cả trang đó trong task này; nếu khác thì chỉ dùng cho trang graduation.

- [ ] **Step 1: Tạo `app/admin/components/admin-shell.tsx`**

```tsx
import type { ReactNode } from "react";
import { AdminNav } from "./admin-nav";

type AdminShellProps = { title: string; description: ReactNode; children: ReactNode };

export function AdminShell({ title, description, children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-zinc-950 p-6 text-white sm:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-400">Hệ thống quản trị và phân phối thiệp mời Lễ tốt nghiệp</p>
        </div>

        <AdminNav />

        <div className="mb-6 flex flex-col gap-1">
          <h2 className="text-xl font-bold text-zinc-100">{title}</h2>
          <p className="text-xs text-zinc-400">{description}</p>
        </div>

        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Dùng trong `app/admin/graduation/page.tsx`**

Thay toàn bộ JSX trả về (sau `const guests = …`) bằng:
```tsx
  return (
    <AdminShell
      title="Danh sách khách mời & Tùy biến thiệp"
      description={
        <>
          Tạo link cá nhân hóa dạng <code className="text-sky-300">graduation/{`{guest_id}`}</code>, tùy biến bìa thiệp, kỷ niệm, thời gian
          và địa điểm riêng cho từng người.
        </>
      }
    >
      <GraduationManager initialGuests={guests} />
    </AdminShell>
  );
```
Đổi import `AdminNav` thành `import { AdminShell } from "../components/admin-shell";`.

- [ ] **Step 3: Hằng số hết phiên**

`app/admin/graduation/session-expired.ts`:
```ts
export const SESSION_EXPIRED_ERROR = "Phiên đăng nhập đã hết hạn, hãy đăng nhập lại";
```
Trong `app/admin/graduation/actions.ts`: xóa dòng `const SESSION_EXPIRED_ERROR = …`, thêm `import { SESSION_EXPIRED_ERROR } from "./session-expired";`.

- [ ] **Step 4: Kiểm tra** — `npx tsc --noEmit -p .`. Mở `/admin/graduation`: giao diện giống hệt trước.

- [ ] **Step 5: Commit** `refactor(admin): shared admin page shell and session-expired message`

---

### Task 42: Class dùng chung, nhãn chỗ trống, chèn chỗ trống

**Files:**
- Create: `app/admin/graduation/components/fields/field-classes.ts`
- Create: `app/admin/graduation/components/fields/token-labels.ts`
- Create: `app/admin/graduation/components/fields/insert-token.ts`
- Create: `app/admin/graduation/components/fields/riso-color-options.ts`
- Modify: `app/admin/graduation/components/tabs/music-tab.tsx` (dùng `INPUT_CLASS`, `PANEL_CLASS`, `LABEL_CLASS`)
- Test: `tests/app/admin/graduation/fields/insert-token.test.ts`
- Test: `tests/app/admin/graduation/fields/token-labels.test.ts`

**Interfaces:**
- Produces:
  - `INPUT_CLASS`, `LABEL_CLASS`, `PANEL_CLASS`, `HINT_CLASS`, `ERROR_CLASS`, `ERROR_BORDER_CLASS`, `SMALL_BUTTON_CLASS`, `GROUP_TITLE_CLASS`
  - `TOKEN_LABELS: Readonly<Record<string, string>>`
  - `insertToken(value: string, start: number, end: number, token: string): { value: string; caret: number }`
  - `RISO_COLOR_OPTIONS: readonly { value: RisoColor; label: string }[]`

- [ ] **Step 1: Viết test**

`insert-token.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { insertToken } from "@/app/admin/graduation/components/fields/insert-token";

describe("insertToken", () => {
  it("inserts at the caret", () => {
    expect(insertToken("Hi !", 3, 3, "name")).toEqual({ value: "Hi {name}!", caret: 9 });
  });
  it("replaces the selection", () => {
    expect(insertToken("Hi you!", 3, 6, "name")).toEqual({ value: "Hi {name}!", caret: 9 });
  });
});
```

`token-labels.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { TOKEN_LABELS } from "@/app/admin/graduation/components/fields/token-labels";
import { COPY_FIELDS } from "@/lib/graduation/content/fields";
import { allowedTokens } from "@/lib/graduation/content/fields/tokens";

describe("TOKEN_LABELS", () => {
  it("labels every token a field can use", () => {
    const tokens = new Set(COPY_FIELDS.flatMap((field) => allowedTokens(field)));
    expect([...tokens].filter((token) => !TOKEN_LABELS[token])).toEqual([]);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận fail.**

- [ ] **Step 3: Viết code**

`field-classes.ts` (chuỗi class lấy từ các tab admin hiện có):
```ts
export const INPUT_CLASS =
  "w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500";
export const ERROR_BORDER_CLASS = "border-red-500";
export const LABEL_CLASS = "mb-1 block text-xs text-zinc-400";
export const HINT_CLASS = "mt-1 block text-[11px] text-zinc-500";
export const ERROR_CLASS = "mt-1 block text-xs text-red-400";
export const PANEL_CLASS = "rounded-lg border border-zinc-800 bg-zinc-900/50 p-3";
export const GROUP_TITLE_CLASS = "mb-2 text-xs font-semibold tracking-wider text-zinc-400 uppercase";
export const SMALL_BUTTON_CLASS =
  "inline-flex items-center gap-1 rounded bg-zinc-800 px-2.5 py-1 text-xs font-medium text-sky-400 hover:bg-zinc-700 disabled:opacity-40";
```

`token-labels.ts`:
```ts
export const TOKEN_LABELS: Readonly<Record<string, string>> = {
  name: "Tên khách",
  n: "Số thứ tự lời chúc",
  calendar: "Tên lịch còn lại",
  owner: "Tên chủ thiệp",
  initials: "Chữ viết tắt chủ thiệp",
  date: "Ngày (28.11 / Nov 28)",
  year: "Năm",
  weekday: "Thứ (Thứ Bảy / Saturday)",
  weekdayShort: "Thứ viết tắt (T7 / Sat)",
  time: "Giờ (16:30 — 18:30)",
};
```

`insert-token.ts`:
```ts
export function insertToken(value: string, start: number, end: number, token: string) {
  const text = `{${token}}`;
  return { value: value.slice(0, start) + text + value.slice(end), caret: start + text.length };
}
```

`riso-color-options.ts` (nhãn lấy từ `tabs/moments-tab.tsx` hiện tại):
```ts
import type { RisoColor } from "@/lib/graduation/event";

export const RISO_COLOR_OPTIONS: readonly { value: RisoColor; label: string }[] = [
  { value: "tomato", label: "Tomato (Đỏ cam)" },
  { value: "blue", label: "Blue (Xanh dương)" },
  { value: "jade", label: "Jade (Xanh ngọc)" },
  { value: "canary", label: "Canary (Vàng)" },
];
```

`music-tab.tsx`: xóa hằng `inputClass` cục bộ, import `INPUT_CLASS, LABEL_CLASS, PANEL_CLASS` từ `"../fields/field-classes"`, đổi `className={inputClass}` thành `className={INPUT_CLASS}`, div ngoài `rounded-lg border border-zinc-800 bg-zinc-900/50 p-3` thành `className={PANEL_CLASS}`, label `mb-1 block text-xs text-zinc-400` thành `className={LABEL_CLASS}`.

- [ ] **Step 4: Chạy test** — `npx vitest run tests/app/admin/graduation/fields` → PASS. `npx tsc --noEmit -p .` → không lỗi.

- [ ] **Step 5: Commit** `feat(admin): shared field styles, token labels and caret insertion`

---

### Task 43: Ô nhập hai ngôn ngữ

**Files:**
- Create: `app/admin/graduation/components/fields/row-field.ts`
- Create: `app/admin/graduation/components/fields/template-chips.tsx`
- Create: `app/admin/graduation/components/fields/localized-input.tsx`
- Create: `app/admin/graduation/components/fields/bilingual-row.tsx`
- Test: `tests/app/admin/graduation/fields/row-field.test.ts`

**Interfaces:**
- Consumes: `CopyField`, `allowedTokens`, `LANGS`, `Lang`, `insertToken`, `TOKEN_LABELS`, class từ `field-classes.ts`.
- Produces:
  - `type RowField = { key: string; label: string; multiline: boolean; tokens: readonly string[] }`
  - `toRowField(field: CopyField): RowField`
  - `TemplateChips({ tokens, onInsert }: { tokens: readonly string[]; onInsert: (token: string) => void })`
  - `LocalizedInput({ lang, value, placeholder, multiline, tokens, error, onChange })`
  - `BilingualRow({ field, values, placeholders, errors, onChange, onReset })` với `values: Record<Lang, string>`, `placeholders: Record<Lang, string>`, `errors?: Partial<Record<Lang, string>>`, `onChange(lang: Lang, value: string)`, `onReset()`

- [ ] **Step 1: Viết test**

```ts
import { describe, expect, it } from "vitest";
import { toRowField } from "@/app/admin/graduation/components/fields/row-field";
import { COPY_FIELD_BY_KEY } from "@/lib/graduation/content/fields";

const field = (key: string) => {
  const found = COPY_FIELD_BY_KEY.get(key);
  if (!found) throw new Error(key);
  return found;
};

describe("toRowField", () => {
  it("keeps single-line text fields on one line and offers their call token", () => {
    expect(toRowField(field("met.andYou"))).toMatchObject({ key: "met.andYou", multiline: false });
    expect(toRowField(field("met.andYou")).tokens).toContain("name");
  });
  it("uses a textarea for long text and lists", () => {
    expect(toRowField(field("card.body")).multiline).toBe(true);
    expect(toRowField(field("ends.notes")).multiline).toBe(true);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận fail.**

- [ ] **Step 3: Viết code**

`row-field.ts`:
```ts
import type { CopyField } from "@/lib/graduation/content/fields";
import { allowedTokens } from "@/lib/graduation/content/fields/tokens";

export type RowField = { key: string; label: string; multiline: boolean; tokens: readonly string[] };

export const toRowField = (field: CopyField): RowField => ({
  key: field.key,
  label: field.label,
  multiline: field.kind !== "text",
  tokens: allowedTokens(field),
});
```

`template-chips.tsx`:
```tsx
"use client";

import { TOKEN_LABELS } from "./token-labels";

type TemplateChipsProps = { tokens: readonly string[]; onInsert: (token: string) => void };

export function TemplateChips({ tokens, onInsert }: TemplateChipsProps) {
  if (tokens.length === 0) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {tokens.map((token) => (
        <button
          key={token}
          type="button"
          title={TOKEN_LABELS[token]}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onInsert(token)}
          className="rounded border border-zinc-700 px-1.5 py-0.5 font-mono text-[10px] text-sky-300 hover:bg-zinc-800"
        >
          {`{${token}}`}
        </button>
      ))}
    </div>
  );
}
```
`onMouseDown` chặn mất focus của ô nhập, nhờ đó vị trí con trỏ vẫn còn khi chèn.

`localized-input.tsx`:
```tsx
"use client";

import { useRef, type ChangeEvent } from "react";
import type { Lang } from "@/lib/graduation/i18n";
import { ERROR_BORDER_CLASS, ERROR_CLASS, INPUT_CLASS } from "./field-classes";
import { insertToken } from "./insert-token";
import { TemplateChips } from "./template-chips";

type LocalizedInputProps = {
  lang: Lang;
  value: string;
  placeholder: string;
  multiline: boolean;
  tokens: readonly string[];
  error?: string;
  onChange: (value: string) => void;
};

export function LocalizedInput({ lang, value, placeholder, multiline, tokens, error, onChange }: LocalizedInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  const insert = (token: string) => {
    const element = multiline ? areaRef.current : inputRef.current;
    const next = insertToken(value, element?.selectionStart ?? value.length, element?.selectionEnd ?? value.length, token);
    onChange(next.value);
    requestAnimationFrame(() => {
      element?.focus();
      element?.setSelectionRange(next.caret, next.caret);
    });
  };

  const shared = {
    value,
    placeholder,
    "aria-invalid": Boolean(error),
    className: `${INPUT_CLASS} ${error ? ERROR_BORDER_CLASS : ""}`,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value),
  };

  return (
    <div>
      <span className="mb-1 inline-block rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 uppercase">{lang}</span>
      {multiline ? <textarea ref={areaRef} rows={3} {...shared} /> : <input ref={inputRef} type="text" {...shared} />}
      <TemplateChips tokens={tokens} onInsert={insert} />
      {error && <span className={ERROR_CLASS}>{error}</span>}
    </div>
  );
}
```

`bilingual-row.tsx`:
```tsx
"use client";

import { RotateCcw } from "lucide-react";
import { LANGS } from "@/lib/graduation/i18n/config";
import type { Lang } from "@/lib/graduation/i18n/types";
import { LocalizedInput } from "./localized-input";
import type { RowField } from "./row-field";

type BilingualRowProps = {
  field: RowField;
  values: Record<Lang, string>;
  placeholders: Record<Lang, string>;
  errors?: Partial<Record<Lang, string>>;
  onChange: (lang: Lang, value: string) => void;
  onReset: () => void;
};

export function BilingualRow({ field, values, placeholders, errors, onChange, onReset }: BilingualRowProps) {
  const edited = LANGS.some((lang) => values[lang] !== "");
  return (
    <div className="flex flex-col gap-2 border-b border-zinc-800/70 py-3 last:border-b-0">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
          {edited && <span title="Đã sửa" className="h-1.5 w-1.5 rounded-full bg-sky-400" />}
          {field.label}
        </span>
        {edited && (
          <button type="button" onClick={onReset} className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-200">
            <RotateCcw className="h-3 w-3" /> Về mặc định
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 min-[760px]:grid-cols-2">
        {LANGS.map((lang) => (
          <LocalizedInput
            key={lang}
            lang={lang}
            value={values[lang]}
            placeholder={placeholders[lang]}
            multiline={field.multiline}
            tokens={field.tokens}
            error={errors?.[lang]}
            onChange={(value) => onChange(lang, value)}
          />
        ))}
      </div>
    </div>
  );
}
```

Component client chỉ import `LANGS` từ `@/lib/graduation/i18n/config` và kiểu từ `@/lib/graduation/i18n/types`, không qua `@/lib/graduation/i18n`, để khỏi kéo copy mặc định vào bundle khi không cần.

- [ ] **Step 4: Chạy test** → PASS. `npx tsc --noEmit -p .` → không lỗi.

- [ ] **Step 5: Commit** `feat(admin): bilingual copy row with template chips`

---

### Task 44: Ô nhập một ngôn ngữ và ô ngày giờ

**Files:**
- Create: `app/admin/graduation/components/fields/plain-field.tsx`
- Create: `app/admin/graduation/components/fields/datetime-field.tsx`

**Interfaces:**
- Produces:
  - `PlainField({ label, value, placeholder, hint, error, onChange }: { label: string; value: string; placeholder?: string; hint?: string; error?: string; onChange: (value: string) => void })`
  - `DatetimeField({ label, value, fallback, error, onChange }: { label: string; value?: string; fallback: string; error?: string; onChange: (iso: string | undefined) => void })`. `value` và `fallback` là ISO UTC.

- [ ] **Step 1: Viết code**

`plain-field.tsx`:
```tsx
"use client";

import { ERROR_BORDER_CLASS, ERROR_CLASS, HINT_CLASS, INPUT_CLASS, LABEL_CLASS } from "./field-classes";

type PlainFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  onChange: (value: string) => void;
};

export function PlainField({ label, value, placeholder, hint, error, onChange }: PlainFieldProps) {
  return (
    <label className="block">
      <span className={LABEL_CLASS}>{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
        className={`${INPUT_CLASS} ${error ? ERROR_BORDER_CLASS : ""}`}
      />
      {hint && <span className={HINT_CLASS}>{hint}</span>}
      {error && <span className={ERROR_CLASS}>{error}</span>}
    </label>
  );
}
```

`datetime-field.tsx`:
```tsx
"use client";

import { fromVnLocalInput, toVnLocalInput } from "@/lib/graduation/content/vn-time";
import { ERROR_BORDER_CLASS, ERROR_CLASS, HINT_CLASS, INPUT_CLASS, LABEL_CLASS } from "./field-classes";

type DatetimeFieldProps = {
  label: string;
  value?: string;
  fallback: string;
  error?: string;
  onChange: (iso: string | undefined) => void;
};

export function DatetimeField({ label, value, fallback, error, onChange }: DatetimeFieldProps) {
  return (
    <label className="block">
      <span className={LABEL_CLASS}>{label}</span>
      <input
        type="datetime-local"
        value={value ? toVnLocalInput(value) : ""}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(fromVnLocalInput(event.target.value) ?? undefined)}
        className={`${INPUT_CLASS} ${error ? ERROR_BORDER_CLASS : ""}`}
      />
      <span className={HINT_CLASS}>Giờ Việt Nam (UTC+7). Để trống sẽ dùng {toVnLocalInput(fallback).replace("T", " ")}.</span>
      {error && <span className={ERROR_CLASS}>{error}</span>}
    </label>
  );
}
```

- [ ] **Step 2: Kiểm tra** — `npx tsc --noEmit -p .` → không lỗi. (Logic chuyển giờ đã có test ở Task 2.)

- [ ] **Step 3: Commit** `feat(admin): plain and Vietnam-time datetime fields`

---

### Task 45: `moment-list.ts`

**Files:**
- Create: `app/admin/graduation/components/fields/moment-list.ts`
- Test: `tests/app/admin/graduation/fields/moment-list.test.ts`

**Interfaces:**
- Consumes: `SettingsMoment`, `Moment`, `MomentText`, `Lang`.
- Produces:
  - `addMoment(list: readonly SettingsMoment[]): SettingsMoment[]` (thêm `{ year: "", image: "" }`)
  - `removeMoment(list, index): SettingsMoment[]`
  - `moveMoment(list, index, offset: -1 | 1): SettingsMoment[]` (ra ngoài biên thì trả mảng giống cũ)
  - `updateMoment(list, index, patch: Partial<SettingsMoment>): SettingsMoment[]`
  - `setMomentText(moment, lang, part: keyof MomentText, value: string): SettingsMoment` (`value === ""` thì xóa phần đó)
  - `momentsFromResolved(fallback: Record<Lang, readonly Moment[]>): SettingsMoment[]`

- [ ] **Step 1: Viết test**

```ts
import { describe, expect, it } from "vitest";
import {
  addMoment,
  momentsFromResolved,
  moveMoment,
  removeMoment,
  setMomentText,
  updateMoment,
} from "@/app/admin/graduation/components/fields/moment-list";
import { DEFAULT_MOMENTS } from "@/lib/graduation/i18n";

const a = { year: "1", image: "" };
const b = { year: "2", image: "" };

describe("moment list", () => {
  it("adds an empty moment", () => {
    expect(addMoment([a])).toEqual([a, { year: "", image: "" }]);
  });
  it("removes by index", () => {
    expect(removeMoment([a, b], 0)).toEqual([b]);
  });
  it("moves within bounds only", () => {
    expect(moveMoment([a, b], 0, 1)).toEqual([b, a]);
    expect(moveMoment([a, b], 0, -1)).toEqual([a, b]);
  });
  it("patches one moment", () => {
    expect(updateMoment([a, b], 1, { year: "3" })).toEqual([a, { year: "3", image: "" }]);
  });
  it("sets and clears localized text", () => {
    const withTitle = setMomentText(a, "en", "title", "Hi");
    expect(withTitle.en).toEqual({ title: "Hi" });
    expect(setMomentText(withTitle, "en", "title", "").en).toEqual({});
  });
  it("copies resolved moments into an editable list", () => {
    const list = momentsFromResolved(DEFAULT_MOMENTS);
    expect(list).toHaveLength(DEFAULT_MOMENTS.vi.length);
    expect(list[0]).toEqual({
      year: DEFAULT_MOMENTS.vi[0].year,
      image: DEFAULT_MOMENTS.vi[0].image,
      color: DEFAULT_MOMENTS.vi[0].color,
      vi: { title: DEFAULT_MOMENTS.vi[0].title, body: DEFAULT_MOMENTS.vi[0].body },
      en: { title: DEFAULT_MOMENTS.en[0].title, body: DEFAULT_MOMENTS.en[0].body },
    });
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận fail.**

- [ ] **Step 3: Viết code**

```ts
import type { SettingsMoment } from "@/lib/graduation/content/settings-types";
import type { Lang, Moment, MomentText } from "@/lib/graduation/i18n";

export const addMoment = (list: readonly SettingsMoment[]): SettingsMoment[] => [...list, { year: "", image: "" }];

export const removeMoment = (list: readonly SettingsMoment[], index: number): SettingsMoment[] => list.filter((_, i) => i !== index);

export function moveMoment(list: readonly SettingsMoment[], index: number, offset: -1 | 1): SettingsMoment[] {
  const target = index + offset;
  if (target < 0 || target >= list.length) return [...list];
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export const updateMoment = (list: readonly SettingsMoment[], index: number, patch: Partial<SettingsMoment>): SettingsMoment[] =>
  list.map((moment, i) => (i === index ? { ...moment, ...patch } : moment));

export function setMomentText(moment: SettingsMoment, lang: Lang, part: keyof MomentText, value: string): SettingsMoment {
  const text = { ...moment[lang] };
  if (value === "") delete text[part];
  else text[part] = value;
  return { ...moment, [lang]: text };
}

export const momentsFromResolved = (fallback: Record<Lang, readonly Moment[]>): SettingsMoment[] =>
  fallback.vi.map((moment, i) => ({
    year: moment.year,
    image: moment.image,
    color: moment.color,
    vi: { title: moment.title, body: moment.body },
    en: { title: fallback.en[i]?.title ?? "", body: fallback.en[i]?.body ?? "" },
  }));
```

- [ ] **Step 4: Chạy test** → PASS.

- [ ] **Step 5: Commit** `feat(admin): pure helpers for editing memory card lists`

---

### Task 46: Trình sửa kỷ niệm

**Files:**
- Create: `app/admin/graduation/components/fields/moment-editor-card.tsx`
- Create: `app/admin/graduation/components/fields/moments-editor.tsx`

**Interfaces:**
- Consumes: `BilingualRow` (Task 43), `PlainField` (Task 44), `moment-list.ts` (Task 45), `RISO_COLOR_OPTIONS`, class (Task 42), `ImageUploader` (`app/admin/graduation/components/image-uploader.tsx`).
- Produces:
  - `MomentEditorCard({ index, count, moment, fallback, onChange, onMove, onRemove })`
  - `MomentsEditor({ moments, fallback, onChange }: { moments: readonly SettingsMoment[]; fallback: Record<Lang, readonly Moment[]>; onChange: (next: SettingsMoment[]) => void })`

Hành vi: danh sách rỗng nghĩa là đang dùng kỷ niệm của lớp dưới (chung hoặc mặc định). Lúc đó editor hiện một dòng thông báo và nút "Tùy chỉnh danh sách kỷ niệm" để chép danh sách lớp dưới ra sửa. Xóa hết thẻ thì quay lại dùng lớp dưới.

- [ ] **Step 1: `moment-editor-card.tsx`**

```tsx
"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import type { SettingsMoment } from "@/lib/graduation/content/settings-types";
import type { RisoColor } from "@/lib/graduation/event";
import type { Lang, Moment, MomentText } from "@/lib/graduation/i18n";
import { ImageUploader } from "../image-uploader";
import { BilingualRow } from "./bilingual-row";
import { INPUT_CLASS, LABEL_CLASS, SMALL_BUTTON_CLASS } from "./field-classes";
import { setMomentText } from "./moment-list";
import { PlainField } from "./plain-field";
import { RISO_COLOR_OPTIONS } from "./riso-color-options";

const TEXT_PARTS: readonly { part: keyof MomentText; label: string; multiline: boolean }[] = [
  { part: "title", label: "Tiêu đề", multiline: false },
  { part: "body", label: "Nội dung", multiline: true },
];

type MomentEditorCardProps = {
  index: number;
  count: number;
  moment: SettingsMoment;
  fallback: Record<Lang, Moment | undefined>;
  onChange: (patch: Partial<SettingsMoment>) => void;
  onMove: (offset: -1 | 1) => void;
  onRemove: () => void;
};

export function MomentEditorCard({ index, count, moment, fallback, onChange, onMove, onRemove }: MomentEditorCardProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3.5">
      <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-2">
        <span className="font-mono text-xs font-bold text-sky-400">Thẻ #{index + 1}</span>
        <div className="flex items-center gap-1.5">
          <button type="button" aria-label="Lên" disabled={index === 0} onClick={() => onMove(-1)} className={SMALL_BUTTON_CLASS}>
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button type="button" aria-label="Xuống" disabled={index === count - 1} onClick={() => onMove(1)} className={SMALL_BUTTON_CLASS}>
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={onRemove} className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-red-400">
            <Trash2 className="h-3.5 w-3.5" /> Xóa
          </button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <PlainField label="Năm" value={moment.year} placeholder={fallback.vi?.year} onChange={(year) => onChange({ year })} />
        <label className="block">
          <span className={LABEL_CLASS}>Màu nhấn</span>
          <select
            value={moment.color ?? ""}
            onChange={(event) => onChange({ color: (event.target.value || undefined) as RisoColor | undefined })}
            className={INPUT_CLASS}
          >
            <option value="">Tự động</option>
            {RISO_COLOR_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ImageUploader label="Ảnh thẻ kỷ niệm" value={moment.image} onChange={(image) => onChange({ image })} helperText="Bỏ trống để dùng ảnh mặc định của thẻ này" />

      {TEXT_PARTS.map(({ part, label, multiline }) => (
        <BilingualRow
          key={part}
          field={{ key: `moment-${index}-${part}`, label, multiline, tokens: [] }}
          values={{ vi: moment.vi?.[part] ?? "", en: moment.en?.[part] ?? "" }}
          placeholders={{ vi: fallback.vi?.[part] ?? "", en: fallback.en?.[part] ?? "" }}
          onChange={(lang, value) => onChange(setMomentText(moment, lang, part, value))}
          onReset={() => onChange(setMomentText(setMomentText(moment, "vi", part, ""), "en", part, ""))}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: `moments-editor.tsx`**

```tsx
"use client";

import { Plus } from "lucide-react";
import type { SettingsMoment } from "@/lib/graduation/content/settings-types";
import type { Lang, Moment } from "@/lib/graduation/i18n";
import { PANEL_CLASS, SMALL_BUTTON_CLASS } from "./field-classes";
import { MomentEditorCard } from "./moment-editor-card";
import { addMoment, momentsFromResolved, moveMoment, removeMoment, updateMoment } from "./moment-list";

type MomentsEditorProps = {
  moments: readonly SettingsMoment[];
  fallback: Record<Lang, readonly Moment[]>;
  onChange: (next: SettingsMoment[]) => void;
};

export function MomentsEditor({ moments, fallback, onChange }: MomentsEditorProps) {
  if (moments.length === 0) {
    return (
      <div className={`${PANEL_CLASS} flex flex-wrap items-center justify-between gap-2`}>
        <p className="text-xs text-zinc-400">Đang dùng {fallback.vi.length} kỷ niệm có sẵn.</p>
        <button type="button" onClick={() => onChange(momentsFromResolved(fallback))} className={SMALL_BUTTON_CLASS}>
          Tùy chỉnh danh sách kỷ niệm
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {moments.map((moment, index) => (
        <MomentEditorCard
          key={index}
          index={index}
          count={moments.length}
          moment={moment}
          fallback={{ vi: fallback.vi[index], en: fallback.en[index] }}
          onChange={(patch) => onChange(updateMoment(moments, index, patch))}
          onMove={(offset) => onChange(moveMoment(moments, index, offset))}
          onRemove={() => onChange(removeMoment(moments, index))}
        />
      ))}
      <button type="button" onClick={() => onChange(addMoment(moments))} className={`${SMALL_BUTTON_CLASS} self-start`}>
        <Plus className="h-3.5 w-3.5" /> Thêm thẻ kỷ niệm
      </button>
    </div>
  );
}
```

**Kiểm tra trước:** mở `app/admin/graduation/components/image-uploader.tsx`, xác nhận props đúng là `{ label, value, onChange, helperText? }` và `onChange` nhận chuỗi URL. Nếu khác thì dừng và hỏi.

- [ ] **Step 3: Kiểm tra** — `npx tsc --noEmit -p .` → không lỗi. (Component sẽ được thử trên trình duyệt ở Task 55.)

- [ ] **Step 4: Commit** `feat(admin): bilingual memory card editor`

---


## Giai đoạn E: Trang Cài đặt chung

Mọi file của giai đoạn này nằm trong `app/admin/graduation/settings/`. Test đặt trong `tests/app/admin/graduation/settings/`.

### Task 47: `settings-draft.ts`

**Files:**
- Create: `app/admin/graduation/settings/draft/settings-draft.ts`
- Test: `tests/app/admin/graduation/settings/settings-draft.test.ts`

**Interfaces:**
- Consumes: `setOverride`, `isRecord`, `LANGS`, các kiểu trong `settings-types.ts`.
- Produces:
  ```ts
  type SettingsDraftAction =
    | { type: "copy"; lang: Lang; key: string; value: string }
    | { type: "resetCopy"; key: string }
    | { type: "owner"; key: keyof OwnerSettings; value: string }
    | { type: "event"; key: keyof EventSettings; value: string | undefined }
    | { type: "image"; key: keyof ImageSettings; value: string }
    | { type: "moments"; value: SettingsMoment[] };
  settingsDraftReducer(state: GraduationSettingsContent, action: SettingsDraftAction): GraduationSettingsContent
  settingsLeaves(content: GraduationSettingsContent): Record<string, string>
  countChanges(saved: GraduationSettingsContent, draft: GraduationSettingsContent): number
  ```

- [ ] **Step 1: Viết test**

```ts
import { describe, expect, it } from "vitest";
import { countChanges, settingsDraftReducer } from "@/app/admin/graduation/settings/draft/settings-draft";

describe("settingsDraftReducer", () => {
  it("sets and clears a copy override per language", () => {
    const set = settingsDraftReducer({}, { type: "copy", lang: "en", key: "met.intro", value: "Hi" });
    expect(set.copy?.en).toEqual({ "met.intro": "Hi" });
    expect(settingsDraftReducer(set, { type: "copy", lang: "en", key: "met.intro", value: "" }).copy?.en).toEqual({});
  });
  it("resets a field in both languages", () => {
    const state = { copy: { vi: { "met.intro": "A", "card.body": "B" }, en: { "met.intro": "C" } } };
    expect(settingsDraftReducer(state, { type: "resetCopy", key: "met.intro" }).copy).toEqual({ vi: { "card.body": "B" }, en: {} });
  });
  it("stores blank owner, event and image values as unset", () => {
    const state = settingsDraftReducer({ owner: { name: "A" } }, { type: "owner", key: "name", value: "" });
    expect(state.owner?.name).toBeUndefined();
    expect(settingsDraftReducer({}, { type: "event", key: "start", value: undefined }).event?.start).toBeUndefined();
    expect(settingsDraftReducer({}, { type: "image", key: "badgeLogo", value: "/l.png" }).images).toEqual({ badgeLogo: "/l.png" });
  });
  it("replaces the moments", () => {
    expect(settingsDraftReducer({}, { type: "moments", value: [{ year: "1", image: "" }] }).moments).toEqual([{ year: "1", image: "" }]);
  });
});

describe("countChanges", () => {
  it("is zero for equivalent content", () => {
    expect(countChanges({}, { owner: {}, moments: [], copy: { vi: {} } })).toBe(0);
  });
  it("counts each changed leaf once", () => {
    const saved = { owner: { name: "A" }, copy: { vi: { "met.intro": "X" } } };
    const draft = { owner: { name: "B" }, copy: { vi: { "met.intro": "X" }, en: { "met.intro": "Y" } }, moments: [{ year: "1", image: "" }] };
    expect(countChanges(saved, draft)).toBe(3);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận fail.**

- [ ] **Step 3: Viết code**

```ts
import { isRecord } from "@/lib/graduation/content/is-record";
import { setOverride } from "@/lib/graduation/content/overrides";
import type {
  EventSettings,
  GraduationSettingsContent,
  ImageSettings,
  OwnerSettings,
  SettingsMoment,
} from "@/lib/graduation/content/settings-types";
import { LANGS } from "@/lib/graduation/i18n/config";
import type { Lang } from "@/lib/graduation/i18n/types";

export type SettingsDraftAction =
  | { type: "copy"; lang: Lang; key: string; value: string }
  | { type: "resetCopy"; key: string }
  | { type: "owner"; key: keyof OwnerSettings; value: string }
  | { type: "event"; key: keyof EventSettings; value: string | undefined }
  | { type: "image"; key: keyof ImageSettings; value: string }
  | { type: "moments"; value: SettingsMoment[] };

const setField = <T extends object>(target: T | undefined, key: keyof T, value: string | undefined): T =>
  ({ ...target, [key]: value ? value : undefined }) as T;

export function settingsDraftReducer(state: GraduationSettingsContent, action: SettingsDraftAction): GraduationSettingsContent {
  switch (action.type) {
    case "copy":
      return { ...state, copy: { ...state.copy, [action.lang]: setOverride(state.copy?.[action.lang], action.key, action.value) } };
    case "resetCopy":
      return { ...state, copy: Object.fromEntries(LANGS.map((lang) => [lang, setOverride(state.copy?.[lang], action.key, "")])) };
    case "owner":
      return { ...state, owner: setField(state.owner, action.key, action.value) };
    case "event":
      return { ...state, event: setField(state.event, action.key, action.value) };
    case "image":
      return { ...state, images: setField(state.images, action.key, action.value) };
    case "moments":
      return { ...state, moments: action.value };
  }
}

function collect(value: unknown, path: string, out: Record<string, string>) {
  if (Array.isArray(value)) {
    if (value.length > 0) out[path] = JSON.stringify(value);
  } else if (isRecord(value)) {
    for (const [key, child] of Object.entries(value)) collect(child, path ? `${path}.${key}` : key, out);
  } else if (typeof value === "string" && value !== "") {
    out[path] = value;
  }
}

export function settingsLeaves(content: GraduationSettingsContent): Record<string, string> {
  const out: Record<string, string> = {};
  collect(content, "", out);
  return out;
}

export function countChanges(saved: GraduationSettingsContent, draft: GraduationSettingsContent): number {
  const before = settingsLeaves(saved);
  const after = settingsLeaves(draft);
  return [...new Set([...Object.keys(before), ...Object.keys(after)])].filter((key) => before[key] !== after[key]).length;
}
```

- [ ] **Step 4: Chạy test** → PASS.

- [ ] **Step 5: Commit** `feat(admin): settings draft reducer and change counting`

---

### Task 48: Lọc và nhóm trường

**Files:**
- Create: `app/admin/graduation/settings/fields/filter-fields.ts`
- Create: `app/admin/graduation/settings/fields/group-fields.ts`
- Test: `tests/app/admin/graduation/settings/filter-fields.test.ts`
- Test: `tests/app/admin/graduation/settings/group-fields.test.ts`

**Interfaces:**
- Produces:
  - `filterFields(fields: readonly CopyField[], query: string, extraText: (field: CopyField) => readonly string[]): CopyField[]`. Không phân biệt hoa thường và dấu tiếng Việt; khớp với nhãn, key, hoặc chuỗi trong `extraText`.
  - `type FieldGroup = { title: string | null; fields: CopyField[] }`
  - `groupFields(fields: readonly CopyField[]): FieldGroup[]`. Gom các trường **liền nhau** có cùng `group`.

- [ ] **Step 1: Viết test**

`filter-fields.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { filterFields } from "@/app/admin/graduation/settings/fields/filter-fields";
import { COPY_FIELDS } from "@/lib/graduation/content/fields";

const keys = (query: string, extra: (key: string) => string[] = () => []) =>
  filterFields(COPY_FIELDS, query, (field) => extra(field.key)).map((field) => field.key);

describe("filterFields", () => {
  it("returns every field for a blank query", () => {
    expect(keys("  ")).toHaveLength(COPY_FIELDS.length);
  });
  it("matches labels without diacritics", () => {
    expect(keys("loi chao")).toContain("card.greeting");
  });
  it("matches keys", () => {
    expect(keys("rsvp.letter")).toEqual(["rsvp.letter.to", "rsvp.letter.from", "rsvp.letter.sent"]);
  });
  it("matches extra text such as current values", () => {
    expect(keys("Đà Lạt", (key) => (key === "met.intro" ? ["Chuyến đi Đà Lạt"] : []))).toEqual(["met.intro"]);
  });
});
```

`group-fields.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { groupFields } from "@/app/admin/graduation/settings/fields/group-fields";
import type { CopyField } from "@/lib/graduation/content/fields";

const field = (key: string, group?: string): CopyField => ({ key, section: "misc", label: key, kind: "text", ...(group ? { group } : {}) });

describe("groupFields", () => {
  it("groups consecutive fields that share a group", () => {
    const groups = groupFields([field("a", "G1"), field("b", "G1"), field("c"), field("d", "G1")]);
    expect(groups.map((g) => [g.title, g.fields.map((f) => f.key)])).toEqual([
      ["G1", ["a", "b"]],
      [null, ["c"]],
      ["G1", ["d"]],
    ]);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận fail.**

- [ ] **Step 3: Viết code**

`filter-fields.ts`:
```ts
import type { CopyField } from "@/lib/graduation/content/fields";

const fold = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase();

export function filterFields(fields: readonly CopyField[], query: string, extraText: (field: CopyField) => readonly string[]): CopyField[] {
  const needle = fold(query.trim());
  if (!needle) return [...fields];
  return fields.filter((field) => [field.label, field.key, ...extraText(field)].some((text) => fold(text).includes(needle)));
}
```

`group-fields.ts`:
```ts
import type { CopyField } from "@/lib/graduation/content/fields";

export type FieldGroup = { title: string | null; fields: CopyField[] };

export function groupFields(fields: readonly CopyField[]): FieldGroup[] {
  const groups: FieldGroup[] = [];
  for (const field of fields) {
    const title = field.group ?? null;
    const last = groups.at(-1);
    if (last && last.title === title) last.fields.push(field);
    else groups.push({ title, fields: [field] });
  }
  return groups;
}
```

- [ ] **Step 4: Chạy test** → PASS.

- [ ] **Step 5: Commit** `feat(admin): search and group settings fields`

---

### Task 49: Danh sách tab, thanh điều hướng và ô tìm kiếm

**Files:**
- Create: `app/admin/graduation/settings/sections.ts`
- Create: `app/admin/graduation/settings/components/section-nav.tsx`
- Create: `app/admin/graduation/settings/components/field-search.tsx`

**Interfaces:**
- Produces:
  - `type SettingsTab = "owner" | "event" | CopySection`
  - `SETTINGS_TABS: readonly { key: SettingsTab; label: string }[]`
  - `SectionNav({ active, onSelect }: { active: SettingsTab; onSelect: (tab: SettingsTab) => void })`
  - `FieldSearch({ value, onChange }: { value: string; onChange: (value: string) => void })`

- [ ] **Step 1: `sections.ts`**

```ts
import type { CopySection } from "@/lib/graduation/content/fields";

export type SettingsTab = "owner" | "event" | CopySection;

export const SETTINGS_TABS: readonly { key: SettingsTab; label: string }[] = [
  { key: "owner", label: "Chủ thiệp" },
  { key: "event", label: "Sự kiện" },
  { key: "gate", label: "Mở thiệp" },
  { key: "header", label: "Header & Rails" },
  { key: "envelope", label: "Phong bì & Thiệp" },
  { key: "met", label: "Met & Kỷ niệm" },
  { key: "ends", label: "Ends & Bản đồ" },
  { key: "rsvp", label: "RSVP" },
  { key: "wishes", label: "Wishes" },
  { key: "finale", label: "Finale" },
  { key: "narrator", label: "Nhân vật" },
  { key: "misc", label: "Footer, Meta & 404" },
  { key: "png", label: "Ảnh thiệp PNG" },
];
```

- [ ] **Step 2: `section-nav.tsx`**

```tsx
"use client";

import { SETTINGS_TABS, type SettingsTab } from "../sections";

type SectionNavProps = { active: SettingsTab; onSelect: (tab: SettingsTab) => void };

export function SectionNav({ active, onSelect }: SectionNavProps) {
  return (
    <nav aria-label="Nhóm nội dung" className="flex gap-1 overflow-x-auto pb-1 min-[760px]:flex-col min-[760px]:overflow-visible">
      {SETTINGS_TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          aria-current={tab.key === active ? "page" : undefined}
          onClick={() => onSelect(tab.key)}
          className={`rounded-md px-3 py-2 text-left text-xs font-medium whitespace-nowrap transition-colors ${
            tab.key === active ? "bg-sky-500/15 text-sky-300" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
```

- [ ] **Step 3: `field-search.tsx`**

```tsx
"use client";

import { Search } from "lucide-react";
import { INPUT_CLASS } from "../../components/fields/field-classes";

type FieldSearchProps = { value: string; onChange: (value: string) => void };

export function FieldSearch({ value, onChange }: FieldSearchProps) {
  return (
    <label className="relative block">
      <span className="sr-only">Tìm trường</span>
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
      <input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Tìm trường…" className={`${INPUT_CLASS} pl-9`} />
    </label>
  );
}
```

- [ ] **Step 4: Kiểm tra** — `npx tsc --noEmit -p .` → không lỗi.

- [ ] **Step 5: Commit** `feat(admin): settings navigation and field search`

---

### Task 50: Khung sửa copy theo nhóm

**Files:**
- Create: `app/admin/graduation/settings/components/copy-section-panel.tsx`

**Interfaces:**
- Consumes: `groupFields` (Task 48), `BilingualRow`, `toRowField` (Task 43), `SettingsDraftAction` (Task 47), `PANEL_CLASS`, `GROUP_TITLE_CLASS`.
- Produces: `CopySectionPanel({ fields, copy, defaults, errors, dispatch })`:
  - `fields: readonly CopyField[]`
  - `copy: GraduationSettingsContent["copy"]`
  - `defaults: Record<Lang, Record<string, string>>`
  - `errors: Record<string, string>` (key dạng `copy.<lang>.<fieldKey>`)
  - `dispatch: Dispatch<SettingsDraftAction>`

- [ ] **Step 1: Viết code**

```tsx
"use client";

import type { Dispatch } from "react";
import type { CopyField } from "@/lib/graduation/content/fields";
import type { GraduationSettingsContent } from "@/lib/graduation/content/settings-types";
import type { Lang } from "@/lib/graduation/i18n/types";
import { BilingualRow } from "../../components/fields/bilingual-row";
import { GROUP_TITLE_CLASS, PANEL_CLASS } from "../../components/fields/field-classes";
import { toRowField } from "../../components/fields/row-field";
import type { SettingsDraftAction } from "../draft/settings-draft";
import { groupFields } from "../fields/group-fields";

type CopySectionPanelProps = {
  fields: readonly CopyField[];
  copy: GraduationSettingsContent["copy"];
  defaults: Record<Lang, Record<string, string>>;
  errors: Record<string, string>;
  dispatch: Dispatch<SettingsDraftAction>;
};

export function CopySectionPanel({ fields, copy, defaults, errors, dispatch }: CopySectionPanelProps) {
  if (fields.length === 0) return <p className="text-xs text-zinc-500">Không có trường nào khớp.</p>;

  return (
    <div className="flex flex-col gap-4">
      {groupFields(fields).map((group, index) => (
        <section key={`${group.title}-${index}`} className={PANEL_CLASS}>
          {group.title && <h4 className={GROUP_TITLE_CLASS}>{group.title}</h4>}
          {group.fields.map((field) => (
            <BilingualRow
              key={field.key}
              field={toRowField(field)}
              values={{ vi: copy?.vi?.[field.key] ?? "", en: copy?.en?.[field.key] ?? "" }}
              placeholders={{ vi: defaults.vi[field.key] ?? "", en: defaults.en[field.key] ?? "" }}
              errors={{ vi: errors[`copy.vi.${field.key}`], en: errors[`copy.en.${field.key}`] }}
              onChange={(lang, value) => dispatch({ type: "copy", lang, key: field.key, value })}
              onReset={() => dispatch({ type: "resetCopy", key: field.key })}
            />
          ))}
        </section>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Kiểm tra** — `npx tsc --noEmit -p .`.

- [ ] **Step 3: Commit** `feat(admin): grouped bilingual copy panel`

---

### Task 51: Khung Chủ thiệp và Sự kiện

**Files:**
- Create: `app/admin/graduation/settings/components/owner-panel.tsx`
- Create: `app/admin/graduation/settings/components/event-panel.tsx`

**Interfaces:**
- Produces:
  - `OwnerPanel({ owner, envPhone, errors, dispatch }: { owner?: OwnerSettings; envPhone: string | null; errors: Record<string, string>; dispatch: Dispatch<SettingsDraftAction> })`
  - `EventPanel({ event, errors, dispatch }: { event?: EventSettings; errors: Record<string, string>; dispatch: Dispatch<SettingsDraftAction> })`

- [ ] **Step 1: `owner-panel.tsx`**

```tsx
"use client";

import type { Dispatch } from "react";
import { DEFAULT_OWNER } from "@/lib/graduation/content/defaults";
import type { OwnerSettings } from "@/lib/graduation/content/settings-types";
import { PANEL_CLASS } from "../../components/fields/field-classes";
import { PlainField } from "../../components/fields/plain-field";
import type { SettingsDraftAction } from "../draft/settings-draft";

type OwnerPanelProps = { owner?: OwnerSettings; envPhone: string | null; errors: Record<string, string>; dispatch: Dispatch<SettingsDraftAction> };

export function OwnerPanel({ owner, envPhone, errors, dispatch }: OwnerPanelProps) {
  const fields: { key: keyof OwnerSettings; label: string; placeholder: string; hint: string }[] = [
    { key: "name", label: "Tên chủ thiệp", placeholder: DEFAULT_OWNER.name, hint: "Thay cho {owner} trong mọi nội dung" },
    { key: "initials", label: "Chữ viết tắt", placeholder: DEFAULT_OWNER.initials, hint: "Tối đa 4 ký tự, hiện trên tem và dấu sáp" },
    { key: "website", label: "Website", placeholder: DEFAULT_OWNER.website, hint: "Hiện ở chân ảnh thiệp PNG" },
    {
      key: "phone",
      label: "Số điện thoại",
      placeholder: envPhone ?? "",
      hint: envPhone ? "Để trống sẽ dùng số trong biến môi trường GRADUATION_OWNER_PHONE" : "Để trống để ẩn số điện thoại",
    },
  ];

  return (
    <div className={`${PANEL_CLASS} grid grid-cols-1 gap-3 min-[760px]:grid-cols-2`}>
      {fields.map((field) => (
        <PlainField
          key={field.key}
          label={field.label}
          value={owner?.[field.key] ?? ""}
          placeholder={field.placeholder}
          hint={field.hint}
          error={errors[`owner.${field.key}`]}
          onChange={(value) => dispatch({ type: "owner", key: field.key, value })}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: `event-panel.tsx`**

```tsx
"use client";

import type { Dispatch } from "react";
import type { EventSettings } from "@/lib/graduation/content/settings-types";
import { GRADUATION_EVENT } from "@/lib/graduation/event";
import { DatetimeField } from "../../components/fields/datetime-field";
import { GROUP_TITLE_CLASS, PANEL_CLASS } from "../../components/fields/field-classes";
import { PlainField } from "../../components/fields/plain-field";
import type { SettingsDraftAction } from "../draft/settings-draft";

type LinkKey = "mapEmbedUrl" | "mapLinkUrl" | "virtualTourUrl" | "virtualTourOwnerUrl" | "musicYoutubeId";

const LINKS: { key: LinkKey; label: string; hint: string }[] = [
  { key: "mapEmbedUrl", label: "Link nhúng bản đồ", hint: "Google Maps → Chia sẻ → Nhúng bản đồ → chỉ dán phần trong src=\"…\"" },
  { key: "mapLinkUrl", label: "Link chỉ đường", hint: "Mở khi quét mã QR chỉ đường trên ảnh thiệp PNG" },
  { key: "virtualTourUrl", label: "Link tour 360°", hint: "Phải bắt đầu bằng https://" },
  { key: "virtualTourOwnerUrl", label: "Link đơn vị sở hữu tour", hint: "Dùng cho dòng ghi nguồn dưới tour" },
  { key: "musicYoutubeId", label: "ID nhạc nền YouTube", hint: "11 ký tự sau ?v= trên link YouTube" },
];

type EventPanelProps = { event?: EventSettings; errors: Record<string, string>; dispatch: Dispatch<SettingsDraftAction> };

export function EventPanel({ event, errors, dispatch }: EventPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <section className={`${PANEL_CLASS} grid grid-cols-1 gap-3 min-[760px]:grid-cols-2`}>
        <h4 className={`${GROUP_TITLE_CLASS} min-[760px]:col-span-2`}>Thời gian</h4>
        <DatetimeField
          label="Bắt đầu"
          value={event?.start}
          fallback={GRADUATION_EVENT.startUtc}
          error={errors["event.start"]}
          onChange={(value) => dispatch({ type: "event", key: "start", value })}
        />
        <DatetimeField
          label="Kết thúc"
          value={event?.end}
          fallback={GRADUATION_EVENT.endUtc}
          error={errors["event.end"]}
          onChange={(value) => dispatch({ type: "event", key: "end", value })}
        />
      </section>
      <section className={`${PANEL_CLASS} flex flex-col gap-3`}>
        <h4 className={GROUP_TITLE_CLASS}>Bản đồ, tour & nhạc</h4>
        {LINKS.map((link) => (
          <PlainField
            key={link.key}
            label={link.label}
            value={event?.[link.key] ?? ""}
            placeholder={GRADUATION_EVENT[link.key]}
            hint={link.hint}
            error={errors[`event.${link.key}`]}
            onChange={(value) => dispatch({ type: "event", key: link.key, value })}
          />
        ))}
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Kiểm tra** — `npx tsc --noEmit -p .`.

- [ ] **Step 4: Commit** `feat(admin): owner and event settings panels`

---

### Task 52: Phần thêm của tab Phong bì, tab Met và bộ chọn khung theo tab

**Files:**
- Create: `app/admin/graduation/settings/components/envelope-extras.tsx`
- Create: `app/admin/graduation/settings/components/met-extras.tsx`
- Create: `app/admin/graduation/settings/components/settings-tab-panel.tsx`

**Interfaces:**
- Produces:
  - `EnvelopeExtras({ images, dispatch })`
  - `MetExtras({ images, moments, defaultMoments, dispatch })`
  - `SettingsTabPanel({ tab, draft, defaults, defaultMoments, envPhone, errors, dispatch }: { tab: SettingsTab; draft: GraduationSettingsContent; defaults: Record<Lang, Record<string, string>>; defaultMoments: Record<Lang, Moment[]>; envPhone: string | null; errors: Record<string, string>; dispatch: Dispatch<SettingsDraftAction> })`

- [ ] **Step 1: `envelope-extras.tsx`**

```tsx
"use client";

import type { Dispatch } from "react";
import type { ImageSettings } from "@/lib/graduation/content/settings-types";
import { GROUP_TITLE_CLASS, PANEL_CLASS } from "../../components/fields/field-classes";
import { ImageUploader } from "../../components/image-uploader";
import type { SettingsDraftAction } from "../draft/settings-draft";

type EnvelopeExtrasProps = { images?: ImageSettings; dispatch: Dispatch<SettingsDraftAction> };

export function EnvelopeExtras({ images, dispatch }: EnvelopeExtrasProps) {
  return (
    <section className={PANEL_CLASS}>
      <h4 className={GROUP_TITLE_CLASS}>Ảnh</h4>
      <ImageUploader
        label="Ảnh nhỏ trên thiệp"
        value={images?.coverImage ?? ""}
        onChange={(value) => dispatch({ type: "image", key: "coverImage", value })}
        helperText="Dùng cho mọi khách, trừ khách có ảnh riêng. Để trống để ẩn."
      />
    </section>
  );
}
```

- [ ] **Step 2: `met-extras.tsx`**

```tsx
"use client";

import type { Dispatch } from "react";
import type { ImageSettings, SettingsMoment } from "@/lib/graduation/content/settings-types";
import type { Lang, Moment } from "@/lib/graduation/i18n/types";
import { GROUP_TITLE_CLASS, PANEL_CLASS } from "../../components/fields/field-classes";
import { MomentsEditor } from "../../components/fields/moments-editor";
import { ImageUploader } from "../../components/image-uploader";
import type { SettingsDraftAction } from "../draft/settings-draft";

type MetExtrasProps = {
  images?: ImageSettings;
  moments?: SettingsMoment[];
  defaultMoments: Record<Lang, Moment[]>;
  dispatch: Dispatch<SettingsDraftAction>;
};

export function MetExtras({ images, moments, defaultMoments, dispatch }: MetExtrasProps) {
  return (
    <>
      <section className={`${PANEL_CLASS} flex flex-col gap-3`}>
        <h4 className={GROUP_TITLE_CLASS}>Ảnh</h4>
        <ImageUploader
          label="Ảnh chụp chung"
          value={images?.togetherPhoto ?? ""}
          onChange={(value) => dispatch({ type: "image", key: "togetherPhoto", value })}
          helperText="Dùng khi khách không có ảnh riêng. Để trống để không hiện ảnh thứ 5."
        />
        <ImageUploader
          label="Logo huy hiệu trên đường kỷ niệm"
          value={images?.badgeLogo ?? ""}
          onChange={(value) => dispatch({ type: "image", key: "badgeLogo", value })}
          helperText="Để trống để dùng logo Bách Khoa có sẵn."
        />
      </section>
      <section className={PANEL_CLASS}>
        <h4 className={GROUP_TITLE_CLASS}>Kỷ niệm</h4>
        <MomentsEditor moments={moments ?? []} fallback={defaultMoments} onChange={(value) => dispatch({ type: "moments", value })} />
      </section>
    </>
  );
}
```

- [ ] **Step 3: `settings-tab-panel.tsx`**

```tsx
"use client";

import type { Dispatch } from "react";
import { COPY_FIELDS } from "@/lib/graduation/content/fields";
import type { GraduationSettingsContent } from "@/lib/graduation/content/settings-types";
import type { Lang, Moment } from "@/lib/graduation/i18n/types";
import type { SettingsDraftAction } from "../draft/settings-draft";
import type { SettingsTab } from "../sections";
import { CopySectionPanel } from "./copy-section-panel";
import { EnvelopeExtras } from "./envelope-extras";
import { EventPanel } from "./event-panel";
import { MetExtras } from "./met-extras";
import { OwnerPanel } from "./owner-panel";

type SettingsTabPanelProps = {
  tab: SettingsTab;
  draft: GraduationSettingsContent;
  defaults: Record<Lang, Record<string, string>>;
  defaultMoments: Record<Lang, Moment[]>;
  envPhone: string | null;
  errors: Record<string, string>;
  dispatch: Dispatch<SettingsDraftAction>;
};

export function SettingsTabPanel({ tab, draft, defaults, defaultMoments, envPhone, errors, dispatch }: SettingsTabPanelProps) {
  if (tab === "owner") return <OwnerPanel owner={draft.owner} envPhone={envPhone} errors={errors} dispatch={dispatch} />;
  if (tab === "event") return <EventPanel event={draft.event} errors={errors} dispatch={dispatch} />;

  return (
    <div className="flex flex-col gap-4">
      {tab === "envelope" && <EnvelopeExtras images={draft.images} dispatch={dispatch} />}
      {tab === "met" && <MetExtras images={draft.images} moments={draft.moments} defaultMoments={defaultMoments} dispatch={dispatch} />}
      <CopySectionPanel fields={COPY_FIELDS.filter((field) => field.section === tab)} copy={draft.copy} defaults={defaults} errors={errors} dispatch={dispatch} />
    </div>
  );
}
```

- [ ] **Step 4: Kiểm tra** — `npx tsc --noEmit -p .`.

- [ ] **Step 5: Commit** `feat(admin): settings tab panels with images and memory cards`

---

### Task 53: Thanh lưu và chặn rời trang

**Files:**
- Create: `app/admin/graduation/settings/components/save-bar.tsx`
- Create: `app/admin/graduation/settings/components/use-unsaved-guard.ts`

**Interfaces:**
- Produces:
  - `type SaveStatus = { kind: "saved" } | { kind: "error"; message: string } | null`
  - `SaveBar({ changes, pending, status, errors, previewHref, onSave }: { changes: number; pending: boolean; status: SaveStatus; errors: Record<string, string>; previewHref?: string; onSave: () => void })`
  - `useUnsavedGuard(dirty: boolean): void`

`SaveBar` liệt kê tối đa 5 lỗi dạng `đường-dẫn: thông báo`, để admin thấy cả những lỗi không gắn với ô nào (ví dụ lỗi trong danh sách kỷ niệm).

- [ ] **Step 1: `use-unsaved-guard.ts`**

```ts
"use client";

import { useEffect } from "react";

export function useUnsavedGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
}
```

- [ ] **Step 2: `save-bar.tsx`**

```tsx
"use client";

import { ExternalLink, Loader2, Save } from "lucide-react";

export type SaveStatus = { kind: "saved" } | { kind: "error"; message: string } | null;

type SaveBarProps = {
  changes: number;
  pending: boolean;
  status: SaveStatus;
  errors: Record<string, string>;
  previewHref?: string;
  onSave: () => void;
};

const MAX_LISTED_ERRORS = 5;

export function SaveBar({ changes, pending, status, errors, previewHref, onSave }: SaveBarProps) {
  const errorList = Object.entries(errors).slice(0, MAX_LISTED_ERRORS);
  return (
    <div className="sticky bottom-0 z-20 mt-6 flex flex-col gap-2 border-t border-zinc-800 bg-zinc-950/95 py-3 backdrop-blur">
      {status?.kind === "error" && (
        <div className="rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
          <p className="font-semibold">{status.message}</p>
          {errorList.length > 0 && (
            <ul className="mt-1 list-disc pl-4">
              {errorList.map(([path, message]) => (
                <li key={path}>
                  <code>{path}</code>: {message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-zinc-400">
          {changes > 0 ? `${changes} thay đổi chưa lưu` : status?.kind === "saved" ? "Đã lưu" : "Không có thay đổi"}
        </span>
        <div className="flex items-center gap-2">
          {previewHref && (
            <a
              href={previewHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
            >
              <ExternalLink className="h-4 w-4" /> Xem trước
            </a>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={pending || changes === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-5 py-2 text-xs font-semibold text-white hover:bg-sky-400 disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {pending ? "Đang lưu..." : "Lưu cài đặt"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Kiểm tra** — `npx tsc --noEmit -p .`.

- [ ] **Step 4: Commit** `feat(admin): settings save bar and unsaved-changes guard`

---

### Task 54: Server action lưu cài đặt

**Files:**
- Create: `app/admin/graduation/settings/actions.ts`

**Interfaces:**
- Consumes: `isAdminSession`, `SESSION_EXPIRED_ERROR` (Task 41), `saveSettings` (Task 25), `settingsRepository` (Task 23).
- Produces:
  - `type SettingsActionState = { ok: true } | { ok: false; fieldErrors: Record<string, string>; error: string }`
  - `saveGraduationSettingsAction(formData: FormData): Promise<SettingsActionState>`. Đọc JSON từ field `content`.

`"use server"` chỉ cho export hàm async. Kiểu `SettingsActionState` được export dạng `export type`, bị xóa khi build nên vẫn hợp lệ (giống `GuestActionState` trong `app/admin/graduation/actions.ts`).

- [ ] **Step 1: Viết code**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { isAdminSession } from "@/lib/admin-auth/session";
import { saveSettings } from "@/lib/graduation/content/settings-service";
import { settingsRepository } from "@/lib/graduation/settings-repository";
import { SESSION_EXPIRED_ERROR } from "../session-expired";

export type SettingsActionState = { ok: true } | { ok: false; fieldErrors: Record<string, string>; error: string };

export async function saveGraduationSettingsAction(formData: FormData): Promise<SettingsActionState> {
  if (!(await isAdminSession())) return { ok: false, fieldErrors: {}, error: SESSION_EXPIRED_ERROR };

  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("content") ?? "{}"));
  } catch {
    return { ok: false, fieldErrors: {}, error: "Dữ liệu cài đặt không hợp lệ" };
  }

  const result = await saveSettings(settingsRepository, raw);
  if (!result.ok) return { ok: false, fieldErrors: result.fieldErrors, error: "Một số trường chưa hợp lệ" };

  revalidatePath("/graduation", "layout");
  revalidatePath("/admin/graduation");
  revalidatePath("/admin/graduation/settings");
  return { ok: true };
}
```

- [ ] **Step 2: Kiểm tra** — `npx tsc --noEmit -p .`. (Logic đã có test ở Task 25; action chỉ nối dây.)

- [ ] **Step 3: Commit** `feat(admin): save graduation settings action`

---

### Task 55: Trình sửa cài đặt, trang và mục điều hướng

**Files:**
- Create: `app/admin/graduation/settings/components/settings-editor.tsx`
- Create: `app/admin/graduation/settings/page.tsx`
- Modify: `app/admin/components/admin-nav.tsx`

**Interfaces:**
- Produces: `SettingsEditor({ initial, defaults, defaultMoments, envPhone, previewHref }: { initial: GraduationSettingsContent; defaults: Record<Lang, Record<string, string>>; defaultMoments: Record<Lang, Moment[]>; envPhone: string | null; previewHref?: string })`

- [ ] **Step 1: `settings-editor.tsx`**

```tsx
"use client";

import { useReducer, useState, useTransition } from "react";
import { COPY_FIELDS } from "@/lib/graduation/content/fields";
import type { GraduationSettingsContent } from "@/lib/graduation/content/settings-types";
import type { Lang, Moment } from "@/lib/graduation/i18n/types";
import { saveGraduationSettingsAction } from "../actions";
import { countChanges, settingsDraftReducer } from "../draft/settings-draft";
import { filterFields } from "../fields/filter-fields";
import type { SettingsTab } from "../sections";
import { CopySectionPanel } from "./copy-section-panel";
import { FieldSearch } from "./field-search";
import { SaveBar, type SaveStatus } from "./save-bar";
import { SectionNav } from "./section-nav";
import { SettingsTabPanel } from "./settings-tab-panel";
import { useUnsavedGuard } from "./use-unsaved-guard";

type SettingsEditorProps = {
  initial: GraduationSettingsContent;
  defaults: Record<Lang, Record<string, string>>;
  defaultMoments: Record<Lang, Moment[]>;
  envPhone: string | null;
  previewHref?: string;
};

export function SettingsEditor({ initial, defaults, defaultMoments, envPhone, previewHref }: SettingsEditorProps) {
  const [saved, setSaved] = useState(initial);
  const [draft, dispatch] = useReducer(settingsDraftReducer, initial);
  const [tab, setTab] = useState<SettingsTab>("owner");
  const [query, setQuery] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<SaveStatus>(null);
  const [pending, startTransition] = useTransition();

  const changes = countChanges(saved, draft);
  useUnsavedGuard(changes > 0);

  const save = () => {
    const formData = new FormData();
    formData.append("content", JSON.stringify(draft));
    startTransition(async () => {
      const result = await saveGraduationSettingsAction(formData);
      if (result.ok) {
        setSaved(draft);
        setErrors({});
        setStatus({ kind: "saved" });
      } else {
        setErrors(result.fieldErrors);
        setStatus({ kind: "error", message: result.error });
      }
    });
  };

  const searchResults = query.trim()
    ? filterFields(COPY_FIELDS, query, (field) => [defaults.vi[field.key] ?? "", defaults.en[field.key] ?? "", draft.copy?.vi?.[field.key] ?? "", draft.copy?.en?.[field.key] ?? ""])
    : null;

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 min-[760px]:grid-cols-[200px_1fr]">
        <aside className="flex flex-col gap-3 min-[760px]:sticky min-[760px]:top-6 min-[760px]:self-start">
          <FieldSearch value={query} onChange={setQuery} />
          <SectionNav
            active={tab}
            onSelect={(next) => {
              setQuery("");
              setTab(next);
            }}
          />
        </aside>
        <div className="min-w-0">
          {searchResults ? (
            <CopySectionPanel fields={searchResults} copy={draft.copy} defaults={defaults} errors={errors} dispatch={dispatch} />
          ) : (
            <SettingsTabPanel tab={tab} draft={draft} defaults={defaults} defaultMoments={defaultMoments} envPhone={envPhone} errors={errors} dispatch={dispatch} />
          )}
        </div>
      </div>
      <SaveBar changes={changes} pending={pending} status={status} errors={errors} previewHref={previewHref} onSave={save} />
    </div>
  );
}
```

- [ ] **Step 2: `app/admin/graduation/settings/page.tsx`**

```tsx
import { isAdminSession } from "@/lib/admin-auth/session";
import { flattenTexts } from "@/lib/graduation/content/flatten-texts";
import { loadGraduationSettings } from "@/lib/graduation/content/load-settings";
import { guestRepository } from "@/lib/graduation/guest-repository";
import { DEFAULT_MOMENTS, DEFAULT_TEXTS } from "@/lib/graduation/i18n";
import { readOwnerPhone } from "@/lib/graduation/owner-phone";
import LoginForm from "../../LoginForm";
import { AdminShell } from "../../components/admin-shell";
import { SettingsEditor } from "./components/settings-editor";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cài đặt thiệp | Admin",
  robots: { index: false, follow: false },
};

export default async function AdminGraduationSettingsPage() {
  if (!(await isAdminSession())) return <LoginForm />;

  const [settings, guests] = await Promise.all([loadGraduationSettings(), guestRepository.list()]);

  return (
    <AdminShell
      title="Cài đặt thiệp"
      description="Nội dung chung cho mọi thiệp, nhập cả tiếng Việt và tiếng Anh. Ô để trống dùng giá trị mặc định (chữ mờ trong ô)."
    >
      <SettingsEditor
        initial={settings}
        defaults={{ vi: flattenTexts(DEFAULT_TEXTS.vi), en: flattenTexts(DEFAULT_TEXTS.en) }}
        defaultMoments={DEFAULT_MOMENTS}
        envPhone={readOwnerPhone()}
        previewHref={guests[0] ? `/graduation/${guests[0].id}` : undefined}
      />
    </AdminShell>
  );
}
```

**Kiểm tra trước:** đường dẫn `LoginForm`. `app/admin/graduation/page.tsx` import `"../LoginForm"`, nên từ `app/admin/graduation/settings/page.tsx` là `"../../LoginForm"`. Chạy `ls app/admin/LoginForm*` để xác nhận.

- [ ] **Step 3: Mục điều hướng** — trong `app/admin/components/admin-nav.tsx`, đổi mảng `navItems` thành:
```ts
  const navItems = [
    { href: "/admin", label: "Lượt truy cập (Visitors)", exact: true },
    { href: "/admin/graduation", label: "Quản lý Lễ tốt nghiệp (Graduation)", exact: true },
    { href: "/admin/graduation/settings", label: "Cài đặt thiệp (Settings)", exact: true },
  ];
```

- [ ] **Step 4: Kiểm tra**

- `npx tsc --noEmit -p .` → không lỗi; `npx eslint app/admin lib/graduation` → không lỗi mới.
- Trình duyệt (đã đăng nhập admin), `http://localhost:3000/admin/graduation/settings`:
  1. Có 13 tab. Mỗi tab copy có hai cột VI | EN, placeholder là chữ mặc định.
  2. Tab "Met & Kỷ niệm": sửa `Đoạn giới thiệu` VI thành "Thử VI", EN thành "Try EN". Thanh dưới báo "2 thay đổi chưa lưu". Bấm "Lưu cài đặt" → "Đã lưu".
  3. Mở thiệp một khách: phần Met hiện "Thử VI"; chuyển EN hiện "Try EN".
  4. Tab "Sự kiện": đặt Bắt đầu `2026-12-20 14:00`, Kết thúc `2026-12-20 16:00`, rồi lưu. Thiệp hiện "Chủ Nhật 20.12.2026", vé hiện "20.12" và "14:00 — 16:00", đếm ngược theo ngày mới, link Google Calendar có `20261220T070000Z`.
  5. Ô "Ký hiệu chủ thiệp" (tab Footer, Meta & 404) gõ `{nam}` rồi lưu → ô báo lỗi "Chỗ trống không hỗ trợ: {nam}", không lưu.
  6. Gõ "loi chuc" vào ô tìm kiếm → hiện các trường về lời chúc ở nhiều tab.
  7. Sửa một ô rồi tải lại trang → trình duyệt hỏi xác nhận rời trang.
  8. Tab "Met & Kỷ niệm" → "Tùy chỉnh danh sách kỷ niệm" → đổi thứ tự 2 thẻ đầu, lưu → thiệp hiện thứ tự mới.
  9. **Dọn dẹp:** bấm ↺ ở các ô đã sửa, xóa ngày giờ, xóa hết thẻ kỷ niệm, rồi lưu, để thiệp về như ban đầu.

- [ ] **Step 5: Commit** `feat(admin): graduation settings page`

---


## Giai đoạn F: Form custom từng khách theo VI/EN

### Task 56: Placeholder và tóm tắt cho khách

**Files:**
- Create: `lib/graduation/content/guest-placeholders.ts`
- Create: `lib/graduation/content/guest-content-summary.ts`
- Test: `tests/lib/graduation/content/guest-placeholders.test.ts`
- Test: `tests/lib/graduation/content/guest-content-summary.test.ts`

**Interfaces:**
- Consumes: `flattenTexts`, `layerTexts`, `resolveMoments`, `resolveEventTimes`, `DEFAULT_MOMENTS`, `GUEST_COPY_TABS`, `LANGS`.
- Produces:
  - `type GuestPlaceholders = { texts: Record<Lang, Record<string, string>>; moments: Record<Lang, Moment[]>; times: EventTimes }`
  - `guestPlaceholders(settings: GraduationSettingsContent): GuestPlaceholders`. Giá trị khách sẽ thấy nếu để trống (Cài đặt chung đè lên mặc định).
  - `type GuestContentSummary = { envelope: boolean; met: boolean; moments: number; ends: boolean; music: boolean }`
  - `summarizeGuestContent(content: GuestContent | null): GuestContentSummary`

- [ ] **Step 1: Viết test**

`guest-placeholders.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { guestPlaceholders } from "@/lib/graduation/content/guest-placeholders";
import { GRADUATION_EVENT } from "@/lib/graduation/event";
import { DEFAULT_MOMENTS, DEFAULT_TEXTS } from "@/lib/graduation/i18n";

describe("guestPlaceholders", () => {
  it("shows the shared value per language, raw templates included", () => {
    const placeholders = guestPlaceholders({ copy: { vi: { "met.intro": "Chung" } } });
    expect(placeholders.texts.vi["met.intro"]).toBe("Chung");
    expect(placeholders.texts.en["met.intro"]).toBe(DEFAULT_TEXTS.en.met.intro);
    expect(placeholders.texts.vi["rsvp.prompt"]).toContain("{name}");
  });
  it("uses the shared memory cards and event time", () => {
    const placeholders = guestPlaceholders({ moments: [{ year: "2030", image: "", vi: { title: "Chung" } }] });
    expect(placeholders.moments.vi[0].title).toBe("Chung");
    expect(placeholders.moments.en[0].title).toBe(DEFAULT_MOMENTS.en[0].title);
    expect(placeholders.times).toEqual({ startUtc: GRADUATION_EVENT.startUtc, endUtc: GRADUATION_EVENT.endUtc });
  });
});
```

`guest-content-summary.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { summarizeGuestContent } from "@/lib/graduation/content/guest-content-summary";

describe("summarizeGuestContent", () => {
  it("is empty for no content", () => {
    expect(summarizeGuestContent(null)).toEqual({ envelope: false, met: false, moments: 0, ends: false, music: false });
  });
  it("flags each tab from either language or its extras", () => {
    expect(
      summarizeGuestContent({
        en: { "card.greeting": "Hi" },
        moments: [{ year: "1", image: "" }],
        event: { start: "2026-12-20T07:00:00.000Z" },
        music: { youtubeId: "abcdefghijk" },
      }),
    ).toEqual({ envelope: true, met: true, moments: 1, ends: true, music: true });
  });
  it("counts the cover image as an envelope customisation", () => {
    expect(summarizeGuestContent({ images: { coverImage: "/c.jpg" } }).envelope).toBe(true);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận fail.**

- [ ] **Step 3: Viết code**

`guest-placeholders.ts`:
```ts
import { DEFAULT_MOMENTS } from "../i18n";
import type { Lang, Moment } from "../i18n/types";
import type { EventTimes } from "./event-vars";
import { flattenTexts } from "./flatten-texts";
import { layerTexts } from "./layer-texts";
import { resolveEventTimes } from "./resolve-event";
import { resolveMoments } from "./resolve-moments";
import type { GraduationSettingsContent } from "./settings-types";

export type GuestPlaceholders = { texts: Record<Lang, Record<string, string>>; moments: Record<Lang, Moment[]>; times: EventTimes };

const byLang = <T>(make: (lang: Lang) => T): Record<Lang, T> => ({ vi: make("vi"), en: make("en") });

export const guestPlaceholders = (settings: GraduationSettingsContent): GuestPlaceholders => ({
  texts: byLang((lang) => flattenTexts(layerTexts(lang, settings))),
  moments: byLang((lang) => resolveMoments({ lang, defaults: DEFAULT_MOMENTS[lang], settings: settings.moments })),
  times: resolveEventTimes(settings.event, undefined),
});
```

`guest-content-summary.ts`:
```ts
import { LANGS } from "../i18n/config";
import { GUEST_COPY_TABS } from "./fields/guest-keys";
import type { GuestContent } from "./settings-types";

export type GuestContentSummary = { envelope: boolean; met: boolean; moments: number; ends: boolean; music: boolean };

const hasText = (content: GuestContent, keys: readonly string[]) => LANGS.some((lang) => keys.some((key) => Boolean(content[lang]?.[key])));

export function summarizeGuestContent(content: GuestContent | null): GuestContentSummary {
  const moments = content?.moments?.length ?? 0;
  if (!content) return { envelope: false, met: false, moments, ends: false, music: false };
  return {
    envelope: hasText(content, GUEST_COPY_TABS.envelope) || Boolean(content.images?.coverImage),
    met: hasText(content, GUEST_COPY_TABS.met) || Boolean(content.images?.togetherPhoto) || moments > 0,
    moments,
    ends: hasText(content, GUEST_COPY_TABS.ends) || Boolean(content.event?.start || content.event?.end),
    music: Boolean(content.music?.youtubeId),
  };
}
```

- [ ] **Step 4: Chạy test** → PASS.

- [ ] **Step 5: Commit** `feat(graduation): guest form placeholders and customisation summary`

---

### Task 57: `GuestCopyFields`

**Files:**
- Create: `app/admin/graduation/components/fields/guest-copy-fields.tsx`

**Interfaces:**
- Consumes: `COPY_FIELD_BY_KEY`, `BilingualRow`, `toRowField`, `setOverride`, `PANEL_CLASS`, `GuestContent`.
- Produces: `GuestCopyFields({ keys, content, placeholders, onChange }: { keys: readonly string[]; content: GuestContent; placeholders: Record<Lang, Record<string, string>>; onChange: (next: GuestContent) => void })`

- [ ] **Step 1: Viết code**

```tsx
"use client";

import { COPY_FIELD_BY_KEY } from "@/lib/graduation/content/fields";
import { setOverride } from "@/lib/graduation/content/overrides";
import type { GuestContent } from "@/lib/graduation/content/settings-types";
import type { Lang } from "@/lib/graduation/i18n/types";
import { BilingualRow } from "./bilingual-row";
import { PANEL_CLASS } from "./field-classes";
import { toRowField } from "./row-field";

type GuestCopyFieldsProps = {
  keys: readonly string[];
  content: GuestContent;
  placeholders: Record<Lang, Record<string, string>>;
  onChange: (next: GuestContent) => void;
};

export function GuestCopyFields({ keys, content, placeholders, onChange }: GuestCopyFieldsProps) {
  const fields = keys.flatMap((key) => {
    const field = COPY_FIELD_BY_KEY.get(key);
    return field ? [field] : [];
  });

  return (
    <div className={PANEL_CLASS}>
      {fields.map((field) => (
        <BilingualRow
          key={field.key}
          field={toRowField(field)}
          values={{ vi: content.vi?.[field.key] ?? "", en: content.en?.[field.key] ?? "" }}
          placeholders={{ vi: placeholders.vi[field.key] ?? "", en: placeholders.en[field.key] ?? "" }}
          onChange={(lang, value) => onChange({ ...content, [lang]: setOverride(content[lang], field.key, value) })}
          onReset={() => onChange({ ...content, vi: setOverride(content.vi, field.key, ""), en: setOverride(content.en, field.key, "") })}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Kiểm tra** — `npx tsc --noEmit -p .`.

- [ ] **Step 3: Commit** `feat(admin): bilingual guest copy fields`

---

### Task 58: Chuyển custom khách sang dạng mới

Các thay đổi dưới đây phải nằm trong một commit, vì đổi kiểu `GuestRecord.customContent` thì mọi tab và bảng khách đều phải đổi theo cho `tsc` qua được. Mỗi bước vẫn chỉ sửa một file.

**Files:**
- Modify: `lib/graduation/types.ts`
- Modify: `lib/graduation/guest-repository.ts`
- Modify: `lib/graduation/guest-schema.ts`
- Modify: `lib/graduation/guest-service.ts`
- Delete: `lib/graduation/guest-custom-schema.ts`
- Delete: `tests/lib/graduation/guest-custom-schema.test.ts`
- Modify: `tests/lib/graduation/guest-service.test.ts`
- Modify: `app/admin/graduation/page.tsx`
- Modify: `app/admin/graduation/components/graduation-manager.tsx`
- Modify: `app/admin/graduation/components/guest-table.tsx`
- Modify: `app/admin/graduation/components/guest-editor-dialog.tsx`
- Modify (viết lại): `app/admin/graduation/components/tabs/envelope-tab.tsx`
- Modify (viết lại): `app/admin/graduation/components/tabs/moments-tab.tsx`
- Modify (viết lại): `app/admin/graduation/components/tabs/ends-tab.tsx`
- Modify (viết lại): `app/admin/graduation/components/tabs/rsvp-tab.tsx`
- Create: `app/admin/graduation/components/tabs/guest-tab-props.ts`
- Modify: `app/admin/graduation/components/tabs/music-tab.tsx`

**Interfaces:**
- Consumes: `GuestContent`, `guestContentInputSchema`, `normalizeGuestContent`, `guestPlaceholders`, `GuestPlaceholders`, `summarizeGuestContent`, `GuestCopyFields`, `GUEST_COPY_TABS`, `MomentsEditor`, `DatetimeField`, `ImageUploader`.
- Produces: `GuestRecord.customContent: GuestContent | null`, `GuestData.customContent?: GuestContent | null`. Lỗi custom khách trả về dạng `{ customContent: "<đường dẫn>: <thông báo>" }`.

**Kiểm tra trước:** `grep -rn "EnvelopeCustomization\|MetCustomization\|EndsCustomization\|RsvpCustomization\|MusicCustomization\|CustomMoment\|GuestCustomContent\|guestCustomContentSchema\|risoColorSchema" app components lib tests`. Mọi kết quả phải nằm trong các file ở danh sách trên. Nếu có file khác thì dừng và hỏi.

- [ ] **Step 1: Test cho lỗi custom khách** — thêm vào `tests/lib/graduation/guest-service.test.ts` (trong `describe("saveGuest", …)`):

```ts
  it("reports where invalid custom content is wrong", async () => {
    const repo = fakeRepo();
    const result = await saveGuest(repo, { name: "A", slug: "a", note: "", customContent: { vi: { "gate.tapBee": "x" } } });
    expect(result).toEqual({ ok: false, fieldErrors: { customContent: "vi.gate.tapBee: Trường không tồn tại" } });
  });

  it("accepts and converts legacy custom content", async () => {
    const repo = fakeRepo();
    await saveGuest(repo, { name: "A", slug: "a", note: "", customContent: { envelope: { cardGreeting: "Kính gửi," } } });
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ customContent: expect.objectContaining({ vi: { "card.greeting": "Kính gửi," } }) }));
  });
```
Chạy `npx vitest run tests/lib/graduation/guest-service.test.ts` → hai test mới FAIL.

- [ ] **Step 2: `lib/graduation/types.ts`**

Xóa các kiểu `CustomMoment`, `EnvelopeCustomization`, `MetCustomization`, `EndsCustomization`, `MusicCustomization`, `RsvpCustomization`, `GuestCustomContent`. Thêm ở đầu file `import type { GuestContent } from "./content/settings-types";`. Đổi `customContent: GuestCustomContent | null;` (trong `GuestRecord`) thành `customContent: GuestContent | null;` và `customContent?: GuestCustomContent | null;` (trong `GuestData`) thành `customContent?: GuestContent | null;`.

- [ ] **Step 3: `lib/graduation/guest-repository.ts`**

Bỏ `GuestCustomContent` khỏi dòng import type. Thêm `import { normalizeGuestContent } from "./content/normalize-guest-content";`. Trong `parseRecord` đổi dòng `customContent:` thành:
```ts
    customContent: row.customContent == null ? null : normalizeGuestContent(row.customContent, null),
```

- [ ] **Step 4: `lib/graduation/guest-schema.ts`**

Thay `import { guestCustomContentSchema } from "./guest-custom-schema";` bằng `import { guestContentInputSchema } from "./content/guest-content-schema";`. Thay hàm `parseCustomContent` bằng:
```ts
const parseCustomContent = (value: unknown) => {
  if (value === undefined) return undefined;
  if (value === null || value === "" || value === "null") return null;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};
```
và dòng cuối của schema:
```ts
  customContent: z.preprocess(parseCustomContent, guestContentInputSchema.nullable().optional()),
```
Hàm cũ nuốt lỗi khi dữ liệu là chuỗi JSON. Hàm mới để lỗi đi qua zod, để admin thấy lỗi.

- [ ] **Step 5: `lib/graduation/guest-service.ts`** — trong vòng lặp issue, thay `errors[field] ??= issue.message;` bằng:
```ts
      const detail = issue.path.slice(1).map(String).join(".");
      errors[field] ??= field === "customContent" && detail ? `${detail}: ${issue.message}` : issue.message;
```
Rồi chạy test ở Step 1 → PASS.

- [ ] **Step 6: Xóa schema cũ**

```bash
git rm lib/graduation/guest-custom-schema.ts tests/lib/graduation/guest-custom-schema.test.ts
```

- [ ] **Step 7: `app/admin/graduation/page.tsx`**

Thêm import `loadGraduationSettings` và `guestPlaceholders`. Đổi `const guests = await guestRepository.list();` thành:
```ts
  const [guests, settings] = await Promise.all([guestRepository.list(), loadGraduationSettings()]);
```
và `<GraduationManager initialGuests={guests} />` thành `<GraduationManager initialGuests={guests} placeholders={guestPlaceholders(settings)} />`.

- [ ] **Step 8: `graduation-manager.tsx`**

Chữ ký: `export function GraduationManager({ initialGuests, placeholders }: { initialGuests: GuestListItem[]; placeholders: GuestPlaceholders })`, với `import type { GuestPlaceholders } from "@/lib/graduation/content/guest-placeholders";`. Truyền `placeholders={placeholders}` vào `<GuestTable …>` và `<GuestEditorDialog …>`.

- [ ] **Step 9: `guest-table.tsx`**

- `GuestTableProps` thêm `placeholders: GuestPlaceholders`, truyền xuống `<GuestEditorDialog placeholders={placeholders} …>` ở dòng ~209.
- Thay 6 dòng từ `const custom = guest.customContent;` tới `const hasMusic = …` bằng:
  ```ts
                const summary = summarizeGuestContent(guest.customContent);
  ```
- Trong JSX bên dưới: `hasEnvelope` → `summary.envelope`, `hasMet` → `summary.met`, `momentsCount` → `summary.moments`, `hasEnds` → `summary.ends`, `hasMusic` → `summary.music`.
- Thêm `import { summarizeGuestContent } from "@/lib/graduation/content/guest-content-summary";`.

Sau khi sửa, `grep -n "hasEnvelope\|hasMet\|hasEnds\|hasMusic\|momentsCount\|custom?\." app/admin/graduation/components/guest-table.tsx` phải trả rỗng.

- [ ] **Step 10: Các tab (viết lại)**

Mọi tab cùng nhận props `{ content: GuestContent; placeholders: GuestPlaceholders; onChange: (next: GuestContent) => void }`.

Tạo trước `app/admin/graduation/components/tabs/guest-tab-props.ts` để bốn tab dùng chung kiểu props:
```ts
import type { GuestPlaceholders } from "@/lib/graduation/content/guest-placeholders";
import type { GuestContent } from "@/lib/graduation/content/settings-types";

export type GuestTabProps = { content: GuestContent; placeholders: GuestPlaceholders; onChange: (next: GuestContent) => void };
```

`tabs/envelope-tab.tsx`:
```tsx
"use client";

import { GUEST_COPY_TABS } from "@/lib/graduation/content/fields/guest-keys";
import type { GuestTabProps } from "./guest-tab-props";
import { GuestCopyFields } from "../fields/guest-copy-fields";
import { PANEL_CLASS } from "../fields/field-classes";
import { ImageUploader } from "../image-uploader";

export function EnvelopeTab({ content, placeholders, onChange }: GuestTabProps) {
  return (
    <div className="flex flex-col gap-4">
      <GuestCopyFields keys={GUEST_COPY_TABS.envelope} content={content} placeholders={placeholders.texts} onChange={onChange} />
      <div className={PANEL_CLASS}>
        <ImageUploader
          label="Ảnh nhỏ trên thiệp"
          value={content.images?.coverImage ?? ""}
          onChange={(coverImage) => onChange({ ...content, images: { ...content.images, coverImage: coverImage || undefined } })}
          helperText="Để trống để dùng ảnh trong Cài đặt chung"
        />
      </div>
    </div>
  );
}
```

`tabs/moments-tab.tsx`:
```tsx
"use client";

import { GUEST_COPY_TABS } from "@/lib/graduation/content/fields/guest-keys";
import type { GuestTabProps } from "./guest-tab-props";
import { GROUP_TITLE_CLASS, PANEL_CLASS } from "../fields/field-classes";
import { GuestCopyFields } from "../fields/guest-copy-fields";
import { MomentsEditor } from "../fields/moments-editor";
import { ImageUploader } from "../image-uploader";

export function MomentsTab({ content, placeholders, onChange }: GuestTabProps) {
  return (
    <div className="flex flex-col gap-4">
      <GuestCopyFields keys={GUEST_COPY_TABS.met} content={content} placeholders={placeholders.texts} onChange={onChange} />
      <section className={PANEL_CLASS}>
        <h4 className={GROUP_TITLE_CLASS}>Kỷ niệm riêng</h4>
        <MomentsEditor
          moments={content.moments ?? []}
          fallback={placeholders.moments}
          onChange={(moments) => onChange({ ...content, moments: moments.length > 0 ? moments : undefined })}
        />
      </section>
      <div className={PANEL_CLASS}>
        <ImageUploader
          label="Ảnh chụp chung với khách"
          value={content.images?.togetherPhoto ?? ""}
          onChange={(togetherPhoto) => onChange({ ...content, images: { ...content.images, togetherPhoto: togetherPhoto || undefined } })}
          helperText="Ảnh thứ 5, bay vào cuối cùng phía trên lời nhắn cá nhân. Để trống để dùng ảnh trong Cài đặt chung."
        />
      </div>
    </div>
  );
}
```

`tabs/ends-tab.tsx`:
```tsx
"use client";

import { GUEST_COPY_TABS } from "@/lib/graduation/content/fields/guest-keys";
import type { GuestTabProps } from "./guest-tab-props";
import { DatetimeField } from "../fields/datetime-field";
import { PANEL_CLASS } from "../fields/field-classes";
import { GuestCopyFields } from "../fields/guest-copy-fields";

export function EndsTab({ content, placeholders, onChange }: GuestTabProps) {
  const setTime = (key: "start" | "end", value: string | undefined) => onChange({ ...content, event: { ...content.event, [key]: value } });
  return (
    <div className="flex flex-col gap-4">
      <div className={`${PANEL_CLASS} grid grid-cols-1 gap-3 sm:grid-cols-2`}>
        <DatetimeField label="Bắt đầu (riêng khách này)" value={content.event?.start} fallback={placeholders.times.startUtc} onChange={(value) => setTime("start", value)} />
        <DatetimeField label="Kết thúc (riêng khách này)" value={content.event?.end} fallback={placeholders.times.endUtc} onChange={(value) => setTime("end", value)} />
      </div>
      <GuestCopyFields keys={GUEST_COPY_TABS.ends} content={content} placeholders={placeholders.texts} onChange={onChange} />
    </div>
  );
}
```

`tabs/rsvp-tab.tsx`:
```tsx
"use client";

import { GUEST_COPY_TABS } from "@/lib/graduation/content/fields/guest-keys";
import type { GuestTabProps } from "./guest-tab-props";
import { GuestCopyFields } from "../fields/guest-copy-fields";

export function RsvpTab({ content, placeholders, onChange }: GuestTabProps) {
  return <GuestCopyFields keys={GUEST_COPY_TABS.rsvp} content={content} placeholders={placeholders.texts} onChange={onChange} />;
}
```

`tabs/music-tab.tsx`: đổi `import type { MusicCustomization } from "@/lib/graduation/types";` thành `import type { GuestContent } from "@/lib/graduation/content/settings-types";` và kiểu `MusicCustomization` thành `NonNullable<GuestContent["music"]>`.

- [ ] **Step 11: `guest-editor-dialog.tsx`**

1. Import: bỏ `GuestCustomContent` khỏi `import type { GuestListItem, GuestCustomContent }`; thêm
   ```ts
   import type { GuestPlaceholders } from "@/lib/graduation/content/guest-placeholders";
   import type { GuestContent } from "@/lib/graduation/content/settings-types";
   ```
2. `GuestEditorDialogProps` thêm `placeholders: GuestPlaceholders;` và destructure `placeholders`.
3. State: `const [customContent, setCustomContent] = useState<GuestContent>(guest?.customContent ?? {});`
4. Thay 5 khối render tab (`envelope`, `met`, `ends`, `rsvp`, `music`) bằng:
   ```tsx
          {activeTab === "envelope" && <EnvelopeTab content={customContent} placeholders={placeholders} onChange={setCustomContent} />}
          {activeTab === "met" && <MomentsTab content={customContent} placeholders={placeholders} onChange={setCustomContent} />}
          {activeTab === "ends" && <EndsTab content={customContent} placeholders={placeholders} onChange={setCustomContent} />}
          {activeTab === "rsvp" && <RsvpTab content={customContent} placeholders={placeholders} onChange={setCustomContent} />}
          {activeTab === "music" && (
            <MusicTab music={customContent.music ?? {}} onChange={(music) => setCustomContent({ ...customContent, music })} />
          )}
   ```
5. Thông báo lỗi custom: đổi dòng `const globalError = …` thành
   ```ts
   const globalError = state && !state.ok ? ("error" in state ? state.error : fieldErrors.customContent) ?? null : null;
   ```
   **Kiểm tra trước:** `fieldErrors` có kiểu `Partial<Record<GuestField, string>> | Record<string, string>`; nếu `tsc` báo không có `customContent`, dùng `(fieldErrors as Record<string, string>).customContent`.
6. Sửa mô tả dưới tiêu đề dialog: "Tùy chỉnh thông tin, thiệp mời, các thẻ kỷ niệm và ảnh tải lên Vercel Blob" thành "Tùy chỉnh riêng cho khách này, cả tiếng Việt và tiếng Anh. Ô để trống dùng Cài đặt chung (chữ mờ trong ô)."

- [ ] **Step 12: Kiểm tra tự động**

- `npx tsc --noEmit -p .` → không lỗi.
- `npx vitest run tests/lib tests/app tests/components` → không có test fail mới.
- `npx eslint app/admin lib/graduation components/graduation` → không lỗi mới.

- [ ] **Step 13: Kiểm tra trên trình duyệt** (`/admin/graduation`)

1. Mở khách "test" (đang có custom cũ). Tab "Bìa & Thiệp" hiện lời chào/nội dung cũ trong cột **VI**, cột EN trống với placeholder EN. Placeholder cột VI của ô trống là giá trị Cài đặt chung.
2. Nhập lời chào EN "Dear friend," rồi lưu. Mở thiệp của khách: VI hiện bản cũ, EN hiện "Dear friend,".
3. Tab "Buổi lễ & Vé": đặt riêng giờ `2026-12-20 14:00`, lưu. Thiệp khách này hiện "Chủ Nhật 20.12.2026"; thiệp khách khác vẫn 28.11. Link Apple Calendar của khách này tải `.ics` có `DTSTART:20261220T070000Z`.
4. Tab "RSVP": ô câu hỏi gõ `{nam}` rồi lưu → dialog báo "vi.rsvp.prompt: Chỗ trống không hỗ trợ: {nam}", không đóng.
5. Bảng khách: khách "test" vẫn hiện đúng các huy hiệu Bìa/Kỷ niệm/Buổi lễ/Nhạc như trước.
6. **Dọn dẹp:** xóa giờ riêng và lời chào EN vừa thêm, rồi lưu.

- [ ] **Step 14: Commit** `feat(admin): bilingual per-guest customisation`

---

## Giai đoạn G: Kiểm tra cuối

### Task 59: Kiểm tra toàn bộ

**Files:** không tạo file mới. Chỉ sửa nếu bước kiểm tra phát hiện lỗi, và sửa trong đúng file gây lỗi.

- [ ] **Step 1: Test, kiểu, lint**

```bash
npx vitest run
npx tsc --noEmit -p .
npx eslint app components lib tests
```
Expected: chỉ còn 2 test character đã fail sẵn (xem Global Constraints); `tsc` và `eslint` không lỗi.

- [ ] **Step 2: Không còn chữ viết cứng**

```bash
grep -rnE "Võ Lê Quang Vinh|vinhvolequang|TP\.HCM|28\.11|\b2026\b|\"QV\"|>QV<|Quý khách" components/graduation app/graduation
```
Expected: rỗng. Nếu còn kết quả: trong comment hoặc test fixture thì bỏ qua; trong chuỗi hiển thị thì dừng lại và báo, không tự thêm trường mới.

- [ ] **Step 3: Không còn comment thừa**

`git diff main --stat` để xem các file đã đổi, rồi `git diff main -- <file>` cho từng file. Xóa mọi comment mới chỉ diễn giải lại code. Comment được phép giữ: comment về `next.config` ở `bk-badge.tsx`, doc comment của `mapLinkUrl`, và comment đã có từ trước.

- [ ] **Step 4: Build**

Run: `npx next build`
Expected: build thành công. Nếu lỗi vì không kết nối được DB lúc build, ghi lại nguyên văn lỗi và báo; không đổi cấu hình build.

- [ ] **Step 5: Kiểm tra tay toàn trang** (màn rộng và 390px, VI và EN)

1. `/graduation/<id>`: mở thiệp, cuộn hết trang. Không có chữ `{`. Ngày, giờ, địa điểm, tên chủ thiệp, tem/dấu đúng.
2. Tải ảnh PNG ở cả VI và EN.
3. Mở `/graduation/<id>/opengraph-image`.
4. Thêm vào lịch (Google + Apple).
5. `/graduation/khong-ton-tai` → trang 404.
6. Trang Cài đặt: sửa một trường ở mỗi tab, xem thiệp đổi theo, rồi trả về mặc định.

- [ ] **Step 6: Commit** (chỉ khi có sửa) `chore(graduation): final clean-up for admin-editable content`
