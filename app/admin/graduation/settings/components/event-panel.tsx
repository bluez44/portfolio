"use client";

import type { Dispatch } from "react";
import type { EventSettings } from "@/lib/graduation/content/settings-types";
import { GRADUATION_EVENT } from "@/lib/graduation/event";
import { DatetimeField } from "../../components/fields/datetime-field";
import { GROUP_TITLE_CLASS, PANEL_CLASS } from "../../components/fields/field-classes";
import { PlainField } from "../../components/fields/plain-field";
import type { SettingsDraftAction } from "../draft/settings-draft";

type LinkKey = "mapEmbedUrl" | "mapLinkUrl" | "virtualTourUrl" | "virtualTourOwnerUrl" | "musicYoutubeId";

const LINKS: { key: LinkKey; label: string; hint: string }[] = [
  { key: "mapEmbedUrl", label: "Link nhúng bản đồ", hint: "Google Maps → Chia sẻ → Nhúng bản đồ → chỉ dán phần trong src=\"…\"" },
  { key: "mapLinkUrl", label: "Link chỉ đường", hint: "Mở khi quét mã QR chỉ đường trên ảnh thiệp PNG" },
  { key: "virtualTourUrl", label: "Link tour 360°", hint: "Phải bắt đầu bằng https://" },
  { key: "virtualTourOwnerUrl", label: "Link đơn vị sở hữu tour", hint: "Dùng cho dòng ghi nguồn dưới tour" },
  { key: "musicYoutubeId", label: "ID nhạc nền YouTube", hint: "11 ký tự sau ?v= trên link YouTube" },
];

type EventPanelProps = { event?: EventSettings; errors: Record<string, string>; dispatch: Dispatch<SettingsDraftAction> };

export function EventPanel({ event, errors, dispatch }: EventPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <section className={`${PANEL_CLASS} grid grid-cols-1 gap-3 min-[760px]:grid-cols-2`}>
        <h4 className={`${GROUP_TITLE_CLASS} min-[760px]:col-span-2`}>Thời gian</h4>
        <DatetimeField
          label="Bắt đầu"
          value={event?.start}
          fallback={GRADUATION_EVENT.startUtc}
          error={errors["event.start"]}
          onChange={(value) => dispatch({ type: "event", key: "start", value })}
        />
        <DatetimeField
          label="Kết thúc"
          value={event?.end}
          fallback={GRADUATION_EVENT.endUtc}
          error={errors["event.end"]}
          onChange={(value) => dispatch({ type: "event", key: "end", value })}
        />
      </section>
      <section className={`${PANEL_CLASS} flex flex-col gap-3`}>
        <h4 className={GROUP_TITLE_CLASS}>Bản đồ, tour & nhạc</h4>
        {LINKS.map((link) => (
          <PlainField
            key={link.key}
            label={link.label}
            value={event?.[link.key] ?? ""}
            placeholder={GRADUATION_EVENT[link.key]}
            hint={link.hint}
            error={errors[`event.${link.key}`]}
            onChange={(value) => dispatch({ type: "event", key: link.key, value })}
          />
        ))}
      </section>
    </div>
  );
}
