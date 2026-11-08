import { RisoIconButton } from "@/components/ui/riso/icon-button";

export function MusicToggle({ playing, onClick }: { playing: boolean; onClick: () => void }) {
  return (
    <RisoIconButton size="md" fill={playing ? "canary" : "paper"} label="Nhạc nền · Music" aria-pressed={playing} onClick={onClick}>
      ♪
    </RisoIconButton>
  );
}
