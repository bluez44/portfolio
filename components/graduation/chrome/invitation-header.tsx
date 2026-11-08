"use client";

import Link from "next/link";
import { RisoThemeToggle } from "@/components/ui/riso/theme-toggle";
import { useIsDark } from "@/lib/hooks/use-is-dark";
import { MusicToggle } from "../music/music-toggle";

export function InvitationHeader({
  musicPlaying,
  musicNote,
  onMusic,
}: {
  musicPlaying: boolean;
  musicNote: boolean;
  onMusic: () => void;
}) {
  const { dark, toggle } = useIsDark();
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b-[1.5px] border-ink bg-header-bg backdrop-blur-[14px] backdrop-saturate-[1.2]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <Link href="/" className="riso-focus font-mono text-[11px] tracking-[0.22em] text-ink-2 uppercase hover:text-tomato">← Portfolio</Link>
        <div className="flex items-center gap-3.5">
          <span className="hidden font-mono text-[11px] tracking-[0.28em] text-ink uppercase sm:inline">Graduation 2026</span>
          {musicNote && (
            <span role="status" className="absolute top-full right-6 mt-1 whitespace-nowrap font-mono text-[10px] tracking-[0.14em] text-tomato uppercase">
              Không phát được nhạc · Music unavailable
            </span>
          )}
          <MusicToggle playing={musicPlaying} onClick={onMusic} />
          <RisoThemeToggle dark={dark} onToggle={toggle} />
        </div>
      </div>
    </header>
  );
}
