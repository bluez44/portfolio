import { STAMP_SLAM_S } from "./stamp-timing";

/** Rectangular rubber stamp with a double tomato rule; the dot mask gives it a halftone ink bite. */
export function AttendingStamp({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-[7px] border-2 border-tomato p-0.75 ${className}`}
      style={{
        animation: `attending-stamp ${STAMP_SLAM_S}s cubic-bezier(0.34, 1.56, 0.64, 1) both`,
        maskImage: "radial-gradient(circle, transparent 0.45px, black 0.8px)",
        maskSize: "4px 4px",
      }}
    >
      <span className="block rounded-[4px] border border-tomato px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.16em] whitespace-nowrap text-tomato uppercase">
        {label}
      </span>
    </div>
  );
}
