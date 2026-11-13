"use client";

import { GUEST_COPY_TABS } from "@/lib/graduation/content/fields/guest-keys";
import type { GuestTabProps } from "./guest-tab-props";
import { GuestCopyFields } from "../fields/guest-copy-fields";
import { PANEL_CLASS } from "../fields/field-classes";
import { ImageUploader } from "../image-uploader";

export function EnvelopeTab({ content, placeholders, onChange }: GuestTabProps) {
  return (
    <div className="flex flex-col gap-4">
      <GuestCopyFields keys={GUEST_COPY_TABS.envelope} content={content} placeholders={placeholders.texts} onChange={onChange} />
      <div className={PANEL_CLASS}>
        <ImageUploader
          label="Ảnh nhỏ trên thiệp"
          value={content.images?.coverImage ?? ""}
          onChange={(coverImage) => onChange({ ...content, images: { ...content.images, coverImage: coverImage || undefined } })}
          helperText="Để trống để dùng ảnh trong Cài đặt chung"
        />
      </div>
    </div>
  );
}
