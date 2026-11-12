const pad = (n: number) => String(n).padStart(2, "0");

/** SMPTE-style hh:mm:ss:ff at 24 fps. */
export function formatTimecode(seconds: number): string {
  const s = Math.floor(seconds);
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(Math.floor((seconds % 1) * 24))}`;
}

/** Paints a 180px tile of random grey noise as `el`'s background. */
export function applyFilmGrain(el: HTMLElement) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 180;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const img = ctx.createImageData(180, 180);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  el.style.backgroundImage = `url(${canvas.toDataURL()})`;
}

export function shiftFilmGrain(el: HTMLElement) {
  el.style.backgroundPosition = `${Math.floor(Math.random() * 180)}px ${Math.floor(Math.random() * 180)}px`;
}
