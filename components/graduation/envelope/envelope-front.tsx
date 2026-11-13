import { Postmark } from "../shared/postmark";
import { Stamp } from "../shared/stamp";
import { usePostmarkLines } from "../shared/use-postmark-lines";
import { airMailStripes } from "../shared/riso-stripes";
import { useCopy } from "../i18n/lang-context";

const mono = "font-mono uppercase";

export function EnvelopeFront({ guestName }: { guestName: string }) {
  const { envelope: t } = useCopy();
  const postmark = usePostmarkLines();
  return (
    <div id="envFront" className="absolute inset-0 box-border rounded-lg border-[1.5px] border-ink p-2.5 backface-hidden" style={{ boxShadow: "var(--offset-lg)", background: airMailStripes(16) }}>
      <div className="relative box-border flex h-full flex-col justify-between rounded border-[1.5px] border-ink bg-paper p-[clamp(16px,2.4vw,28px)]">
        <div className="flex flex-col gap-1.5">
          <span className={`${mono} text-[10px] tracking-[0.28em] text-blue`}>{t.airMail}</span>
          <span className={`${mono} text-[10px] tracking-[0.22em] text-ink-3`}>{t.invitationNo}</span>
        </div>
        <Stamp className="absolute top-[clamp(14px,2vw,24px)] right-[clamp(14px,2vw,24px)]" />
        <Postmark color="tomato" lines={postmark} rotate={-14} className="top-[clamp(40px,5vw,56px)] right-[clamp(64px,8vw,92px)]" />
        <div className="flex flex-col gap-2">
          <span className={`${mono} text-[11px] tracking-[0.24em] text-ink-3`}>{t.cordially}</span>
          <span className="max-w-[78%] border-b-[1.5px] border-dashed border-ink pb-2.5 font-heading text-[clamp(28px,4vw,48px)] leading-none font-bold tracking-[-0.035em] text-ink" style={{ fontVariationSettings: '"wdth" 86, "opsz" 96' }}>
            {guestName}
          </span>
          <span className={`${mono} self-end text-[10px] tracking-[0.18em] text-ink-3`}>{t.from}</span>
        </div>
      </div>
    </div>
  );
}
