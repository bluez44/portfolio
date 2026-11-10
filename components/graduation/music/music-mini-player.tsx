import type { RefObject } from "react";
import { useCopy } from "../i18n/lang-context";

/** Stays mounted once opened so the iframe keeps playing; hidden via `hidden` when closed. */
export function MusicMiniPlayer({
  open,
  mountRef,
  onClose,
}: {
  open: boolean;
  mountRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
}) {
  const { music: t } = useCopy();
  return (
    <div
      hidden={!open}
      className="fixed bottom-4 left-4 z-50 rounded-[14px] border-[1.5px] border-ink bg-paper p-2"
      style={{ boxShadow: "var(--offset-md)" }}
    >
      <div className="mb-1.5 flex items-center justify-between gap-3 px-1">
        <span className="font-mono text-[10px] tracking-[0.2em] text-ink-2 uppercase">{t.nowPlaying}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className="riso-focus cursor-pointer border-0 bg-transparent font-mono text-sm text-ink-2 hover:text-tomato"
        >
          ×
        </button>
      </div>
      <div className="h-50 w-50 overflow-hidden rounded-md border-[1.5px] border-ink">
        <div ref={mountRef} />
      </div>
    </div>
  );
}
