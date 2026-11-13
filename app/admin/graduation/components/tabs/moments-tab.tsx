"use client";

import { GUEST_COPY_TABS } from "@/lib/graduation/content/fields/guest-keys";
import type { GuestTabProps } from "./guest-tab-props";
import { GROUP_TITLE_CLASS, PANEL_CLASS } from "../fields/field-classes";
import { GuestCopyFields } from "../fields/guest-copy-fields";
import { MomentsEditor } from "../fields/moments-editor";
import { ImageUploader } from "../image-uploader";

export function MomentsTab({ content, placeholders, onChange }: GuestTabProps) {
  return (
    <div className="flex flex-col gap-4">
      <GuestCopyFields keys={GUEST_COPY_TABS.met} content={content} placeholders={placeholders.texts} onChange={onChange} />
      <section className={PANEL_CLASS}>
        <h4 className={GROUP_TITLE_CLASS}>Kỷ niệm riêng</h4>
        <MomentsEditor
          moments={content.moments ?? []}
          fallback={placeholders.moments}
          onChange={(moments) => onChange({ ...content, moments: moments.length > 0 ? moments : undefined })}
        />
      </section>
      <div className={PANEL_CLASS}>
        <ImageUploader
          label="Ảnh chụp chung với khách"
          value={content.images?.togetherPhoto ?? ""}
          onChange={(togetherPhoto) => onChange({ ...content, images: { ...content.images, togetherPhoto: togetherPhoto || undefined } })}
          helperText="Ảnh thứ 5, bay vào cuối cùng phía trên lời nhắn cá nhân. Để trống để dùng ảnh trong Cài đặt chung."
        />
      </div>
    </div>
  );
}
