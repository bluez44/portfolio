import { navLinks, socials } from "@/lib/portfolio-data";

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t-[1.5px] border-ink bg-ink text-paper">
      {/* halftone corner accent */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, var(--tomato) 0%, transparent 65%)",
          opacity: 0.55,
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, var(--blue) 0%, transparent 60%)",
          opacity: 0.45,
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-10">
        {/* the big statement */}
        <div className="flex flex-col gap-6">
          <span className="kicker text-canary/90">Let&apos;s make something</span>
          <a
            href="#contact"
            className="group inline-flex flex-wrap items-baseline gap-x-6 gap-y-2 self-start font-heading text-[clamp(3.5rem,11vw,9rem)] font-bold leading-[0.9] tracking-[-0.04em]"
            style={{ fontVariationSettings: '"wdth" 88, "opsz" 96' }}
          >
            <span className="text-paper">Let&apos;s build</span>
            <span className="text-canary transition-transform duration-500 group-hover:translate-x-4">
              →
            </span>
          </a>
          <a
            href="mailto:vlqvinh444@gmail.com"
            className="mt-2 font-heading text-2xl font-medium text-paper/70 underline decoration-tomato decoration-[3px] underline-offset-[6px] transition-colors hover:text-canary sm:text-3xl"
          >
            vlqvinh444@gmail.com
          </a>
        </div>

        {/* three-col meta strip */}
        <div className="mt-16 grid gap-10 border-t border-paper/20 pt-10 sm:grid-cols-3">
          <div>
            <p className="kicker text-canary">Sitemap</p>
            <nav
              aria-label="Footer"
              className="mt-5 flex flex-col gap-2.5"
            >
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="group inline-flex items-center gap-2.5 self-start text-[15px] font-medium text-paper transition-colors hover:text-canary"
                >
                  <span
                    aria-hidden
                    className="inline-block h-[1.5px] w-4 bg-paper/50 transition-all group-hover:w-7 group-hover:bg-canary"
                  />
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
          <div>
            <p className="kicker text-canary">Elsewhere</p>
            <nav className="mt-5 flex flex-col gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel={s.href.startsWith("http") ? "noreferrer" : undefined}
                  className="group inline-flex flex-wrap items-baseline gap-x-2 self-start text-[15px] font-medium text-paper transition-colors hover:text-canary"
                >
                  <span className="underline decoration-tomato decoration-[2px] underline-offset-[5px] group-hover:decoration-canary">
                    {s.label}
                  </span>
                  <span className="text-[13px] text-paper/60">
                    — {s.value}
                  </span>
                </a>
              ))}
            </nav>
          </div>
          <div>
            <p className="kicker text-canary">Colophon</p>
            <p className="mt-5 max-w-[28ch] text-[14px] leading-relaxed text-paper/80">
              Built with Next.js, R3F & Tailwind. Typeset in Bricolage Grotesque
              & Instrument Sans. Printed on warm paper.
            </p>
          </div>
        </div>

        {/* baseline */}
        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-paper/15 pt-6">
          <p className="text-[12px] text-paper/55">
            © {new Date().getFullYear()} Võ Lê Quang Vinh · All rights reserved
          </p>
          <p className="font-mono text-[11px] tracking-[0.24em] text-paper/45 uppercase">
            Ho Chi Minh City · 10°45′N 106°40′E
          </p>
        </div>
      </div>
    </footer>
  );
}
