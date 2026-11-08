import { EnvelopeFlap } from "./envelope-flap";
import { EnvelopePocket } from "./envelope-pocket";
import { InvitationCard } from "./invitation-card";

export function EnvelopeBack({ guestName }: { guestName: string }) {
  return (
    <div id="envBack" className="invisible absolute inset-0 [transform:rotateY(180deg)]">
      <div id="envBody" aria-hidden className="absolute inset-0 box-border rounded-lg border-[1.5px] border-ink bg-paper-2" style={{ boxShadow: "var(--offset-lg)", backgroundImage: "radial-gradient(color-mix(in oklab, var(--tomato) 55%, transparent) 1.3px, transparent 1.6px)", backgroundSize: "11px 11px" }} />
      <InvitationCard id="card" guestName={guestName} className="absolute top-[6%] left-[5%] z-[1] h-[88%] w-[90%]" />
      <EnvelopePocket />
      <EnvelopeFlap />
    </div>
  );
}
