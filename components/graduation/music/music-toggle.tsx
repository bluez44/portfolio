import { RisoIconButton } from "@/components/ui/riso/icon-button";
import { useCopy } from "../i18n/lang-context";

export function MusicToggle({ playing, onClick }: { playing: boolean; onClick: () => void }) {
  const { header } = useCopy();
  return (
    <RisoIconButton size="md" fill={playing ? "canary" : "paper"} label={header.music} isPlaying={playing} aria-pressed={playing} onClick={onClick}>
      ♪
    </RisoIconButton>
  );
}
