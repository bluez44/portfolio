import gsap from "gsap";
import { playSfx } from "@/lib/graduation/sfx";

const VIBRATION = [12, 40, 18];

/** What the guest hears and feels as the stamp lands; vibration is skipped where unsupported (iOS Safari). */
export function stampFeedback(sound: boolean) {
  if (sound) playSfx("stamp");
  navigator.vibrate?.(VIBRATION);
}

export function shakeCard(card: HTMLElement) {
  return gsap.to(card, { keyframes: { x: [-3, 3, -2, 2, 0] }, duration: 0.12, ease: "none" });
}
