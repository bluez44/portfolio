import { useOwner } from "../i18n/lang-context";

const HALVES = [
  { clip: "[clip-path:polygon(0_0,58%_0,42%_100%,0_100%)]", apart: "-translate-x-4 -rotate-20 opacity-0" },
  { clip: "[clip-path:polygon(58%_0,100%_0,100%_100%,42%_100%)]", apart: "translate-x-4 rotate-20 opacity-0" },
] as const;

/** The owner's initials wax seal, drawn as two halves so `split` can crack it open. */
export function WaxSeal({ className = "", split = false }: { className?: string; split?: boolean }) {
  const { initials } = useOwner();
  return (
    <div className={`h-16 w-16 -rotate-10 ${className}`}>
      {HALVES.map(({ clip, apart }) => (
        <div
          key={clip}
          className={`absolute inset-0 grid place-items-center rounded-full border-[1.5px] border-ink bg-tomato transition-[transform,opacity] duration-700 ease-out ${clip} ${split ? apart : ""}`}
          style={{ boxShadow: "var(--offset-sm)" }}
        >
          <div className="grid h-12 w-12 place-items-center rounded-full border-[1.5px] border-dashed border-paper">
            <span className="font-heading text-lg font-bold text-paper">{initials}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
