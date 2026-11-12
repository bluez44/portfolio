export function EnvelopeBody({ id }: { id?: string }) {
  return (
    <div
      id={id}
      aria-hidden
      className="absolute inset-0 box-border rounded-lg border-[1.5px] border-ink bg-paper-2"
      style={{
        boxShadow: "var(--offset-lg)",
        backgroundImage: "radial-gradient(color-mix(in oklab, var(--tomato) 55%, transparent) 1.3px, transparent 1.6px)",
        backgroundSize: "11px 11px",
      }}
    />
  );
}
