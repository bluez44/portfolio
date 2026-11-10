"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  helperText?: string;
}

export function ImageUploader({
  label,
  value,
  onChange,
  helperText = "Tải ảnh từ máy tính lên Vercel Blob hoặc dán URL",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/graduation/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Tải ảnh lên thất bại");
      }

      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tải ảnh thất bại");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClear = () => {
    onChange("");
    setError(null);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-zinc-300">{label}</span>
      
      {value ? (
        <div className="relative flex items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-900/80 p-2">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded border border-zinc-700 bg-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Preview" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-mono text-zinc-300" title={value}>
              {value}
            </p>
            <p className="text-[11px] text-emerald-400">✓ Đã tải ảnh lên</p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-red-400"
            title="Xoá ảnh"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-4 transition-colors ${
              uploading
                ? "border-zinc-600 bg-zinc-900/50"
                : "border-zinc-700 bg-zinc-900 hover:border-zinc-500 hover:bg-zinc-850"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />

            {uploading ? (
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
                <span>Đang tải lên Vercel Blob...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 text-center">
                <Upload className="h-5 w-5 text-zinc-400" />
                <span className="text-xs font-medium text-zinc-300">
                  Chọn file từ máy tính
                </span>
                <span className="text-[11px] text-zinc-500">PNG, JPG, WEBP tối đa 5MB</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-500">hoặc dán URL:</span>
            <input
              type="text"
              placeholder="https://..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 outline-none focus:border-zinc-600"
            />
          </div>
        </div>
      )}

      {error && <span className="text-xs text-red-400">{error}</span>}
      {helperText && !error && <span className="text-[11px] text-zinc-500">{helperText}</span>}
    </div>
  );
}
