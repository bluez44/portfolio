"use client";

import { ERROR_BORDER_CLASS, ERROR_CLASS, HINT_CLASS, INPUT_CLASS, LABEL_CLASS } from "./field-classes";

type PlainFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  onChange: (value: string) => void;
};

export function PlainField({ label, value, placeholder, hint, error, onChange }: PlainFieldProps) {
  return (
    <label className="block">
      <span className={LABEL_CLASS}>{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
        className={`${INPUT_CLASS} ${error ? ERROR_BORDER_CLASS : ""}`}
      />
      {hint && <span className={HINT_CLASS}>{hint}</span>}
      {error && <span className={ERROR_CLASS}>{error}</span>}
    </label>
  );
}
