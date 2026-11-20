import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Refreshes ScrollTrigger whenever `el` changes size after the trail was measured (late fonts,
 * images, content mounting), so the path end and the pins stay where the layout really is.
 * Returns a stop function.
 */
export function observeLayout(el: HTMLElement): () => void {
  let frame = 0;
  let size = el.offsetHeight;
  const observer = new ResizeObserver(() => {
    if (el.offsetHeight === size || frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      size = el.offsetHeight;
      ScrollTrigger.refresh();
    });
  });
  observer.observe(el);
  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
  };
}
