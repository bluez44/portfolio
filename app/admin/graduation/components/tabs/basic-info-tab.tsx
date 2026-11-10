"use client";

interface BasicInfoTabProps {
  name: string;
  setName: (val: string) => void;
  slug: string;
  setSlug: (val: string) => void;
  note: string;
  setNote: (val: string) => void;
  errors?: Record<string, string>;
}

export function BasicInfoTab({
  name,
  setName,
  slug,
  setSlug,
  note,
  setNote,
  errors = {},
}: BasicInfoTabProps) {
  const inputClass =
    "w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500";

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-xs font-semibold text-zinc-300">
          Tên khách mời <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ví dụ: Nguyễn Văn A, Thầy Tuấn, Bạn Linh..."
          className={inputClass}
          required
        />
        {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
        <p className="mt-1 text-[11px] text-zinc-500">
          Tên này sẽ hiển thị trên phong bì, thiệp mời và lời nhắn gửi.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-zinc-300">
          Slug đường dẫn (Tuỳ chọn)
        </label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="nguyen-van-a (tự động tạo từ tên nếu để trống)"
          className={inputClass}
        />
        {errors.slug && <p className="mt-1 text-xs text-red-400">{errors.slug}</p>}
        <p className="mt-1 text-[11px] text-zinc-500">
          Dùng nếu muốn đường dẫn dễ nhớ. URL chính sẽ vẫn dùng UUID để bảo mật.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-zinc-300">
          Lời nhắn riêng cho khách (Tuỳ chọn)
        </label>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Nhập lời nhắn kỷ niệm hoặc lời cảm ơn dành riêng cho người này..."
          className={inputClass}
        />
        {errors.note && <p className="mt-1 text-xs text-red-400">{errors.note}</p>}
        <p className="mt-1 text-[11px] text-zinc-500">
          Xuất hiện ở cuối phần Hành trình (Met section): &ldquo;Và bạn, [Tên]&rdquo;.
        </p>
      </div>
    </div>
  );
}
