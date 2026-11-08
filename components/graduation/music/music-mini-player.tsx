import type { RefObject } from "react";

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
  return (
    <div
      hidden={!open}
      className="fixed bottom-4 left-4 z-50 rounded-[14px] border-[1.5px] border-ink bg-paper p-2"
      style={{ boxShadow: "var(--offset-md)" }}
    >
      <div className="mb-1.5 flex items-center justify-between gap-3 px-1">
        <span className="font-mono text-[10px] tracking-[0.2em] text-ink-2 uppercase">♪ Now playing</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tắt nhạc · Close music"
          className="riso-focus cursor-pointer border-0 bg-transparent font-mono text-sm text-ink-2 hover:text-tomato"
        >
          ×
        </button>
      </div>
      <div className="h-[200px] w-[200px] overflow-hidden rounded-md border-[1.5px] border-ink">
        <div ref={mountRef} />
      </div>
    </div>
  );
}
