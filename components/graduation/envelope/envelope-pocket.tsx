import { Tape } from "../shared/tape";
import { airMailStripes } from "../shared/riso-stripes";

const stroke = { stroke: "var(--ink)", strokeWidth: 1.5, vectorEffect: "non-scaling-stroke" as const, fill: "none" };

export function EnvelopePocket() {
  return (
    <div id="pocket" aria-hidden className="pointer-events-none absolute inset-0 z-[2] overflow-hidden rounded-lg">
      <div className="absolute inset-0 bg-paper-3 [clip-path:polygon(0_0,54%_56%,0_100%)]" />
      <div className="absolute inset-0 bg-paper-3 [clip-path:polygon(100%_0,46%_56%,100%_100%)]" />
      <div className="absolute inset-0 bg-paper-2 [clip-path:polygon(0_100%,50%_40%,100%_100%)]" />
      <svg viewBox="0 0 160 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <line x1="0" y1="0" x2="71.4" y2="46.5" {...stroke} />
        <line x1="160" y1="0" x2="88.6" y2="46.5" {...stroke} />
        <polyline points="0,100 80,40 160,100" {...stroke} />
      </svg>
      <div className="absolute inset-x-0 bottom-0 h-[7px] border-t-[1.5px] border-ink" style={{ background: airMailStripes(8) }} />
      <div className="absolute bottom-[13%] left-1/2 flex -translate-x-1/2 -rotate-2 flex-col items-center gap-[3px] rounded border-[1.5px] border-ink bg-paper px-3.5 py-2 whitespace-nowrap" style={{ boxShadow: "3px 3px 0 var(--blue)" }}>
        <Tape color="canary" width={54} height={14} rotate={3} className="-top-[9px]" style={{ background: "color-mix(in oklab, var(--canary) 80%, transparent)", backgroundImage: "var(--stripes-tape)" }} />
        <span className="font-mono text-[9px] tracking-[0.24em] text-ink-3 uppercase">Người gửi · Return to</span>
        <span className="font-heading text-[15px] font-bold tracking-[-0.02em] text-ink">Võ Lê Quang Vinh</span>
        <span className="font-mono text-[9px] tracking-[0.18em] text-ink-2 uppercase">K22 · Khoa học Máy tính · HCMUT</span>
      </div>
    </div>
  );
}
