import type { ReactNode } from "react";
import { PERF_TIER_SCRIPT } from "@/lib/browser/perf-tier";

const THEME_SCRIPT = `try{document.documentElement.setAttribute('data-theme','light');}catch(e){}`;

export default function GraduationLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Enforce light theme immediately before paint so no dark mode flash occurs */}
      <script
        dangerouslySetInnerHTML={{
          __html: `${THEME_SCRIPT}${PERF_TIER_SCRIPT}`,
        }}
      />
      {children}
    </>
  );
}
