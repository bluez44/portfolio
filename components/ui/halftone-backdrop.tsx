export function HalftoneBackdrop() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-40 mix-blend-multiply"
      style={{
        background: "radial-gradient(color-mix(in oklab, var(--ink) 8%, transparent) 1px, transparent 1.5px)",
        backgroundSize: "22px 22px",
      }}
    />
  );
}
