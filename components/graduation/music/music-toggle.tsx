import { RisoIconButton } from "@/components/ui/riso/icon-button";
import { useCopy } from "../i18n/lang-context";

type Props = { playing: boolean; onClick: () => void; volume: number; onVolume: (volume: number) => void };

/**
 * The music button; on mouse pointers, hovering it (or tabbing into it) drops a volume slider below.
 * The slider's wrapper pads the gap under the button so the pointer can travel down without losing hover.
 */
export function MusicToggle({ playing, onClick, volume, onVolume }: Props) {
  const { header } = useCopy();
  const percent = Math.round(volume * 100);
  return (
    <div className="group relative">
      <RisoIconButton size="md" fill={playing ? "canary" : "paper"} label={header.music} isPlaying={playing} aria-pressed={playing} onClick={onClick}>
        ♪
      </RisoIconButton>
      <div className="invisible absolute top-full right-0 hidden pt-3 opacity-0 transition-[opacity,visibility] duration-(--dur-fast) group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100 pointer-fine:block">
        <label className="flex items-center gap-3 rounded-full border-[1.5px] border-ink bg-paper py-2 pr-3.5 pl-4 shadow-(--offset-xs)">
          <span className="font-mono text-[10px] tracking-[0.22em] whitespace-nowrap text-ink-2 uppercase">{header.volume}</span>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={percent}
            aria-valuetext={`${percent}%`}
            onChange={(e) => onVolume(Number(e.currentTarget.value) / 100)}
            className="riso-focus w-28 cursor-pointer accent-(--tomato)"
          />
          <span className="w-8 text-right font-mono text-[10px] text-ink tabular-nums">{percent}%</span>
        </label>
      </div>
    </div>
  );
}
