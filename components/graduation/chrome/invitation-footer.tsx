"use client";

import { useCopy, useOwner } from "../i18n/lang-context";

export function InvitationFooter() {
  const { marks } = useCopy();
  const owner = useOwner();
  return (
    <footer className="relative z-30 border-t-[1.5px] border-ink bg-ink px-6 py-6 text-paper min-[760px]:px-[clamp(72px,8vw,128px)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between font-mono text-[11px] tracking-[0.2em] uppercase">
        <span className="text-canary">{marks.signature}</span>
        <span>{owner.name}</span>
      </div>
    </footer>
  );
}
