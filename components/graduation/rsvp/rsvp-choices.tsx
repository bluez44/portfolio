import { RisoButton } from "@/components/ui/riso/button";
import type { RsvpStatus } from "@/lib/graduation/types";

export function RsvpChoices({
  pending,
  error,
  onChoose,
}: {
  pending: boolean;
  error: boolean;
  onChoose: (s: RsvpStatus) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3.5">
        <RisoButton variant="primary" size="lg" icon="✓" disabled={pending} onClick={() => onChoose("yes")}>
          Mình sẽ đến
        </RisoButton>
        <RisoButton variant="ink" size="lg" icon="✗" disabled={pending} onClick={() => onChoose("no")}>
          Tiếc quá, không kịp
        </RisoButton>
      </div>
      {error && (
        <p role="alert" className="m-0 font-mono text-[11px] tracking-[0.14em] text-tomato uppercase">
          Không gửi được, thử lại nhé · Couldn&apos;t send, try again
        </p>
      )}
    </div>
  );
}
