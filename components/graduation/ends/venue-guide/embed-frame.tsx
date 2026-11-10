/** A full-bleed iframe for the venue guide frame. `data-lenis-prevent` keeps Lenis out of its gestures. */
export function EmbedFrame({ src, title, allow, lazy = false }: { src: string; title: string; allow?: string; lazy?: boolean }) {
  return (
    <iframe
      src={src}
      title={title}
      allow={allow}
      allowFullScreen
      loading={lazy ? "lazy" : undefined}
      referrerPolicy="strict-origin-when-cross-origin"
      data-lenis-prevent
      className="absolute inset-0 h-full w-full border-0"
    />
  );
}
