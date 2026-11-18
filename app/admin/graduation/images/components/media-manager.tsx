"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
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
  CheckCircle2,
  AlertTriangle,
  Layers,
  UserCheck,
  Filter,
} from "lucide-react";
import { formatBytes } from "@/lib/blob/manage";
import type { EnrichedStoredBlobItem } from "@/lib/graduation/image-usage";

export function MediaManager() {
  const [images, setImages] = useState<EnrichedStoredBlobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [usageFilter, setUsageFilter] = useState<"all" | "used" | "unused">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "size-desc" | "size-asc">("newest");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [deletingPathname, setDeletingPathname] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<EnrichedStoredBlobItem | null>(null);
  const [previewImage, setPreviewImage] = useState<EnrichedStoredBlobItem | null>(null);
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

  const usedCount = useMemo(() => {
    return images.filter((img) => img.usageCount > 0).length;
  }, [images]);

  const unusedCount = useMemo(() => {
    return images.filter((img) => img.usageCount === 0).length;
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

  const handleDelete = async (item: EnrichedStoredBlobItem) => {
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

    // Filter by usage status
    if (usageFilter === "used") {
      result = result.filter((img) => img.usageCount > 0);
    } else if (usageFilter === "unused") {
      result = result.filter((img) => img.usageCount === 0);
    }

    // Search by file name, pathname, or guest name / section
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((img) => {
        const matchFile =
          img.filename.toLowerCase().includes(q) ||
          img.pathname.toLowerCase().includes(q);
        const matchUsage = img.usages?.some(
          (u) =>
            u.guestName?.toLowerCase().includes(q) ||
            u.section.toLowerCase().includes(q)
        );
        return matchFile || matchUsage;
      });
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
  }, [images, search, usageFilter, sortBy]);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-400">Đang được sử dụng</p>
            <p className="text-2xl font-bold text-emerald-400">
              {usedCount} <span className="text-xs font-normal text-zinc-500">ảnh</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-400">Chưa sử dụng (rác)</p>
            <p className="text-2xl font-bold text-amber-400">
              {unusedCount} <span className="text-xs font-normal text-zinc-500">ảnh</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <HardDrive className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-400">Dung lượng sử dụng</p>
            <p className="text-2xl font-bold text-zinc-100">{formatBytes(totalSize)}</p>
          </div>
        </div>
      </div>

      {/* Main Action Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2 max-w-xl">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Tìm theo tên file, tên khách mời, vị trí..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/90 pl-9 pr-8 py-2 text-xs text-zinc-200 placeholder:text-zinc-500 outline-none focus:border-sky-500"
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

          {/* Usage Filter */}
          <div className="relative">
            <select
              value={usageFilter}
              onChange={(e) => setUsageFilter(e.target.value as typeof usageFilter)}
              className="rounded-lg border border-zinc-700 bg-zinc-800/90 px-3 py-2 text-xs text-zinc-300 outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="all">Tất cả ảnh ({images.length})</option>
              <option value="used">Đang dùng ({usedCount})</option>
              <option value="unused">Chưa dùng ({unusedCount})</option>
            </select>
          </div>

          {/* Sort selector */}
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
            <span className="text-xs">Đang tải danh sách ảnh từ Vercel Blob và phân tích vị trí sử dụng...</span>
          </div>
        ) : processedImages.length === 0 ? (
          <div className="flex h-72 flex-col items-center justify-center gap-3 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-zinc-800 text-zinc-500">
              <ImageIcon className="h-7 w-7" />
            </div>
            <p className="text-base font-semibold text-zinc-200">
              {search || usageFilter !== "all" ? "Không tìm thấy ảnh nào khớp điều kiện" : "Chưa có ảnh nào trong thư viện"}
            </p>
            <p className="text-xs text-zinc-400 max-w-sm">
              {search || usageFilter !== "all"
                ? "Hãy thử thay đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc sử dụng."
                : "Bấm nút 'Tải ảnh lên (Upload)' ở góc trên để bắt đầu tải ảnh kỷ niệm hoặc ảnh bìa lên Vercel Blob."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
            {processedImages.map((img) => {
              const isDeleting = deletingPathname === img.pathname;
              const isCopied = copiedUrl === img.url;
              const isUsed = img.usageCount > 0;

              return (
                <div
                  key={img.pathname}
                  className={`group relative flex flex-col overflow-hidden rounded-xl border bg-zinc-900 transition-all hover:shadow-lg ${
                    isUsed ? "border-zinc-800 hover:border-emerald-500/50" : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  {/* Thumbnail Box */}
                  <div
                    onClick={() => setPreviewImage(img)}
                    className="relative aspect-4/3 w-full cursor-pointer overflow-hidden bg-zinc-950"
                  >
                    {/* Usage Status Badge */}
                    <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold shadow-md backdrop-blur-md">
                      {isUsed ? (
                        <div className="flex items-center gap-1 text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 rounded px-1.5 py-0.5">
                          <UserCheck className="h-3 w-3 shrink-0" />
                          <span>Đang dùng ({img.usageCount})</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-zinc-400 bg-zinc-900/80 border border-zinc-750 rounded px-1.5 py-0.5 text-[10px]">
                          <span>Chưa dùng</span>
                        </div>
                      )}
                    </div>

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.filename}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Overlay Action Buttons */}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-20">
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

                  {/* Metadata Info & Usage Details */}
                  <div className="flex flex-1 flex-col p-3">
                    <p
                      className="truncate text-xs font-semibold text-zinc-200"
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
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Image Usage List */}
                    {isUsed ? (
                      <div className="mt-2.5 flex flex-col gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-2 text-[11px]">
                        <div className="flex items-center justify-between font-semibold text-emerald-400">
                          <span className="flex items-center gap-1">
                            <Layers className="h-3 w-3" />
                            Vị trí sử dụng:
                          </span>
                          <span className="text-[10px] text-emerald-500">{img.usageCount} nơi</span>
                        </div>
                        <div className="flex flex-col gap-1 max-h-24 overflow-y-auto pr-0.5">
                          {img.usages.map((u, i) => (
                            <div
                              key={i}
                              className="flex flex-col border-t border-emerald-900/40 pt-1 first:border-0 first:pt-0"
                            >
                              {u.type === "guest" ? (
                                <div className="flex items-center justify-between gap-1 text-[11px]">
                                  <Link
                                    href="/admin/graduation/guest"
                                    className="font-medium text-sky-300 hover:underline truncate max-w-[120px]"
                                    title={u.guestName}
                                  >
                                    👤 {u.guestName}
                                  </Link>
                                  <span className="text-[10px] text-zinc-400 shrink-0 truncate max-w-[110px]" title={u.section}>
                                    {u.section}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between gap-1 text-[11px]">
                                  <Link
                                    href="/admin/graduation/settings"
                                    className="font-medium text-amber-300 hover:underline truncate"
                                  >
                                    ⚙️ Cài đặt chung
                                  </Link>
                                  <span className="text-[10px] text-zinc-400 shrink-0 truncate max-w-[110px]" title={u.section}>
                                    {u.section.replace("Cài đặt chung: ", "")}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2.5 rounded-lg border border-zinc-800 bg-zinc-950/40 px-2 py-1.5 text-[11px] text-zinc-500 flex items-center justify-between">
                        <span>Chưa gán vào thiệp nào</span>
                        <span className="text-[10px] text-emerald-500/80">Có thể xóa an toàn</span>
                      </div>
                    )}

                    {/* Bottom Action Buttons */}
                    <div className="mt-3 flex items-center gap-1.5 border-t border-zinc-800/80 pt-2.5">
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
          <div className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl">
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

            {/* Detailed Usage Warning */}
            {confirmDelete.usageCount > 0 ? (
              <div className="mb-4 rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-red-300 mb-1.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>CẢNH BÁO: Ảnh này đang được sử dụng ở {confirmDelete.usageCount} vị trí:</span>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1 text-zinc-200 pl-1 pr-1">
                  {confirmDelete.usages.map((u, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] bg-red-950/60 rounded px-2 py-1 border border-red-900/40">
                      <span className="font-semibold text-white">{u.guestName || "Cài đặt chung"}</span>
                      <span className="text-red-300">{u.section}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-red-300 font-medium">
                  Nếu xóa, thiệp của các khách mời trên sẽ bị lỗi mất ảnh hiển thị!
                </p>
              </div>
            ) : (
              <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-2.5 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Ảnh này chưa được gán vào bất kỳ thiệp nào. Xóa hoàn toàn an toàn.</span>
              </div>
            )}

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

            <div className="relative flex items-center justify-center p-3 bg-zinc-950 overflow-auto max-h-[65vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImage.url}
                alt={previewImage.filename}
                className="max-h-[60vh] w-auto max-w-full object-contain rounded"
              />
            </div>

            {/* Usages Bar in Preview Modal */}
            {previewImage.usageCount > 0 ? (
              <div className="border-t border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs">
                <p className="font-semibold text-emerald-400 mb-1.5 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" />
                  Đang được sử dụng trong {previewImage.usageCount} vị trí:
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {previewImage.usages.map((u, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-[11px] text-zinc-300"
                    >
                      <span className="font-semibold text-sky-300">{u.guestName || "Cài đặt chung"}</span>
                      <span className="text-zinc-500">·</span>
                      <span className="text-zinc-400">{u.section}</span>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border-t border-zinc-800 bg-zinc-950 px-4 py-2 text-xs text-zinc-500">
                Chưa được gán vào khách mời hay cài đặt nào.
              </div>
            )}

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
