import { RisoButton } from "@/components/ui/riso/button";
import type { RsvpStatus } from "@/lib/graduation/types";
import { useCopy } from "../i18n/lang-context";

export function RsvpChoices({
  pending,
  error,
  onChoose,
}: {
  pending: boolean;
  error: boolean;
  onChoose: (s: RsvpStatus) => void;
}) {
  const { rsvp: t } = useCopy();
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3.5">
        <RisoButton variant="primary" size="lg" icon="✓" disabled={pending} onClick={() => onChoose("yes")}>
          {t.yes}
        </RisoButton>
        <RisoButton variant="ink" size="lg" icon="✗" disabled={pending} onClick={() => onChoose("no")}>
          {t.no}
        </RisoButton>
      </div>
      {error && (
        <p role="alert" className="m-0 font-mono text-[11px] tracking-[0.14em] text-tomato uppercase">
          {t.error}
        </p>
      )}
    </div>
  );
}
