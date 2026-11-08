import { RisoPill } from "@/components/ui/riso/pill";
import type { RsvpStatus } from "@/lib/graduation/types";

const MESSAGE: Record<RsvpStatus, string> = {
  yes: "✓ Postmarked — hẹn gặp bạn ngày 19.12!",
  no: "✓ Đã nhận — cảm ơn bạn đã báo · Noted, thank you",
};

export function RsvpResult({ status, onReset }: { status: RsvpStatus; onReset: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3.5">
      <RisoPill color={status === "no" ? "tomato" : "jade"} tilt={-2}>
        {MESSAGE[status]}
      </RisoPill>
      <button
        type="button"
        onClick={onReset}
        className="riso-focus cursor-pointer border-0 bg-transparent p-0 font-mono text-[11px] tracking-[0.2em] text-ink-3 uppercase underline underline-offset-[5px] hover:text-tomato"
      >
        Đổi ý · Change answer
      </button>
    </div>
  );
}
