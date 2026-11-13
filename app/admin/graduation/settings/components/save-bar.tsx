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
