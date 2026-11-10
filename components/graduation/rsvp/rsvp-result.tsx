import { RisoPill } from "@/components/ui/riso/pill";
import type { RsvpStatus } from "@/lib/graduation/types";
import { useCopy } from "../i18n/lang-context";

export function RsvpResult({ status, onReset }: { status: RsvpStatus; onReset: () => void }) {
  const { rsvp: t } = useCopy();
  return (
    <div className="flex flex-col items-start gap-3.5">
      <RisoPill color={status === "no" ? "tomato" : "jade"} tilt={-2}>
        {t.result[status]}
      </RisoPill>
      <button
        type="button"
        onClick={onReset}
        className="riso-focus cursor-pointer border-0 bg-transparent p-0 font-mono text-[11px] tracking-[0.2em] text-ink-3 uppercase underline underline-offset-[5px] hover:text-tomato"
      >
        {t.change}
      </button>
    </div>
  );
}
