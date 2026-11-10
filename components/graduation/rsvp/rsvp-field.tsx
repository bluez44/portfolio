import { useId } from "react";
import type { Field } from "@/lib/graduation/i18n";

const control =
  "riso-focus w-full rounded-[10px] border-[1.5px] bg-paper px-4 py-3 text-[15px] leading-normal text-ink outline-none placeholder:text-ink-3";

export function RsvpField({
  name,
  field,
  optionalLabel,
  error,
  multiline = false,
  defaultValue,
}: {
  name: string;
  field: Field;
  /** Shown beside the label for optional fields. */
  optionalLabel?: string;
  error?: string;
  multiline?: boolean;
  defaultValue?: string | null;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const props = {
    id,
    name,
    placeholder: field.placeholder,
    defaultValue: defaultValue ?? undefined,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    className: `${control} ${error ? "border-tomato" : "border-ink"}`,
  };
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-mono text-[11px] tracking-[0.18em] text-ink-2 uppercase">
        {field.label}
        {optionalLabel && <span className="text-ink-3 normal-case"> · {optionalLabel}</span>}
      </label>
      {multiline ? <textarea rows={3} {...props} className={`${props.className} resize-y`} /> : <input type="text" {...props} />}
      {error && (
        <p id={errorId} className="m-0 text-[13px] text-tomato">
          {error}
        </p>
      )}
    </div>
  );
}
