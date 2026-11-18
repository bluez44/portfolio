"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  X,
  Search,
  Upload,
  Loader2,
  Trash2,
  Check,
  RefreshCw,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import type { StoredBlobItem } from "@/lib/blob/manage";
import { formatBytes } from "@/lib/blob/manage";

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentValue?: string;
}

export function ImagePickerModal({
  isOpen,
  onClose,
  onSelect,
  currentValue,
}: ImagePickerModalProps) {
  const [images, setImages] = useState<StoredBlobItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [deletingPathname, setDeletingPathname] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<StoredBlobItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/graduation/images");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể tải danh sách ảnh");
      }
      setImages(data.images || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    let ignore = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/graduation/images");
        const data = await res.json();
        if (!ignore && res.ok) {
          setImages(data.images || []);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !deletingPathname && !uploading) {
        if (confirmDelete) {
          setConfirmDelete(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, confirmDelete, deletingPathname, uploading, onClose]);

  const handleUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    const total = files.length;
    let lastUploadedUrl = "";

    try {
      for (let i = 0; i < total; i++) {
        const file = files[i];
        setUploadProgress(`Đang tải lên ${i + 1}/${total}: ${file.name}...`);

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/graduation/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `Tải file ${file.name} thất bại`);
        }

        lastUploadedUrl = data.url;
      }

      await fetchImages();

      // If user uploaded exactly one file, automatically select it!
      if (total === 1 && lastUploadedUrl) {
        onSelect(lastUploadedUrl);
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tải ảnh thất bại");
    } finally {
      setUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (item: StoredBlobItem) => {
    setDeletingPathname(item.pathname);
    setError(null);
    try {
      const res = await fetch("/api/admin/graduation/images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pathname: item.pathname, rawUrl: item.rawUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Xóa ảnh thất bại");
      }
      setImages((prev) => prev.filter((img) => img.pathname !== item.pathname));
      setConfirmDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xóa ảnh thất bại");
    } finally {
      setDeletingPathname(null);
    }
  };

  const filteredImages = useMemo(() => {
    if (!search.trim()) return images;
    const q = search.toLowerCase();
    return images.filter(
      (img) =>
        img.filename.toLowerCase().includes(q) ||
        img.pathname.toLowerCase().includes(q)
    );
  }, [images, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <ImageIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">
                Thư viện ảnh đã tải lên
              </h3>
              <p className="text-xs text-zinc-400">
                Chọn ảnh có sẵn hoặc tải ảnh mới từ máy tính ({images.length} ảnh)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-900/50 px-5 py-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên file..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/80 pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 outline-none focus:border-sky-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchImages}
              disabled={loading || uploading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-750 hover:text-zinc-100 transition-colors disabled:opacity-50"
              title="Làm mới danh sách"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-500 transition-colors shadow-sm disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>{uploadProgress || "Đang tải lên..."}</span>
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  <span>Tải ảnh mới</span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleUploadFiles}
              disabled={uploading}
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-5 mt-3 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Image Grid Content */}
        <div className="flex-1 overflow-y-auto p-5 min-h-[300px]">
          {loading && images.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-zinc-400">
              <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
              <span className="text-xs">Đang tải danh sách ảnh từ Vercel Blob...</span>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-zinc-800 text-zinc-500">
                <ImageIcon className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-zinc-300">
                {search ? "Không tìm thấy ảnh nào phù hợp" : "Chưa có ảnh nào trong thư viện"}
              </p>
              <p className="text-xs text-zinc-500 max-w-sm">
                {search
                  ? `Không có ảnh nào chứa từ khóa "${search}". Thử từ khóa khác.`
                  : "Bấm 'Tải ảnh mới' ở góc trên để tải ảnh lên Vercel Blob."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4">
              {filteredImages.map((img) => {
                const isSelected = currentValue === img.url;
                const isDeleting = deletingPathname === img.pathname;

                return (
                  <div
                    key={img.pathname}
                    onClick={() => {
                      onSelect(img.url);
                      onClose();
                    }}
                    className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border bg-zinc-850 transition-all ${
                      isSelected
                        ? "border-sky-500 ring-2 ring-sky-500/40"
                        : "border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800"
                    }`}
                  >
                    {/* Image Preview Box */}
                    <div className="relative aspect-4/3 w-full overflow-hidden bg-zinc-950">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.filename}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Selected checkmark badge */}
                      {isSelected && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 rounded bg-sky-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-md">
                          <Check className="h-3 w-3 stroke-[3]" />
                          <span>Đang dùng</span>
                        </div>
                      )}

                      {/* Delete button (hover overlay) */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete(img);
                          }}
                          disabled={isDeleting}
                          className="grid h-7 w-7 place-items-center rounded bg-black/70 text-zinc-400 hover:bg-red-600 hover:text-white transition-colors"
                          title="Xóa ảnh này"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="p-2.5">
                      <p
                        className="truncate text-xs font-medium text-zinc-200 group-hover:text-sky-300 transition-colors"
                        title={img.filename}
                      >
                        {img.filename}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-500">
                        <span>{formatBytes(img.size)}</span>
                        <span>
                          {new Date(img.uploadedAt).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-900 px-5 py-3 text-xs text-zinc-400">
          <span>
            {filteredImages.length === images.length
              ? `Tổng số ${images.length} ảnh`
              : `Hiển thị ${filteredImages.length}/${images.length} ảnh`}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-1.5 font-medium text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors"
          >
            Đóng
          </button>
        </div>

        {/* Confirm Delete Sub-Dialog */}
        {confirmDelete && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl">
              <div className="flex items-center gap-3 text-red-400 mb-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-red-500/10 border border-red-500/20">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-100">Xác nhận xóa ảnh</h4>
                  <p className="text-xs text-zinc-400">Hành động này không thể hoàn tác</p>
                </div>
              </div>

              <div className="mb-4 rounded-lg border border-zinc-800 bg-zinc-850 p-2.5 flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-zinc-900 border border-zinc-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={confirmDelete.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 text-xs">
                  <p className="truncate font-medium text-zinc-200">
                    {confirmDelete.filename}
                  </p>
                  <p className="text-zinc-500 mt-0.5">{formatBytes(confirmDelete.size)}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(null)}
                  disabled={Boolean(deletingPathname)}
                  className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-750"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(confirmDelete)}
                  disabled={Boolean(deletingPathname)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500"
                >
                  {deletingPathname ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Đang xóa...</span>
                    </>
                  ) : (
                    <span>Xác nhận xóa</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
