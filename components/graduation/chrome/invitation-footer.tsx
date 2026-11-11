import { useCopy } from "../i18n/lang-context";

export function InvitationFooter() {
  const t = useCopy();
  return (
    <footer className="relative z-30 border-t-[1.5px] border-ink bg-ink px-6 py-8 text-paper min-[760px]:px-[clamp(72px,8vw,128px)]">
      <div className="mx-auto flex flex-col max-w-6xl flex-wrap justify-center items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase">
        <span className="text-canary">{t.footer}</span>
        <span>Võ Lê Quang Vinh</span>
      </div>
    </footer>
  );
}
