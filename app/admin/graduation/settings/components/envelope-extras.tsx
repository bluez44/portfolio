"use client";

import type { Dispatch } from "react";
import type { ImageSettings } from "@/lib/graduation/content/settings-types";
import { GROUP_TITLE_CLASS, PANEL_CLASS } from "../../components/fields/field-classes";
import { ImageUploader } from "../../components/image-uploader";
import type { SettingsDraftAction } from "../draft/settings-draft";

type EnvelopeExtrasProps = { images?: ImageSettings; dispatch: Dispatch<SettingsDraftAction> };

export function EnvelopeExtras({ images, dispatch }: EnvelopeExtrasProps) {
  return (
    <section className={PANEL_CLASS}>
      <h4 className={GROUP_TITLE_CLASS}>Ảnh</h4>
      <ImageUploader
        label="Ảnh nhỏ trên thiệp"
        value={images?.coverImage ?? ""}
        onChange={(value) => dispatch({ type: "image", key: "coverImage", value })}
        helperText="Dùng cho mọi khách, trừ khách có ảnh riêng. Để trống để ẩn."
      />
    </section>
  );
}
