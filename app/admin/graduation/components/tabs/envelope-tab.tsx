"use client";

import type { EnvelopeCustomization } from "@/lib/graduation/types";
import { ImageUploader } from "../image-uploader";

interface EnvelopeTabProps {
  envelope: EnvelopeCustomization;
  onChange: (updated: EnvelopeCustomization) => void;
}

export function EnvelopeTab({ envelope, onChange }: EnvelopeTabProps) {
  const inputClass =
    "w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500";

  const update = (key: keyof EnvelopeCustomization, val: string) => {
    onChange({ ...envelope, [key]: val });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
          1. Tiêu đề trang bìa (Cover Heading)
        </h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Tiêu đề trước (Lead)</label>
            <input
              type="text"
              value={envelope.coverLead || ""}
              onChange={(e) => update("coverLead", e.target.value)}
              placeholder="Mặc định: Ngày"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Điểm nhấn (Accent)</label>
            <input
              type="text"
              value={envelope.coverAccent || ""}
              onChange={(e) => update("coverAccent", e.target.value)}
              placeholder="Mặc định: tốt nghiệp."
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
          2. Nội dung thiệp mời (Invitation Card)
        </h4>
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Lời chào thiệp (Greeting)</label>
            <input
              type="text"
              value={envelope.cardGreeting || ""}
              onChange={(e) => update("cardGreeting", e.target.value)}
              placeholder="Mặc định: Xin chào,"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Lời nhắn trên thiệp (Body text)</label>
            <textarea
              rows={3}
              value={envelope.cardBody || ""}
              onChange={(e) => update("cardBody", e.target.value)}
              placeholder="Mặc định: Mình là Quang Vinh. Sau bốn năm ở Bách Khoa, mình sắp khoác lên tấm áo cử nhân — và mình rất muốn có bạn ở đó."
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Chữ ký người gửi (Signature)</label>
            <input
              type="text"
              value={envelope.cardAuthor || ""}
              onChange={(e) => update("cardAuthor", e.target.value)}
              placeholder="Mặc định: — Vinh (Tom)"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
          3. Ảnh thiệp mời / Ảnh bìa (Cover Image)
        </h4>
        <ImageUploader
          label="Tải ảnh bìa thiệp mời lên Vercel Blob"
          value={envelope.coverImage || ""}
          onChange={(url) => update("coverImage", url)}
          helperText="Ảnh này sẽ xuất hiện trên thiệp mời dành riêng cho khách này"
        />
      </div>
    </div>
  );
}
