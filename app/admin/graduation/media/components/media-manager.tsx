"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Upload,
  Search,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Image as ImageIcon,
  HardDrive,
  Calendar,
  AlertCircle,
  Loader2,
  X,
  FileImage,
} from "lucide-react";
import type { StoredBlobItem } from "@/lib/blob/manage";
import { formatBytes } from "@/lib/blob/manage";

export function MediaManager() {
  const [images, setImages] = useState<StoredBlobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "size-desc" | "size-asc">("newest");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [deletingPathname, setDeletingPathname] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<StoredBlobItem | null>(null);
  const [previewImage, setPreviewImage] = useState<StoredBlobItem | null>(null);
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
  }, []);

  const totalSize = useMemo(() => {
    return images.reduce((acc, img) => acc + (img.size || 0), 0);
  }, [images]);

  const handleUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    const total = files.length;

    try {
      for (let i = 0; i < total; i++) {
        const file = files[i];
        setUploadProgress(`Đang tải lên (${i + 1}/${total}): ${file.name}...`);

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
      }

      await fetchImages();
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
      if (previewImage?.pathname === item.pathname) {
        setPreviewImage(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xóa ảnh thất bại");
    } finally {
      setDeletingPathname(null);
    }
  };

  const handleCopyUrl = (url: string) => {
    const fullUrl = url.startsWith("/") ? `${window.location.origin}${url}` : url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(url);
    setTimeout(() => {
      setCopiedUrl(null);
    }, 2000);
  };

  const processedImages = useMemo(() => {
    let result = [...images];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (img) =>
          img.filename.toLowerCase().includes(q) ||
          img.pathname.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      }
      if (sortBy === "size-desc") {
        return b.size - a.size;
      }
      if (sortBy === "size-asc") {
        return a.size - b.size;
      }
      return 0;
    });

    return result;
  }, [images, search, sortBy]);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <FileImage className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-400">Tổng số ảnh đã tải</p>
            <p className="text-2xl font-bold text-zinc-100">{images.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <HardDrive className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-400">Dung lượng sử dụng</p>
            <p className="text-2xl font-bold text-zinc-100">{formatBytes(totalSize)}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 sm:col-span-2 lg:col-span-1">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-400">Mới cập nhật gần nhất</p>
            <p className="text-sm font-semibold text-zinc-100 truncate">
              {images[0]
                ? new Date(images[0].uploadedAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Chưa có ảnh"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Action Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Tìm kiếm ảnh theo tên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/90 pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-500 outline-none focus:border-sky-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-lg border border-zinc-700 bg-zinc-800/90 px-3 py-2 text-xs text-zinc-300 outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="size-desc">Dung lượng lớn nhất</option>
              <option value="size-asc">Dung lượng nhỏ nhất</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchImages}
            disabled={loading || uploading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-750 hover:text-zinc-100 transition-colors disabled:opacity-50"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-500 transition-colors shadow-sm disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{uploadProgress || "Đang tải ảnh lên..."}</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Tải ảnh lên (Upload)</span>
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

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Gallery Grid */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 min-h-[400px]">
        {loading && images.length === 0 ? (
          <div className="flex h-72 flex-col items-center justify-center gap-3 text-zinc-400">
            <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
            <span className="text-xs">Đang tải danh sách ảnh từ Vercel Blob...</span>
          </div>
        ) : processedImages.length === 0 ? (
          <div className="flex h-72 flex-col items-center justify-center gap-3 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-zinc-800 text-zinc-500">
              <ImageIcon className="h-7 w-7" />
            </div>
            <p className="text-base font-semibold text-zinc-200">
              {search ? "Không tìm thấy ảnh nào khớp" : "Chưa có ảnh nào trong thư viện"}
            </p>
            <p className="text-xs text-zinc-400 max-w-sm">
              {search
                ? `Không có ảnh nào chứa từ khóa "${search}". Hãy thử tìm từ khóa khác.`
                : "Bấm nút 'Tải ảnh lên (Upload)' ở góc trên để bắt đầu tải ảnh kỷ niệm hoặc ảnh bìa lên Vercel Blob."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {processedImages.map((img) => {
              const isDeleting = deletingPathname === img.pathname;
              const isCopied = copiedUrl === img.url;

              return (
                <div
                  key={img.pathname}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition-all hover:border-zinc-700 hover:shadow-lg"
                >
                  {/* Thumbnail Box */}
                  <div
                    onClick={() => setPreviewImage(img)}
                    className="relative aspect-4/3 w-full cursor-pointer overflow-hidden bg-zinc-950"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.filename}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Overlay Action Buttons */}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyUrl(img.url);
                        }}
                        className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-800/90 text-zinc-200 hover:bg-sky-600 hover:text-white transition-colors"
                        title="Sao chép URL"
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>

                      <a
                        href={img.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-800/90 text-zinc-200 hover:bg-sky-600 hover:text-white transition-colors"
                        title="Mở ảnh gốc trong tab mới"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDelete(img);
                        }}
                        disabled={isDeleting}
                        className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-800/90 text-zinc-200 hover:bg-red-600 hover:text-white transition-colors"
                        title="Xóa ảnh này"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Metadata Info */}
                  <div className="flex flex-col p-3">
                    <p
                      className="truncate text-xs font-semibold text-zinc-200"
                      title={img.filename}
                    >
                      {img.filename}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-zinc-500">
                      <span>{formatBytes(img.size)}</span>
                      <span>
                        {new Date(img.uploadedAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center gap-1.5 border-t border-zinc-800/80 pt-2">
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(img.url)}
                        className="flex flex-1 items-center justify-center gap-1 rounded bg-zinc-800 px-2 py-1 text-[11px] text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-400">Đã chép link</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Chép link</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(img)}
                        className="rounded bg-zinc-800 p-1 text-zinc-400 hover:bg-red-900/40 hover:text-red-400 transition-colors"
                        title="Xóa ảnh"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-red-500/10 border border-red-500/20">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-100">Xác nhận xóa ảnh</h4>
                <p className="text-xs text-zinc-400">Ảnh sẽ bị xóa vĩnh viễn khỏi Vercel Blob</p>
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

            <p className="text-xs text-amber-400/90 mb-4 bg-amber-500/10 border border-amber-500/20 rounded-md p-2">
              Lưu ý: Nếu có thiệp hoặc kỷ niệm nào đang sử dụng ảnh này, ảnh đó sẽ không hiển thị được nữa.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                disabled={Boolean(deletingPathname)}
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-750"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDelete)}
                disabled={Boolean(deletingPathname)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-red-500 transition-colors"
              >
                {deletingPathname ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <span>Xóa ảnh vĩnh viễn</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-size Image Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col max-w-4xl max-h-[90vh] overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
              <p className="truncate text-xs font-medium text-zinc-200 max-w-md">
                {previewImage.filename}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyUrl(previewImage.url)}
                  className="inline-flex items-center gap-1 rounded bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                >
                  {copiedUrl === previewImage.url ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Đã chép link</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Chép link</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="relative flex items-center justify-center p-3 bg-zinc-950 overflow-auto max-h-[75vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImage.url}
                alt={previewImage.filename}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded"
              />
            </div>

            <div className="flex items-center justify-between border-t border-zinc-800 px-4 py-2 text-xs text-zinc-400 bg-zinc-900">
              <span>{formatBytes(previewImage.size)}</span>
              <span>
                Tải lên:{" "}
                {new Date(previewImage.uploadedAt).toLocaleString("vi-VN")}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
