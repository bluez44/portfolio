import { WaxSeal } from "../shared/wax-seal";

const stroke = { stroke: "var(--ink)", strokeWidth: 1.5, vectorEffect: "non-scaling-stroke" as const, fill: "none" };
const face = "absolute inset-0 backface-hidden";
// The flap's base sits on the envelope's top edge, so its base corners share the body's `rounded-lg`.
const shape = "absolute inset-0 overflow-hidden";

export function EnvelopeFlap({ id = "flap", sealed = true }: { id?: string; sealed?: boolean }) {
  return (
    <div id={id} aria-hidden className="pointer-events-none absolute top-0 left-0 z-3 h-[54%] w-full origin-top transform-3d">
      <div className={face}>
        <div className={`${shape} rounded-t-lg`}>
          <div className="absolute inset-0 bg-paper-2 [clip-path:polygon(0_0,100%_0,50%_100%)]" />
          <svg viewBox="0 0 160 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full"><polyline points="0,0 80,100 160,0" {...stroke} /></svg>
        </div>
        {sealed && <WaxSeal className="absolute top-full left-1/2 -mt-8.5 -ml-8" />}
      </div>
      {/* Inner face: pre-flipped, so its base is the local bottom edge and its tip the local top. */}
      <div className={`${face} -top-0.75 transform-[rotateX(180deg)]`}>
        <div className={`${shape} rounded-b-lg`}>
          <div className="absolute inset-0 bg-paper-2 [clip-path:polygon(0_100%,100%_100%,50%_0)]" style={{ backgroundImage: "repeating-linear-gradient(-45deg, color-mix(in oklab, var(--tomato) 70%, transparent) 0 5px, transparent 5px 14px)" }} />
          <svg viewBox="0 0 160 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full"><polyline points="0,100 80,0 160,100" {...stroke} /></svg>
        </div>
        {sealed && <WaxSeal className="absolute bottom-full left-1/2 -mb-8.5 -ml-8" />}
      </div>
    </div>
  );
}
