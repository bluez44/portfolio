/** False for an image inside a `display: none` subtree, e.g. the desktop-only moment cards on a phone. */
const isRendered = (img: HTMLImageElement) => img.getClientRects().length > 0;

/**
 * Loads every image the current layout renders now (lazy ones included) and resolves once all are
 * decoded, failed, or `timeoutMs` passes. Images the layout hides stay lazy, so a phone never
 * downloads desktop-only photos and vice versa.
 */
export function waitForImages(images: Iterable<HTMLImageElement>, timeoutMs: number): Promise<void> {
  const decoded = [...images].filter(isRendered).map((img) => {
    img.loading = "eager";
    return img.decode().catch(() => {});
  });
  if (decoded.length === 0) return Promise.resolve();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, timeoutMs);
  });
  return Promise.race([Promise.all(decoded).then(() => {}), timeout]).finally(() => clearTimeout(timer));
}
