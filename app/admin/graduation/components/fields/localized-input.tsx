"use client";

import { useRef, type ChangeEvent } from "react";
import type { Lang } from "@/lib/graduation/i18n";
import { ERROR_BORDER_CLASS, ERROR_CLASS, INPUT_CLASS } from "./field-classes";
import { insertToken } from "./insert-token";
import { TemplateChips } from "./template-chips";

type LocalizedInputProps = {
  lang: Lang;
  value: string;
  placeholder: string;
  multiline: boolean;
  tokens: readonly string[];
  error?: string;
  onChange: (value: string) => void;
};

export function LocalizedInput({ lang, value, placeholder, multiline, tokens, error, onChange }: LocalizedInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  const insert = (token: string) => {
    const element = multiline ? areaRef.current : inputRef.current;
    const next = insertToken(value, element?.selectionStart ?? value.length, element?.selectionEnd ?? value.length, token);
    onChange(next.value);
    requestAnimationFrame(() => {
      element?.focus();
      element?.setSelectionRange(next.caret, next.caret);
    });
  };

  const shared = {
    value,
    placeholder,
    "aria-invalid": Boolean(error),
    className: `${INPUT_CLASS} ${error ? ERROR_BORDER_CLASS : ""}`,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value),
  };

  return (
    <div>
      <span className="mb-1 inline-block rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 uppercase">{lang}</span>
      {multiline ? <textarea ref={areaRef} rows={3} {...shared} /> : <input ref={inputRef} type="text" {...shared} />}
      <TemplateChips tokens={tokens} onInsert={insert} />
      {error && <span className={ERROR_CLASS}>{error}</span>}
    </div>
  );
}
