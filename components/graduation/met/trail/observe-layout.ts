import { requestRefresh } from "../../shared/request-refresh";

/**
 * Refreshes ScrollTrigger whenever `el` changes height after the trail was measured (late fonts,
 * images, content mounting), so the path end and the pins stay where the layout really is.
 * Returns a stop function.
 */
export function observeLayout(el: HTMLElement): () => void {
  let size = el.offsetHeight;
  const observer = new ResizeObserver(() => {
    if (el.offsetHeight === size) return;
    size = el.offsetHeight;
    requestRefresh();
  });
  observer.observe(el);
  return () => observer.disconnect();
}
