"use client";

import { Plus, Trash2 } from "lucide-react";
import type { MetCustomization, CustomMoment } from "@/lib/graduation/types";
import { ImageUploader } from "../image-uploader";

interface MomentsTabProps {
  met: MetCustomization;
  onChange: (updated: MetCustomization) => void;
}

const DEFAULT_MOMENTS: CustomMoment[] = [
  {
    n: "01",
    year: "2022",
    title: "Nhập học Bách Khoa",
    body: "Bước chân vào Khoa học Máy tính — ĐHQG-HCM, Trường ĐH Bách Khoa.",
    image: "/me.jpg",
    color: "tomato",
  },
  {
    n: "02",
    year: "2023",
    title: "Những đêm deadline",
    body: "Bài lab, đồ án và những dòng code đầu tiên chạy được lúc hai giờ sáng.",
    image: "/me%202.jpg",
    color: "blue",
  },
  {
    n: "03",
    year: "2025",
    title: "Thực tập đầu tiên",
    body: "Thực tập tại TMA Solutions — viết React thật cho khách hàng thật, học cách làm việc trong một đội Agile.",
    image: "/tma.webp",
    color: "jade",
  },
  {
    n: "04",
    year: "2026",
    title: "Đi làm & luận văn",
    body: "Front-end Developer ban ngày, TrackNest ban đêm — và chặng cuối của tấm bằng.",
    image: "/portrait.jpg",
    color: "canary",
  },
];

export function MomentsTab({ met, onChange }: MomentsTabProps) {
  const inputClass =
    "w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500";

  const moments = met.moments && met.moments.length > 0 ? met.moments : DEFAULT_MOMENTS;

  const updateHeading = (key: keyof MetCustomization, val: string) => {
    onChange({ ...met, [key]: val });
  };

  const updateMoment = (index: number, updated: CustomMoment) => {
    const list = [...moments];
    list[index] = updated;
    onChange({ ...met, moments: list });
  };

  const removeMoment = (index: number) => {
    const list = moments.filter((_, i) => i !== index);
    onChange({ ...met, moments: list });
  };

  const addMoment = () => {
    const nextN = String(moments.length + 1).padStart(2, "0");
    const newMoment: CustomMoment = {
      n: nextN,
      year: "2026",
      title: "Kỷ niệm mới",
      body: "Nội dung kỷ niệm...",
      image: "",
      color: "tomato",
    };
    onChange({ ...met, moments: [...moments, newMoment] });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
          1. Tiêu đề mục Hành trình (Heading & Intro)
        </h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-3">
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Tiêu đề trước (Lead)</label>
            <input
              type="text"
              value={met.headingLead || ""}
              onChange={(e) => updateHeading("headingLead", e.target.value)}
              placeholder="Mặc định: Bốn năm,"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Điểm nhấn (Accent)</label>
            <input
              type="text"
              value={met.headingAccent || ""}
              onChange={(e) => updateHeading("headingAccent", e.target.value)}
              placeholder="Mặc định: một hành trình."
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-400">Đoạn giới thiệu (Intro)</label>
          <textarea
            rows={2}
            value={met.intro || ""}
            onChange={(e) => updateHeading("intro", e.target.value)}
            placeholder="Mặc định: Những tấm thẻ ghi dọc đường — ghim lại trên bảng..."
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            2. Danh sách các thẻ kỷ niệm ({moments.length})
          </h4>
          <button
            type="button"
            onClick={addMoment}
            className="inline-flex items-center gap-1 rounded bg-zinc-800 px-2.5 py-1 text-xs font-medium text-sky-400 hover:bg-zinc-700"
          >
            <Plus className="h-3.5 w-3.5" /> Thêm thẻ kỷ niệm
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {moments.map((moment, idx) => (
            <div
              key={idx}
              className="relative rounded-lg border border-zinc-800 bg-zinc-900/60 p-3.5 transition-all"
            >
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-3">
                <span className="font-mono text-xs font-bold text-sky-400">
                  Thẻ #{idx + 1}
                </span>
                {moments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMoment(idx)}
                    className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Xóa
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-3">
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Năm (Year)</label>
                  <input
                    type="text"
                    value={moment.year}
                    onChange={(e) => updateMoment(idx, { ...moment, year: e.target.value })}
                    placeholder="2022"
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs text-zinc-400">Tiêu đề (Title)</label>
                  <input
                    type="text"
                    value={moment.title}
                    onChange={(e) => updateMoment(idx, { ...moment, title: e.target.value })}
                    placeholder="Tiêu đề kỷ niệm"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="mb-1 block text-xs text-zinc-400">Nội dung (Description)</label>
                <textarea
                  rows={2}
                  value={moment.body}
                  onChange={(e) => updateMoment(idx, { ...moment, body: e.target.value })}
                  placeholder="Mô tả kỷ niệm..."
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Màu nhấn (Riso Color)</label>
                  <select
                    value={moment.color || "tomato"}
                    onChange={(e) =>
                      updateMoment(idx, {
                        ...moment,
                        color: e.target.value as CustomMoment["color"],
                      })
                    }
                    className={inputClass}
                  >
                    <option value="tomato">Tomato (Đỏ cam)</option>
                    <option value="blue">Blue (Xanh dương)</option>
                    <option value="jade">Jade (Xanh ngọc)</option>
                    <option value="canary">Canary (Vàng)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <ImageUploader
                    label="Ảnh thẻ kỷ niệm"
                    value={moment.image}
                    onChange={(url) => updateMoment(idx, { ...moment, image: url })}
                    helperText="Tải ảnh lên Vercel Blob cho thẻ này"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
