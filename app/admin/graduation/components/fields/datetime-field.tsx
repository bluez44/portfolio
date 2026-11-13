"use client";

import { fromVnLocalInput, toVnLocalInput } from "@/lib/graduation/content/vn-time";
import { ERROR_BORDER_CLASS, ERROR_CLASS, HINT_CLASS, INPUT_CLASS, LABEL_CLASS } from "./field-classes";

type DatetimeFieldProps = {
  label: string;
  value?: string;
  fallback: string;
  error?: string;
  onChange: (iso: string | undefined) => void;
};

export function DatetimeField({ label, value, fallback, error, onChange }: DatetimeFieldProps) {
  return (
    <label className="block">
      <span className={LABEL_CLASS}>{label}</span>
      <input
        type="datetime-local"
        value={value ? toVnLocalInput(value) : ""}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(fromVnLocalInput(event.target.value) ?? undefined)}
        className={`${INPUT_CLASS} ${error ? ERROR_BORDER_CLASS : ""}`}
      />
      <span className={HINT_CLASS}>Giờ Việt Nam (UTC+7). Để trống sẽ dùng {toVnLocalInput(fallback).replace("T", " ")}.</span>
      {error && <span className={ERROR_CLASS}>{error}</span>}
    </label>
  );
}
