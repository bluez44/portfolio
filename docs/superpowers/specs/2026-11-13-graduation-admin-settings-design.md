# Thiệp tốt nghiệp: admin chỉnh được toàn bộ nội dung

**Ngày:** 13/11/2026
**Trạng thái:** đã thống nhất thiết kế, chờ duyệt spec

## Mục tiêu

Admin sửa được mọi nội dung hiển thị trên `/graduation/[guest_id]` và trên ảnh thiệp PNG mà không phải sửa code: thông tin chủ thiệp, dữ liệu sự kiện, ảnh và toàn bộ text, ở cả tiếng Việt và tiếng Anh. Chuyển VI/EN không bao giờ bị lẫn ngôn ngữ.

## Hiện trạng

- Text nằm trong `lib/graduation/i18n/copy/vi.ts` và `en.ts`, dữ liệu sự kiện trong `GRADUATION_EVENT` (`lib/graduation/event.ts`).
- Admin chỉ custom được một phần text cho **từng khách** (`Guest.customContent`), một ngôn ngữ, và custom đó đè lên cả bản EN.
- Một số lỗi do cách custom hiện tại:
  - đổi ngày giờ chỉ đổi phần chữ; đếm ngược, lịch Google/Apple, `.ics` vẫn dùng `startUtc`/`endUtc` cố định;
  - "28.11" viết cứng trong kết quả RSVP, con dấu, lời nhân vật; side rail tự nối `.2026`;
  - đổi địa điểm không đổi bản đồ và tour 360°;
  - ảnh thiệp PNG và ảnh OG không đọc custom, luôn dùng copy VI.

## Quyết định đã chốt

1. Thêm **Cài đặt chung** áp dụng cho mọi khách. Custom từng khách giữ nguyên vai trò, đè lên Cài đặt chung.
2. Mọi trường text nhập **VI và EN**, cả ở Cài đặt chung lẫn custom từng khách.
3. Thứ tự ưu tiên, **xét từng trường**: custom khách theo ngôn ngữ đang xem → Cài đặt chung theo ngôn ngữ đó → mặc định trong code. Bản EN trống thì bỏ qua lớp đó, **không** lấy sang VI.
4. Mặc định vẫn nằm trong code. DB chỉ lưu những trường admin đã sửa.
5. `dateShort`/`timeRange` cũ trong custom khách bị bỏ qua (chuỗi tự do, không chuyển được thành thời điểm). Admin nhập lại bằng ô ngày giờ.

---

## Phần 1: Dữ liệu và cách ghép nội dung

### Lưu trữ

Model Prisma mới, một dòng duy nhất:

```prisma
model GraduationSettings {
  id        String   @id @default("default")
  content   Json
  updatedAt DateTime @updatedAt
}
```

Kèm một migration mới trong `prisma/migrations/`.

`content` (mọi trường đều tuỳ chọn):

```ts
type GraduationSettingsContent = {
  owner?: { name?: string; website?: string; phone?: string };
  event?: {
    start?: string;            // ISO UTC
    end?: string;              // ISO UTC
    mapEmbedUrl?: string;
    virtualTourUrl?: string;
    virtualTourOwnerUrl?: string;
    musicYoutubeId?: string;
  };
  images?: { coverImage?: string; togetherPhoto?: string; badgeLogo?: string };
  moments?: SettingsMoment[];
  copy?: { vi?: Record<CopyKey, string>; en?: Record<CopyKey, string> };
};

type SettingsMoment = {
  year: string;
  image: string;
  color?: RisoColor;
  vi?: { title?: string; body?: string };
  en?: { title?: string; body?: string };
};
```

`CopyKey` là đường dẫn phẳng trong copy, ví dụ `"met.intro"`, `"rsvp.result.yes"`, `"ends.notes"` (trường danh sách lưu chuỗi nhiều dòng, mỗi dòng một mục).

### Text có chỗ trống

- Các hàm trong `vi.ts`/`en.ts` chuyển thành chuỗi mẫu, ví dụ `andYou: "Và bạn, {name}"`. Các chuỗi đang chứa ngày hay tên chủ thiệp cũng chuyển thành mẫu.
- Kiểu nguồn mới `CopyTexts` (chỉ có chuỗi). `buildCopy(texts, vars)` dựng ra đúng kiểu `GraduationCopy` hiện tại, các trường từng là hàm vẫn là hàm. **Component không cần sửa.**
- Chỗ trống hỗ trợ:

| Chỗ trống | Nguồn | Ví dụ |
|---|---|---|
| `{name}` | tên khách | Lan |
| `{owner}` | `owner.name` | Võ Lê Quang Vinh |
| `{date}` | ngày bắt đầu, `dd.MM` | 28.11 |
| `{year}` | năm bắt đầu | 2026 |
| `{weekday}` | thứ, theo ngôn ngữ | Thứ Bảy / Saturday |
| `{time}` | `HH:mm — HH:mm` | 16:30 — 18:30 |
| `{n}` | số thứ tự lời chúc (chỉ `wishes.airMail`) | 07 |

- Ngày giờ tính theo múi giờ `Asia/Ho_Chi_Minh`.
- Mỗi trường mẫu khai báo chỗ trống nó được dùng. Chỗ trống không có giá trị lúc render thì thay bằng chuỗi rỗng.

### Custom từng khách, dạng mới

```ts
type GuestCustomContent = {
  vi?: GuestTexts;
  en?: GuestTexts;
  images?: { coverImage?: string; togetherPhoto?: string };
  moments?: SettingsMoment[];
  event?: { start?: string; end?: string };
  music?: { youtubeId?: string };
};
```

`GuestTexts` là các key copy được custom theo khách: cover (lead/accent), lời chào, nội dung thiệp, người ký, heading/intro/lời nhắn của met, heading/intro/hội trường/địa chỉ/ghi chú/lời nhắn riêng của ends, heading/câu hỏi của RSVP.

- `normalizeGuestCustom()` đọc được cả dạng phẳng cũ: các trường text cũ thành `vi`, ảnh cũ thành `images`, `music` giữ nguyên, `dateShort`/`timeRange` bị bỏ.
- Kỷ niệm của khách: nếu khách có danh sách riêng thì dùng danh sách đó; tiêu đề/nội dung EN trống lấy kỷ niệm EN của Cài đặt chung (hoặc mặc định) ở **cùng vị trí**.

### Ghép nội dung

- `resolveGraduationContent({ lang, settings, custom })` (thuần, không đọc DB) trả `{ copy: GraduationCopy, event: ResolvedEvent }`. Thay cho `resolveInvitationCopy`.
- `venue`/`address` chuyển từ `event` sang copy (`ends.venue`, `ends.address`) để có cả VI/EN. `ResolvedEvent` (thời gian, URL bản đồ/tour, nhạc, địa điểm của ngôn ngữ đang xem) dùng cho `.ics`, lịch và ảnh PNG.
- `loadGraduationSettings()` (server, bọc `React.cache`): đọc DB, validate, trả `GraduationSettingsContent`. Được gọi ở page, `generateMetadata`, `opengraph-image.tsx`, `card/route.tsx`, `calendar.ics/route.ts`.
- Client: page truyền `settings` và `customContent` (JSON) vào `LangProvider`. Provider ghép theo `lang` bằng `useMemo` như hiện nay, nên đổi ngôn ngữ vẫn tức thì.

---

## Phần 2: Trang admin

### Danh sách trường

`lib/graduation/settings/fields.ts` khai báo mọi trường:

```ts
type FieldKind = "text" | "textarea" | "template" | "list" | "image" | "datetime" | "url" | "youtube" | "phone";
type FieldDef = { key: string; section: SectionKey; label: string; kind: FieldKind; vars?: TemplateVar[]; localized: boolean };
```

Danh sách này điều khiển: form admin, schema zod khi lưu, và việc ghép copy. Thêm text mới chỉ cần thêm một dòng.

### Trang `/admin/graduation/settings`

- `AdminNav` thêm mục "Cài đặt thiệp (Settings)". Trang kiểm tra `isAdminSession()` như `/admin/graduation`.
- Thanh tab theo section: Chủ thiệp · Sự kiện · Gate · Header & Rails · Phong bì & Thiệp · Met & Kỷ niệm · Ends & Bản đồ · RSVP · Wishes · Finale · Nhân vật · Footer, Meta & 404 · Ảnh thiệp PNG.
- Mỗi trường text là một hàng: nhãn, ô **VI** và ô **EN** cạnh nhau (xếp dọc dưới 760px).
  - Placeholder là giá trị mặc định trong code.
  - Ô đã sửa có chấm màu và nút ↺ về mặc định.
  - Trường mẫu hiện chip cho các chỗ trống được phép; bấm chip chèn `{…}` vào vị trí con trỏ.
- Ảnh dùng `ImageUploader` có sẵn. Ngày giờ dùng `datetime-local`, hiểu theo giờ Việt Nam.
- Kỷ niệm: thêm, xoá, đổi thứ tự. Mỗi kỷ niệm có năm, ảnh, màu, tiêu đề/nội dung VI/EN.
- Ô tìm kiếm lọc trường theo nhãn hoặc nội dung.
- Một nút **Lưu** chung, nút **Xem trước** mở thiệp của khách đầu tiên trong danh sách. Thanh dưới cùng báo số trường chưa lưu. Rời trang khi chưa lưu thì hỏi xác nhận (`beforeunload`).
- Giao diện theo phong cách zinc tối của admin hiện có.

### Server action

`saveGraduationSettingsAction(formData)` trong `app/admin/graduation/settings/actions.ts`:

1. Kiểm tra `isAdminSession()`.
2. Parse JSON, validate bằng schema dựng từ danh sách trường.
3. Upsert dòng `default`.
4. `revalidatePath("/graduation", "layout")` và `revalidatePath("/admin/graduation/settings")`.

### Form custom từng khách

- Các tab `envelope`, `moments`, `ends`, `rsvp` dùng chung component hàng VI | EN với trang settings.
- Placeholder hiện **giá trị của Cài đặt chung** (đã ghép với mặc định).
- Ngày giờ riêng của khách đổi từ `dateShort`/`timeRange` sang hai ô `datetime-local`.
- `/admin/graduation/page.tsx` nạp settings để truyền placeholder xuống form.

---

## Phần 3: Nối các chỗ đang viết cứng

| Chỗ | Đang viết cứng | Thay bằng |
|---|---|---|
| `components/graduation/chrome/invitation-footer.tsx` | "Võ Lê Quang Vinh" | `{owner}` |
| `components/graduation/wishes/wish-postcard.tsx` | người nhận "Võ Lê Quang Vinh" | `{owner}` |
| `components/graduation/finale/finale-reply-card.tsx` | "HCMUT" | trường `finale.schoolMark` |
| `components/graduation/met/components/bk-badge.tsx` | `/01_logobachkhoatoi.webp` | `images.badgeLogo` |
| `components/graduation/chrome/invitation-header.tsx` | "Portfolio" | trường `header.back` |
| `app/graduation/not-found.tsx` | "← Portfolio" | trường `header.back` |
| `app/graduation/[guest_id]/page.tsx` | `siteName` | `owner.name` |
| `envelope.from`, `rsvp.letter.to`, `meta.title` | tên trong chuỗi | mẫu `{owner}` |
| `rails.whenValue`, `ends.day`, `rsvp.result.yes`, `rsvp.stamp`, `narrator.farewell` | ngày trong chuỗi | mẫu `{weekday}`/`{date}`/`{year}`/`{time}` |
| `lib/graduation/resolve-invitation-copy.ts` | nối `.2026` | bỏ (thay bằng resolver mới) |
| `components/graduation/finale/use-countdown.ts` | `GRADUATION_EVENT.start/endUtc` | event đã ghép |
| `lib/graduation/calendar.ts`, `app/graduation/calendar.ics/route.ts` | `GRADUATION_EVENT` | event đã ghép, theo ngôn ngữ cookie |
| `components/graduation/ends/venue-guide/venue-guide.tsx` | `GRADUATION_EVENT` | event đã ghép |
| `app/graduation/[guest_id]/card/route.tsx` | copy VI cố định; "16:30 — 18:30", "Quý khách", "Rất vinh hạnh…", "vinhvolequang.io.vn", alt QR | ghép theo khách và ngôn ngữ cookie; trường mới nhóm `card.png.*`; `owner.website` |
| `app/graduation/[guest_id]/opengraph-image.tsx` | copy VI cố định | ghép theo khách, ngôn ngữ cookie |
| `lib/graduation/owner-phone.ts` | chỉ đọc env | `owner.phone` trước, env dự phòng |

`opengraph-image.tsx` giữ `alt` là hằng số (Next đọc lúc build).

**Không đưa vào admin:** màu riso và góc nghiêng mặc định của thẻ, class CSS, tên file tải thiệp, các key của nhân vật.

---

## Phần 4: Lỗi, tương thích, test

### Xử lý lỗi

- Đọc settings: trường không hợp lệ thì bỏ trường đó và `console.warn`, phần còn lại vẫn dùng. DB lỗi hoặc chưa có dòng thì dùng mặc định trong code.
- Ghép mẫu: chỗ trống không có giá trị thay bằng chuỗi rỗng.
- Lưu: trả `fieldErrors` theo key để form tô đỏ đúng ô. `event.end` phải sau `event.start`. Chuỗi mẫu dùng chỗ trống không được phép thì báo lỗi.

### Tương thích

- `customContent` cũ được `normalizeGuestCustom()` đọc thành dạng mới. Lần lưu kế tiếp ghi theo dạng mới. Không cần migration dữ liệu.
- Mặc định trong code giữ nguyên nội dung. Khi chưa có settings, trang render như hiện tại; các chỗ "28.11" được tính từ ngày sự kiện mặc định nên ra cùng kết quả.

### Test (vitest)

- `tests/lib/graduation/settings/template.test.ts`: điền chỗ trống, thiếu giá trị, chỗ trống lạ.
- `tests/lib/graduation/settings/event-vars.test.ts`: `{date}`, `{year}`, `{weekday}`, `{time}` từ UTC theo giờ Việt Nam, cả VI và EN.
- `tests/lib/graduation/settings/resolve.test.ts`: thứ tự khách → chung → mặc định theo từng trường; EN trống không lấy VI; ảnh/event không phân ngôn ngữ; kỷ niệm EN trống lấy kỷ niệm EN cùng vị trí.
- `tests/lib/graduation/settings/normalize-custom.test.ts`: dạng phẳng cũ thành `vi`, bỏ `dateShort`/`timeRange`.
- `tests/lib/graduation/settings/settings-schema.test.ts`: loại key lạ, báo chỗ trống lạ, `end` sau `start`.
- `tests/lib/graduation/settings/fields.test.ts`: mọi chuỗi trong `vi.ts`/`en.ts` đều có trường trong danh sách và ngược lại.
- Cập nhật `tests/lib/graduation/resolve-invitation-copy.test.ts` theo resolver mới.
- Kiểm tra tay trên trình duyệt: sửa vài trường VI/EN trong admin, xem thiệp hai ngôn ngữ, tải ảnh PNG, mở `.ics`.

### Ngoài phạm vi

Lịch sử phiên bản settings, nhiều admin cùng sửa, ngôn ngữ thứ ba.
