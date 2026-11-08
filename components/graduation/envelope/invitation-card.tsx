import type { CSSProperties } from "react";

export function InvitationCard({ guestName, id, className = "", style }: { guestName: string; id?: string; className?: string; style?: CSSProperties }) {
  return (
    <div id={id} className={`box-border flex flex-col justify-between gap-2.5 overflow-hidden rounded-[14px] border-[1.5px] border-ink bg-paper px-[clamp(18px,2.8vw,34px)] py-[clamp(16px,2.4vw,28px)] ${className}`} style={{ boxShadow: "var(--offset-tomato)", ...style }}>
      <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.26em] uppercase">
        <span className="text-ink-3">Thiệp mời · Invitation</span>
        <span className="text-tomato">Fig · 01</span>
      </div>
      <h2 className="m-0 font-heading text-[clamp(22px,3vw,36px)] leading-[0.98] font-bold tracking-[-0.035em] text-balance" style={{ fontVariationSettings: '"wdth" 88, "opsz" 96' }}>
        Xin chào, <span className="italic text-tomato" style={{ fontVariationSettings: '"wdth" 82' }}>{guestName}.</span>
      </h2>
      <div className="flex flex-col gap-1.5">
        <p className="m-0 text-[clamp(11px,1.05vw,13.5px)] leading-[1.55] text-pretty text-ink-2">
          Mình là Quang Vinh. Sau bốn năm ở Bách Khoa, mình sắp khoác lên tấm áo cử nhân — và mình rất muốn có bạn ở đó.
        </p>
        <p className="m-0 text-[clamp(10px,0.95vw,12px)] leading-normal text-pretty text-ink-3 italic">
          After four years at HCMUT, I&apos;m finally graduating — and I&apos;d love for you to be there.
        </p>
      </div>
      <div className="flex items-end justify-between border-t border-dashed border-ink/25 pt-2">
        <span className="font-heading text-sm font-semibold text-ink">— Vinh (Tom)</span>
        <span className="font-mono text-[9px] tracking-[0.22em] text-ink-3 uppercase">Cuộn tiếp ↓ Keep scrolling</span>
      </div>
    </div>
  );
}
