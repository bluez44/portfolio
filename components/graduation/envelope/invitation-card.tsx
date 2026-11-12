import type { ComponentProps } from "react";
import { useCopy } from "../i18n/lang-context";

export function InvitationCard({
  guestName,
  className = "",
  style,
  ...rest
}: Omit<ComponentProps<"div">, "children"> & { guestName: string }) {
  const { card: t } = useCopy();
  return (
    <div
      {...rest}
      className={`box-border flex flex-col justify-between gap-2.5 overflow-hidden rounded-[14px] border-[1.5px] border-ink bg-paper px-[clamp(18px,2.8vw,34px)] py-[clamp(16px,2.4vw,28px)] ${className}`}
      style={{ boxShadow: "var(--offset-tomato)", ...style }}
    >
      <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.26em] uppercase">
        <span className="text-ink-3">{t.label}</span>
        <span className="text-tomato">Fig · 01</span>
      </div>
      <div className="flex items-start justify-between gap-3">
        <h2
          className="m-0 font-heading text-[clamp(22px,3vw,36px)] leading-[0.98] font-bold tracking-[-0.035em] text-balance"
          style={{ fontVariationSettings: '"wdth" 88, "opsz" 96' }}
        >
          {t.greeting}{" "}
          <span className="italic text-tomato" style={{ fontVariationSettings: '"wdth" 82' }}>
            {guestName}.
          </span>
        </h2>
        {t.coverImage && (
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border-[1.5px] border-ink bg-paper-2 shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={t.coverImage} alt="Cover" className="h-full w-full object-cover" />
          </div>
        )}
      </div>
      <p className="m-0 text-[clamp(13px,1.05vw,14px)] leading-[1.55] text-pretty text-ink-2">{t.body}</p>
      <div className="flex items-end justify-between border-t border-dashed border-ink/25 pt-2">
        <span className="font-heading text-sm font-semibold text-ink">{t.author || "— Vinh (Tom)"}</span>
        <span className="font-mono text-[10px] tracking-[0.22em] text-ink-3 uppercase">{t.keepScrolling}</span>
      </div>
    </div>
  );
}
