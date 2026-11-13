"use client";

import { GUEST_COPY_TABS } from "@/lib/graduation/content/fields/guest-keys";
import type { GuestTabProps } from "./guest-tab-props";
import { DatetimeField } from "../fields/datetime-field";
import { PANEL_CLASS } from "../fields/field-classes";
import { GuestCopyFields } from "../fields/guest-copy-fields";

export function EndsTab({ content, placeholders, onChange }: GuestTabProps) {
  const setTime = (key: "start" | "end", value: string | undefined) => onChange({ ...content, event: { ...content.event, [key]: value } });
  return (
    <div className="flex flex-col gap-4">
      <div className={`${PANEL_CLASS} grid grid-cols-1 gap-3 sm:grid-cols-2`}>
        <DatetimeField label="Bắt đầu (riêng khách này)" value={content.event?.start} fallback={placeholders.times.startUtc} onChange={(value) => setTime("start", value)} />
        <DatetimeField label="Kết thúc (riêng khách này)" value={content.event?.end} fallback={placeholders.times.endUtc} onChange={(value) => setTime("end", value)} />
      </div>
      <GuestCopyFields keys={GUEST_COPY_TABS.ends} content={content} placeholders={placeholders.texts} onChange={onChange} />
    </div>
  );
}
