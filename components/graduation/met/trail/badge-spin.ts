import gsap from "gsap";
import { MAX_FRAME_MS, SPIN_IDLE, SPIN_MAX, SPIN_PER_PX, SPIN_RESPONSE } from "./constants";

/**
 * Spins the badge discs while `root` is near the viewport: a slow idle turn that speeds up with
 * scroll velocity (reversing when scrolling up), easing back to idle when scrolling stops.
 * Returns a stop function.
 */
export function startBadgeSpin(spinners: HTMLElement[], root: HTMLElement): () => void {
  const setters = spinners.map((el) => gsap.quickSetter(el, "rotation", "deg"));
  let angle = 0;
  let speed = SPIN_IDLE;
  let lastY = window.scrollY;
  let active = false;

  const tick = (_time: number, deltaMs: number) => {
    const dt = Math.min(deltaMs, MAX_FRAME_MS) / 1000;
    if (dt <= 0) return;
    const velocity = (window.scrollY - lastY) / dt;
    lastY = window.scrollY;
    const target = SPIN_IDLE + gsap.utils.clamp(-SPIN_MAX, SPIN_MAX, velocity * SPIN_PER_PX);
    speed += (target - speed) * Math.min(1, dt * SPIN_RESPONSE);
    angle = (angle + speed * dt) % 360;
    for (const set of setters) set(angle);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.some((entry) => entry.isIntersecting);
      if (visible && !active) {
        active = true;
        lastY = window.scrollY;
        gsap.ticker.add(tick);
      } else if (!visible && active) {
        active = false;
        gsap.ticker.remove(tick);
      }
    },
    { rootMargin: "200px" },
  );
  observer.observe(root);

  return () => {
    observer.disconnect();
    gsap.ticker.remove(tick);
  };
}
