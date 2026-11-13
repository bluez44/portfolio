"use client";

import { useEffect, useState, useTransition } from "react";
import { X, User, Mail, Sparkles, Calendar, MailCheck, Music, Save, Loader2 } from "lucide-react";
import type { GuestPlaceholders } from "@/lib/graduation/content/guest-placeholders";
import type { GuestContent } from "@/lib/graduation/content/settings-types";
import type { GuestListItem } from "@/lib/graduation/types";
import { useScrollLock } from "@/lib/hooks/use-scroll-lock";
import { saveGraduationGuestAction, type GuestActionState } from "../actions";
import { BasicInfoTab } from "./tabs/basic-info-tab";
import { EnvelopeTab } from "./tabs/envelope-tab";
import { MomentsTab } from "./tabs/moments-tab";
import { EndsTab } from "./tabs/ends-tab";
import { RsvpTab } from "./tabs/rsvp-tab";
import { MusicTab } from "./tabs/music-tab";

interface GuestEditorDialogProps {
  guest?: GuestListItem | null;
  placeholders: GuestPlaceholders;
  isOpen: boolean;
  onClose: () => void;
}

type TabKey = "basic" | "envelope" | "met" | "ends" | "rsvp" | "music";

export function GuestEditorDialog({
  guest,
  placeholders,
  isOpen,
  onClose,
}: GuestEditorDialogProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("basic");
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<GuestActionState>(null);

  // Form states
  const [name, setName] = useState(guest?.name || "");
  const [slug, setSlug] = useState(guest?.slug || "");
  const [note, setNote] = useState(guest?.note || "");
  const [customContent, setCustomContent] = useState<GuestContent>(guest?.customContent ?? {});

  useScrollLock(isOpen);
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    if (guest?.id) formData.append("id", guest.id);
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("note", note);
    formData.append("customContent", JSON.stringify(customContent));

    startTransition(async () => {
      const res = await saveGraduationGuestAction(null, formData);
      setState(res);
      if (res?.ok) {
        onClose();
      }
    });
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "basic", label: "Cơ bản", icon: <User className="h-4 w-4" /> },
    { key: "envelope", label: "Bìa & Thiệp", icon: <Mail className="h-4 w-4" /> },
    { key: "met", label: "Hành trình & Kỷ niệm", icon: <Sparkles className="h-4 w-4" /> },
    { key: "ends", label: "Buổi lễ & Vé", icon: <Calendar className="h-4 w-4" /> },
    { key: "rsvp", label: "RSVP", icon: <MailCheck className="h-4 w-4" /> },
    { key: "music", label: "Nhạc nền", icon: <Music className="h-4 w-4" /> },
  ];

  const fieldErrors = state && !state.ok ? state.fieldErrors : {};
  const globalError = state && !state.ok ? ("error" in state ? state.error : fieldErrors.customContent) ?? null : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-white">
              {guest ? `Chỉnh sửa: ${guest.name}` : "Thêm khách mời mới"}
            </h3>
            <p className="text-xs text-zinc-400">
              Tùy chỉnh riêng cho khách này, cả tiếng Việt và tiếng Anh. Ô để trống dùng Cài đặt chung (chữ mờ trong ô).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex shrink-0 overflow-x-auto border-b border-zinc-800 px-6 pt-2 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-sky-400 text-sky-400"
                    : "border-transparent text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Body content */}
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {globalError && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
              {globalError}
            </div>
          )}

          {activeTab === "basic" && (
            <BasicInfoTab
              name={name}
              setName={setName}
              slug={slug}
              setSlug={setSlug}
              note={note}
              setNote={setNote}
              errors={fieldErrors}
            />
          )}

          {activeTab === "envelope" && <EnvelopeTab content={customContent} placeholders={placeholders} onChange={setCustomContent} />}
          {activeTab === "met" && <MomentsTab content={customContent} placeholders={placeholders} onChange={setCustomContent} />}
          {activeTab === "ends" && <EndsTab content={customContent} placeholders={placeholders} onChange={setCustomContent} />}
          {activeTab === "rsvp" && <RsvpTab content={customContent} placeholders={placeholders} onChange={setCustomContent} />}
          {activeTab === "music" && (
            <MusicTab music={customContent.music ?? {}} onChange={(music) => setCustomContent({ ...customContent, music })} />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-zinc-800 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !name.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-5 py-2 text-xs font-semibold text-white hover:bg-sky-400 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Lưu khách mời
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
