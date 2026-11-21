"use client";

import type { KeyboardEvent, PointerEvent } from "react";
import { focusPoint, focusPosition, type FocusPoint, type MomentFocus } from "@/lib/graduation/image-focus";
import { HINT_CLASS, LABEL_CLASS } from "./field-classes";

const LAYOUTS = [
  { key: "phone", label: "Điện thoại" },
  { key: "wide", label: "Máy tính" },
] as const satisfies readonly { key: keyof MomentFocus; label: string }[];

/** Each layout previewed at the crop it uses; by default a moment's: square rows on phones, wide cards on desktop. */
export type FocusAspects = Record<keyof MomentFocus, string>;
const MOMENT_ASPECTS: FocusAspects = { phone: "aspect-square", wide: "aspect-4/3" };
/** The together photo: a square print in the phone pile, a 4:5 polaroid on desktop. */
export const TOGETHER_ASPECTS: FocusAspects = { phone: "aspect-square", wide: "aspect-4/5" };

/** Arrow keys move the point by 1%, or 10% with Shift. */
const KEY_STEP: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };

const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)));
const isCenter = ({ x, y }: FocusPoint) => x === 50 && y === 50;

type Props = { image: string; value?: MomentFocus; aspects?: FocusAspects; onChange: (value: MomentFocus | undefined) => void };

/**
 * Picks which point of a photo stays in view when it is cropped, separately for phones and desktop:
 * drag (or click, or use the arrow keys) on the whole photo, and the crop beside it follows.
 */
export function ImageFocusPicker({ image, value, aspects = MOMENT_ASPECTS, onChange }: Props) {
  const set = (key: keyof MomentFocus, point: FocusPoint | undefined) => {
    const next = { ...value, [key]: point && !isCenter(point) ? point : undefined };
    onChange(next.phone || next.wide ? next : undefined);
  };

  return (
    <div className="mb-3">
      <span className={LABEL_CLASS}>Tâm ảnh khi bị cắt</span>
      <div className="flex max-w-md flex-col gap-4">
        {LAYOUTS.map(({ key, label }) => {
          const point = focusPoint(value?.[key]);
          const fromPointer = (e: PointerEvent<HTMLDivElement>) => {
            const box = e.currentTarget.getBoundingClientRect();
            set(key, { x: clamp(((e.clientX - box.left) / box.width) * 100), y: clamp(((e.clientY - box.top) / box.height) * 100) });
          };
          const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
            const step = KEY_STEP[e.key];
            if (!step) return;
            e.preventDefault();
            const by = e.shiftKey ? 10 : 1;
            set(key, { x: clamp(point.x + step[0] * by), y: clamp(point.y + step[1] * by) });
          };
          return (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between gap-2 text-[11px] text-zinc-500">
                <span>
                  {label}: <span className="tabular-nums">x {point.x}% · y {point.y}%</span>
                </span>
                <button
                  type="button"
                  disabled={isCenter(point)}
                  onClick={() => set(key, undefined)}
                  className="rounded px-1.5 py-0.5 text-sky-400 hover:bg-zinc-800 disabled:text-zinc-600 disabled:hover:bg-transparent"
                >
                  Đặt lại giữa
                </button>
              </div>
              <div className="grid grid-cols-[3fr_2fr] items-start gap-2">
                <div
                  role="slider"
                  tabIndex={0}
                  aria-label={`Tâm ảnh trên ${label.toLowerCase()}`}
                  // A 2-D point: the value is x, and the text reads out both.
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={point.x}
                  aria-valuetext={`x ${point.x}%, y ${point.y}%`}
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    fromPointer(e);
                  }}
                  onPointerMove={(e) => {
                    if (e.currentTarget.hasPointerCapture(e.pointerId)) fromPointer(e);
                  }}
                  onKeyDown={onKeyDown}
                  className="relative cursor-crosshair touch-none overflow-hidden rounded-md border border-zinc-700 outline-none select-none focus-visible:ring-2 focus-visible:ring-sky-500"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt="" draggable={false} className="block h-auto w-full" />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-sky-500 shadow-[0_0_0_1px_rgba(0,0,0,0.5)]"
                    style={{ left: `${point.x}%`, top: `${point.y}%` }}
                  />
                </div>
                <div className={`relative w-full overflow-hidden rounded-md border border-zinc-700 ${aspects[key]}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt="" className="h-full w-full object-cover" style={{ objectPosition: focusPosition(point) }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <span className={HINT_CLASS}>Kéo chấm trên ảnh gốc (bên trái) tới phần luôn cần giữ lại; khung bên phải là ảnh sau khi cắt.</span>
    </div>
  );
}
