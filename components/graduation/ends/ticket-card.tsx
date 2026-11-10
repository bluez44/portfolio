import { Postmark } from "../shared/postmark";
import { TicketNotes } from "./ticket-notes";
import { TicketWhen } from "./ticket-when";
import { TicketWhere } from "./ticket-where";
import { useCopy } from "../i18n/lang-context";

export function TicketCard() {
  const { ends: t } = useCopy();
  return (
    <div className="relative grid grid-cols-1 rounded-[14px] border-[1.5px] border-ink bg-paper min-[760px]:grid-cols-[4fr_6fr]" style={{ boxShadow: "var(--offset-lg)" }}>
      <Postmark color="jade" lines={t.stamp} rotate={12} className="-top-6.5 right-7 bg-paper" />
      <TicketWhen />
      <TicketWhere />
      <TicketNotes />
    </div>
  );
}
