/** Loads every image now (lazy ones included) and resolves once all are decoded, failed, or `timeoutMs` passes. */
export function waitForImages(images: Iterable<HTMLImageElement>, timeoutMs: number): Promise<void> {
  const decoded = [...images].map((img) => {
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
