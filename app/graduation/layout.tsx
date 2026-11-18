import type { ReactNode } from "react";

export default function GraduationLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Enforce light theme immediately before paint so no dark mode flash occurs */}
      <script
        dangerouslySetInnerHTML={{
          __html: `try{document.documentElement.setAttribute('data-theme','light');}catch(e){}`,
        }}
      />
      {children}
    </>
  );
}
