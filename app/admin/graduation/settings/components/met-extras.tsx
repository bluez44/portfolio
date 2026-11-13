"use client";

import type { Dispatch } from "react";
import type { ImageSettings, SettingsMoment } from "@/lib/graduation/content/settings-types";
import type { Lang, Moment } from "@/lib/graduation/i18n/types";
import { GROUP_TITLE_CLASS, PANEL_CLASS } from "../../components/fields/field-classes";
import { MomentsEditor } from "../../components/fields/moments-editor";
import { ImageUploader } from "../../components/image-uploader";
import type { SettingsDraftAction } from "../draft/settings-draft";

type MetExtrasProps = {
  images?: ImageSettings;
  moments?: SettingsMoment[];
  defaultMoments: Record<Lang, Moment[]>;
  dispatch: Dispatch<SettingsDraftAction>;
};

export function MetExtras({ images, moments, defaultMoments, dispatch }: MetExtrasProps) {
  return (
    <>
      <section className={`${PANEL_CLASS} flex flex-col gap-3`}>
        <h4 className={GROUP_TITLE_CLASS}>Ảnh</h4>
        <ImageUploader
          label="Ảnh chụp chung"
          value={images?.togetherPhoto ?? ""}
          onChange={(value) => dispatch({ type: "image", key: "togetherPhoto", value })}
          helperText="Dùng khi khách không có ảnh riêng. Để trống để không hiện ảnh thứ 5."
        />
        <ImageUploader
          label="Logo huy hiệu trên đường kỷ niệm"
          value={images?.badgeLogo ?? ""}
          onChange={(value) => dispatch({ type: "image", key: "badgeLogo", value })}
          helperText="Để trống để dùng logo Bách Khoa có sẵn."
        />
      </section>
      <section className={PANEL_CLASS}>
        <h4 className={GROUP_TITLE_CLASS}>Kỷ niệm</h4>
        <MomentsEditor moments={moments ?? []} fallback={defaultMoments} onChange={(value) => dispatch({ type: "moments", value })} />
      </section>
    </>
  );
}
