export function RisoThemeToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="riso-focus hit-area relative h-9 w-16 cursor-pointer overflow-hidden rounded-full border-[1.5px] border-ink bg-paper-2 p-0"
      style={{ boxShadow: "var(--offset-xs)" }}
    >
      <span
        aria-hidden
        className="absolute top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full border-[1.5px] border-ink text-[10px] text-ink"
        style={{
          left: dark ? 34 : 4,
          background: dark ? "var(--blue)" : "var(--canary)",
          transition: "left 300ms var(--ease), background 300ms var(--ease)",
        }}
      >
        {dark ? "☾" : "☀"}
      </span>
    </button>
  );
}
