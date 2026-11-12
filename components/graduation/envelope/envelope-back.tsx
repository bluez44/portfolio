import { EnvelopeBody } from "./envelope-body";
import { EnvelopeFlap } from "./envelope-flap";
import { EnvelopePocket } from "./envelope-pocket";
import { InvitationCard } from "./invitation-card";

export function EnvelopeBack({ guestName }: { guestName: string }) {
  return (
    <div id="envBack" className="invisible absolute inset-0 transform-[rotateY(180deg)]">
      {/* Body, pocket and flap leave together as one piece. Until the shell is animated it is not a
          stacking context, so the card can still sit between the body and the pocket. */}
      <div id="envShell" className="absolute inset-0">
        <EnvelopeBody id="envBody" />
        <EnvelopePocket />
        <EnvelopeFlap />
      </div>
      <InvitationCard id="card" guestName={guestName} className="absolute top-[6%] left-[5%] z-1 h-[88%] w-[90%]" />
    </div>
  );
}
