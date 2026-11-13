"use client";

import { TOKEN_LABELS } from "./token-labels";

type TemplateChipsProps = { tokens: readonly string[]; onInsert: (token: string) => void };

export function TemplateChips({ tokens, onInsert }: TemplateChipsProps) {
  if (tokens.length === 0) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {tokens.map((token) => (
        <button
          key={token}
          type="button"
          title={TOKEN_LABELS[token]}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onInsert(token)}
          className="rounded border border-zinc-700 px-1.5 py-0.5 font-mono text-[10px] text-sky-300 hover:bg-zinc-800"
        >
          {`{${token}}`}
        </button>
      ))}
    </div>
  );
}
