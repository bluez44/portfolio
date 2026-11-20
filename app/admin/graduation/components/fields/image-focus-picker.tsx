"use client";

import { IMAGE_FOCI, focusPosition, type ImageFocus, type MomentFocus } from "@/lib/graduation/image-focus";
import { HINT_CLASS, LABEL_CLASS } from "./field-classes";

const FOCUS_LABELS: Record<ImageFocus, string> = {
  "top-left": "Trên trái",
  top: "Trên",
  "top-right": "Trên phải",
  left: "Trái",
  center: "Giữa",
  right: "Phải",
  "bottom-left": "Dưới trái",
  bottom: "Dưới",
  "bottom-right": "Dưới phải",
};

/** Each layout previewed at the crop its cards use: square rows on phones, wide cards on desktop. */
const LAYOUTS = [
  { key: "phone", label: "Điện thoại", aspect: "aspect-square" },
  { key: "wide", label: "Máy tính", aspect: "aspect-4/3" },
] as const satisfies readonly { key: keyof MomentFocus; label: string; aspect: string }[];

type Props = { image: string; value?: MomentFocus; onChange: (value: MomentFocus | undefined) => void };

/** Picks which part of a moment photo stays in view when it is cropped, separately for phones and desktop. */
export function ImageFocusPicker({ image, value, onChange }: Props) {
  const set = (key: keyof MomentFocus, focus: ImageFocus) => {
    const next = { ...value, [key]: focus === "center" ? undefined : focus };
    onChange(next.phone || next.wide ? next : undefined);
  };

  return (
    <div className="mb-3">
      <span className={LABEL_CLASS}>Tâm ảnh khi bị cắt</span>
      <div className="grid max-w-sm grid-cols-2 gap-3">
        {LAYOUTS.map(({ key, label, aspect }) => {
          const current = value?.[key] ?? "center";
          return (
            <div key={key} role="radiogroup" aria-label={`Tâm ảnh trên ${label.toLowerCase()}`}>
              <span className="mb-1 block text-[11px] text-zinc-500">
                {label}: {FOCUS_LABELS[current]}
              </span>
              <div className={`relative w-full overflow-hidden rounded-md border border-zinc-700 ${aspect}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="" className="h-full w-full object-cover" style={{ objectPosition: focusPosition(current) }} />
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                  {IMAGE_FOCI.map((focus) => (
                    <button
                      key={focus}
                      type="button"
                      role="radio"
                      aria-checked={focus === current}
                      aria-label={FOCUS_LABELS[focus]}
                      title={FOCUS_LABELS[focus]}
                      onClick={() => set(key, focus)}
                      className="group grid place-items-center border border-white/10 hover:bg-white/10"
                    >
                      <span
                        className={`h-3 w-3 rounded-full border-2 ${
                          focus === current ? "border-white bg-sky-500" : "border-white/70 bg-black/30 group-hover:bg-white/40"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <span className={HINT_CLASS}>Chọn phần ảnh luôn được giữ lại khi thẻ cắt ảnh.</span>
    </div>
  );
}
