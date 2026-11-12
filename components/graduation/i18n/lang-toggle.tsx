"use client";

import { LANGS } from "@/lib/graduation/i18n";
import { useLang } from "./lang-context";

export function LangToggle() {
  const { lang, copy, setLang } = useLang();
  return (
    <div
      role="group"
      aria-label={copy.header.switchLang}
      className="flex h-9 items-center gap-0.5 rounded-full border-[1.5px] border-ink bg-paper-2 p-0.75"
      style={{ boxShadow: "var(--offset-xs)" }}
    >
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={`riso-focus hit-area relative h-full cursor-pointer rounded-full border-0 px-2.5 font-mono text-[11px] tracking-[0.14em] uppercase transition-colors duration-(--dur-fast) ${
            lang === l ? "border-ink bg-canary text-ink" : "bg-transparent text-ink-3 hover:text-tomato"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
