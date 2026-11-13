"use client";

import { Search } from "lucide-react";
import { INPUT_CLASS } from "../../components/fields/field-classes";

type FieldSearchProps = { value: string; onChange: (value: string) => void };

export function FieldSearch({ value, onChange }: FieldSearchProps) {
  return (
    <label className="relative block">
      <span className="sr-only">Tìm trường</span>
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
      <input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Tìm trường…" className={`${INPUT_CLASS} pl-9`} />
    </label>
  );
}
