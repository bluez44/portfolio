"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Edit3, Trash2, Sparkles, Mail, Calendar, Music } from "lucide-react";
import { summarizeGuestContent } from "@/lib/graduation/content/guest-content-summary";
import type { GuestPlaceholders } from "@/lib/graduation/content/guest-placeholders";
import type { GuestListItem } from "@/lib/graduation/types";
import { CopyGuestLinkButton } from "./copy-guest-link-button";
import { GuestEditorDialog } from "./guest-editor-dialog";
import { deleteGraduationGuestAction } from "../actions";

interface GuestTableProps {
  guests: GuestListItem[];
  placeholders: GuestPlaceholders;
}

const RSVP_BADGE = {
  yes: {
    label: "Sẽ đến",
    class: "bg-emerald-950/80 text-emerald-400 border-emerald-800",
  },
  no: {
    label: "Không đến",
    class: "bg-red-950/80 text-red-400 border-red-800",
  },
} as const;

export function GuestTable({ guests, placeholders }: GuestTableProps) {
  const [editingGuest, setEditingGuest] = useState<GuestListItem | null>(null);

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-zinc-800 bg-zinc-900/60 font-semibold uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="px-4 py-3">Khách mời</th>
              <th className="px-4 py-3">Guest ID (UUID) & Slug</th>
              <th className="px-4 py-3">Trạng thái RSVP</th>
              <th className="px-4 py-3">Lời chúc</th>
              <th className="px-4 py-3">Custom Content</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
            {guests.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-zinc-500">
                  Chưa có khách mời nào. Nhấn &ldquo;Thêm khách mời mới&rdquo; để bắt đầu.
                </td>
              </tr>
            ) : (
              guests.map((guest) => {
                const rsvp = guest.rsvpStatus ? RSVP_BADGE[guest.rsvpStatus] : null;
                const summary = summarizeGuestContent(guest.customContent);

                return (
                  <tr key={guest.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-white">{guest.name}</div>
                      {guest.note && (
                        <p className="mt-0.5 line-clamp-1 max-w-[200px] text-[11px] text-zinc-400" title={guest.note}>
                          {guest.note}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 font-mono text-[11px] text-zinc-400">
                        <span title={guest.id}>{guest.id.slice(0, 13)}...</span>
                        <CopyGuestLinkButton guestId={guest.id} variant="icon" />
                      </div>
                      <code className="text-[11px] text-zinc-500">{guest.slug}</code>
                    </td>

                    <td className="px-4 py-3.5">
                      {rsvp ? (
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${rsvp.class}`}
                          >
                            {rsvp.label}
                          </span>
                          {guest.rsvpUpdatedAt && (
                            <span className="text-[10px] text-zinc-500">
                              {new Date(guest.rsvpUpdatedAt).toLocaleString("vi-VN", {
                                timeZone: "Asia/Ho_Chi_Minh",
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "2-digit",
                              })}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-500 italic">Chưa phản hồi</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 max-w-[220px]">
                      {guest.rsvpWish ? (
                        <div
                          className="line-clamp-2 text-[11px] italic text-zinc-300 break-words"
                          title={guest.rsvpWish}
                        >
                          &ldquo;{guest.rsvpWish}&rdquo;
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-600">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {summary.envelope && (
                          <span
                            className="inline-flex items-center gap-1 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-amber-400"
                            title="Có tùy chỉnh phong bì / bìa thiệp"
                          >
                            <Mail className="h-3 w-3" /> Bìa
                          </span>
                        )}
                        {summary.met && (
                          <span
                            className="inline-flex items-center gap-1 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-sky-400"
                            title="Có tùy chỉnh hành trình kỷ niệm"
                          >
                            <Sparkles className="h-3 w-3" />
                            {summary.moments ? `${summary.moments} thẻ` : "Kỷ niệm"}
                          </span>
                        )}
                        {summary.ends && (
                          <span
                            className="inline-flex items-center gap-1 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-emerald-400"
                            title="Có tùy chỉnh thông tin buổi lễ / lưu ý"
                          >
                            <Calendar className="h-3 w-3" /> Buổi lễ
                          </span>
                        )}
                        {summary.music && (
                          <span
                            className="inline-flex items-center gap-1 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-purple-400"
                            title="Có nhạc nền tùy chỉnh"
                          >
                            <Music className="h-3 w-3" /> Nhạc
                          </span>
                        )}
                        {!summary.envelope && !summary.met && !summary.ends && !summary.music && (
                          <span className="text-[11px] text-zinc-600">—</span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <CopyGuestLinkButton guestId={guest.id} />

                        <Link
                          href={`/graduation/${guest.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                          title="Xem thiệp mời trong tab mới"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => setEditingGuest(guest)}
                          className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-sky-300"
                          title="Chỉnh sửa thông tin & custom"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>

                        <form
                          action={deleteGraduationGuestAction}
                          onSubmit={(e) => {
                            if (!confirm(`Bạn có chắc chắn muốn xóa khách mời "${guest.name}"?`)) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <input type="hidden" name="id" value={guest.id} />
                          <button
                            type="submit"
                            className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-red-400"
                            title="Xóa khách mời"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {editingGuest && (
        <GuestEditorDialog
          guest={editingGuest}
          placeholders={placeholders}
          isOpen={true}
          onClose={() => setEditingGuest(null)}
        />
      )}
    </>
  );
}
