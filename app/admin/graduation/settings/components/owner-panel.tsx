"use client";

import type { Dispatch } from "react";
import { DEFAULT_OWNER } from "@/lib/graduation/content/defaults";
import type { OwnerSettings } from "@/lib/graduation/content/settings-types";
import { PANEL_CLASS } from "../../components/fields/field-classes";
import { PlainField } from "../../components/fields/plain-field";
import type { SettingsDraftAction } from "../draft/settings-draft";

type OwnerPanelProps = { owner?: OwnerSettings; envPhone: string | null; errors: Record<string, string>; dispatch: Dispatch<SettingsDraftAction> };

export function OwnerPanel({ owner, envPhone, errors, dispatch }: OwnerPanelProps) {
  const fields: { key: keyof OwnerSettings; label: string; placeholder: string; hint: string }[] = [
    { key: "name", label: "Tên chủ thiệp", placeholder: DEFAULT_OWNER.name, hint: "Thay cho {owner} trong mọi nội dung" },
    { key: "initials", label: "Chữ viết tắt", placeholder: DEFAULT_OWNER.initials, hint: "Tối đa 4 ký tự, hiện trên tem và dấu sáp" },
    { key: "website", label: "Website", placeholder: DEFAULT_OWNER.website, hint: "Hiện ở chân ảnh thiệp PNG" },
    {
      key: "phone",
      label: "Số điện thoại",
      placeholder: envPhone ?? "",
      hint: envPhone ? "Để trống sẽ dùng số trong biến môi trường GRADUATION_OWNER_PHONE" : "Để trống để ẩn số điện thoại",
    },
  ];

  return (
    <div className={`${PANEL_CLASS} grid grid-cols-1 gap-3 min-[760px]:grid-cols-2`}>
      {fields.map((field) => (
        <PlainField
          key={field.key}
          label={field.label}
          value={owner?.[field.key] ?? ""}
          placeholder={field.placeholder}
          hint={field.hint}
          error={errors[`owner.${field.key}`]}
          onChange={(value) => dispatch({ type: "owner", key: field.key, value })}
        />
      ))}
    </div>
  );
}
