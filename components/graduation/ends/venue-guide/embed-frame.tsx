/** A full-bleed iframe for the venue guide frame. */
export function EmbedFrame({ src, title, allow }: { src: string; title: string; allow?: string }) {
  return (
    <iframe
      src={src}
      title={title}
      allow={allow}
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      className="absolute inset-0 h-full w-full border-0"
    />
  );
}
