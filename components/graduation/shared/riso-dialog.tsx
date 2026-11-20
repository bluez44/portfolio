"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { RisoIconButton } from "@/components/ui/riso/icon-button";
import { useDismiss } from "@/lib/hooks/use-dismiss";
import { useScrollLock } from "@/lib/hooks/use-scroll-lock";

type Props = {
  label: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
};

/**
 * Full-screen modal over a scrim, portalled to `body` so pinned or transformed ancestors cannot
 * trap it. Escape, the ✕ button and a tap on the scrim close it; the page does not scroll meanwhile.
 */
export function RisoDialog({ label, closeLabel, onClose, children }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  useDismiss(true, onClose);
  useScrollLock(true);

  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true });
  }, []);

  return createPortal(
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      tabIndex={-1}
      className="fixed inset-0 z-60 flex flex-col justify-center outline-none"
    >
      <div aria-hidden onClick={onClose} className="absolute inset-0 animate-[wish-fade_0.3s_ease_both]" style={{ background: "var(--scrim)" }} />
      <div className="absolute top-[calc(env(safe-area-inset-top)+16px)] right-4 z-2">
        <RisoIconButton size="lg" label={closeLabel} onClick={onClose}>
          ✕
        </RisoIconButton>
      </div>
      <div className="pointer-events-none relative z-1 animate-[wish-fade_0.4s_ease_both] [&>*]:pointer-events-auto">
        {children}
      </div>
    </div>,
    document.body,
  );
}
