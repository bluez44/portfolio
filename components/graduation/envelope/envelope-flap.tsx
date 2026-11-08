const stroke = { stroke: "var(--ink)", strokeWidth: 1.5, vectorEffect: "non-scaling-stroke" as const, fill: "none" };
const face = "absolute inset-0 [backface-visibility:hidden]";

export function EnvelopeFlap() {
  return (
    <div id="flap" aria-hidden className="pointer-events-none absolute top-0 left-0 z-[3] h-[54%] w-full origin-top [transform-style:preserve-3d]">
      <div className={face}>
        <div className="absolute inset-0 bg-paper-2 [clip-path:polygon(0_0,100%_0,50%_100%)]" />
        <svg viewBox="0 0 160 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full"><polyline points="0,0 80,100 160,0" {...stroke} /></svg>
        <div className="absolute top-full left-1/2 -mt-[34px] -ml-8 grid h-16 w-16 -rotate-10 place-items-center rounded-full border-[1.5px] border-ink bg-tomato" style={{ boxShadow: "var(--offset-sm)" }}>
          <div className="grid h-12 w-12 place-items-center rounded-full border-[1.5px] border-dashed border-paper">
            <span className="font-heading text-lg font-bold text-paper">QV</span>
          </div>
        </div>
      </div>
      <div className={`${face} [transform:rotateX(180deg)]`}>
        <div className="absolute inset-0 bg-paper-2 [clip-path:polygon(0_100%,100%_100%,50%_0)]" style={{ backgroundImage: "repeating-linear-gradient(-45deg, color-mix(in oklab, var(--tomato) 70%, transparent) 0 5px, transparent 5px 14px)" }} />
        <svg viewBox="0 0 160 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full"><polyline points="0,100 80,0 160,100" {...stroke} /></svg>
      </div>
    </div>
  );
}
