"use client";

import Link from "next/link";
import { MusicToggle } from "../music/music-toggle";
import { CalendarIcon } from "../shared/calendar-icon";
import { useCopy } from "../i18n/lang-context";

export function InvitationHeader({
  musicPlaying,
  musicNote,
  onMusic,
  volume,
  onVolume,
}: {
  musicPlaying: boolean;
  musicNote: boolean;
  onMusic: () => void;
  volume: number;
  onVolume: (volume: number) => void;
}) {
  const t = useCopy();
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b-[1.5px] pt-[env(safe-area-inset-top)] border-ink bg-header-bg backdrop-blur-[14px] backdrop-saturate-[1.2] lite:backdrop-filter-none lite:bg-paper">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
        <Link href="/" className="riso-focus hit-area relative font-mono text-[11px] tracking-[0.22em] whitespace-nowrap text-ink-2 uppercase hover:text-tomato">
          ←<span className="max-sm:sr-only"> {t.header.back}</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3.5">
          <span className="hidden font-mono text-[11px] tracking-[0.28em] text-ink uppercase sm:inline">{t.header.title}</span>
          {musicNote && (
            <span role="status" className="absolute top-full right-6 mt-1 whitespace-nowrap font-mono text-[10px] tracking-[0.14em] text-tomato uppercase">
              {t.header.musicUnavailable}
            </span>
          )}
          <a
            href="#ends-ticket"
            className="riso-focus hit-area relative inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.22em] whitespace-nowrap text-ink-2 uppercase hover:text-tomato"
          >
            <CalendarIcon size={14} />
            <span className="max-sm:sr-only">{t.header.when}</span>
          </a>
          <MusicToggle playing={musicPlaying} onClick={onMusic} volume={volume} onVolume={onVolume} />
        </div>
      </div>
    </header>
  );
}
