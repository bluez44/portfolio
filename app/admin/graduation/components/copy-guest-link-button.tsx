"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyGuestLinkButton({
  guestId,
  variant = "button",
}: {
  guestId: string;
  variant?: "button" | "icon";
}) {
  const [copied, setCopied] = useState(false);

  const copy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const origin =
        typeof window !== "undefined" && window.location.origin
          ? window.location.origin
          : "";
      const url = `${origin}/graduation/${guestId}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={copy}
        title="Sao chép link thiệp (UUID)"
        className="inline-flex items-center justify-center rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
        copied
          ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
          : "bg-zinc-800 text-sky-300 border border-zinc-700 hover:bg-zinc-700 hover:text-sky-200"
      }`}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Đã copy link!" : "Copy link"}
    </button>
  );
}
