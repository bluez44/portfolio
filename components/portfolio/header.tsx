"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { navLinks } from "@/lib/portfolio-data";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const lastScrollY = useRef(0);
  const { theme, setTheme } = useTheme();

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY.current;
      setScrolled(currentScrollY > 12);
      setHidden(scrollingDown && currentScrollY > 120);
      lastScrollY.current = currentScrollY;

      // simple active-section tracker
      const sections = navLinks
        .map((l) => document.querySelector(l.href))
        .filter(Boolean) as HTMLElement[];
      const y = currentScrollY + window.innerHeight * 0.35;
      let current = "";
      for (const s of sections) {
        if (s.offsetTop <= y) current = "#" + s.id;
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isLight = !mounted || theme === "light";
  const toggleTheme = () => setTheme(isLight ? "dark" : "light");

  return (
    <header
      className="fixed inset-x-0 z-60 transition-[transform,background,border-color,backdrop-filter] duration-300 ease-out"
      style={{
        background: scrolled ? "var(--header-bg)" : "transparent",
        borderBottom: scrolled
          ? "1.5px solid var(--ink)"
          : "1.5px solid transparent",
        backdropFilter: scrolled ? "blur(14px) saturate(1.2)" : "none",
        transform: hidden ? "translateY(-110%)" : "translateY(0)",
        top: scrolled ? "0" : "1rem",
      }}
    >
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3.5">
        {/* monogram */}
        <a
          href="#top"
          aria-label="Home"
          className="group flex items-center gap-3"
        >
          <span
            aria-hidden
            className="relative grid h-9 w-9 place-items-center rounded-full border-[1.5px] border-ink bg-blue font-heading text-[13px] font-bold text-paper transition-transform duration-300 group-hover:-rotate-12"
            style={{ boxShadow: "2px 2px 0 var(--ink)" }}
          >
            QV
          </span>
          <span className="font-heading text-[15px] font-semibold tracking-[-0.01em] text-ink">
            Quang Vinh
            <span className="text-tomato">.</span>
          </span>
        </a>

        {/* primary nav */}
        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 md:flex"
        >
          {navLinks.map((link) => {
            const isActive = activeSection === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                className="relative rounded-full px-3.5 py-1.5 text-[13px] font-medium text-ink-2 transition-colors hover:text-ink"
              >
                <span className="relative z-10">{link.label}</span>
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-x-2 bottom-1 -z-0 h-2 bg-canary/85"
                    style={{ borderRadius: "2px" }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* right cluster */}
        <div className="flex items-center gap-2.5">
          {/* theme toggle — sun/moon riso pill */}
          <button
            onClick={toggleTheme}
            aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
            title={isLight ? "Switch to dark mode" : "Switch to light mode"}
            className="relative h-9 w-16 cursor-pointer overflow-hidden rounded-full border-[1.5px] border-ink bg-paper-2 transition-transform hover:-translate-y-0.5"
            style={{ boxShadow: "2px 2px 0 var(--ink)" }}
          >
            <span
              className="absolute top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full border-[1.5px] border-ink transition-[left,background] duration-300"
              style={{
                left: isLight ? "4px" : "34px",
                background: isLight ? "var(--canary)" : "var(--blue)",
              }}
            >
              <span className="text-[10px]">{isLight ? "☀" : "☾"}</span>
            </span>
          </button>

          <a
            href="/Resume - Vo Le Quang Vinh.pdf"
            download
            className="hidden items-center gap-2 rounded-full border-[1.5px] border-ink bg-tomato px-4.5 py-2 text-[13px] font-semibold text-paper transition-all hover:-translate-y-0.5 md:inline-flex"
            style={{ boxShadow: "3px 3px 0 var(--ink)" }}
          >
            Download CV
            <span aria-hidden>↓</span>
          </a>

          <button
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className="flex flex-col items-center justify-center gap-1 rounded-full border-[1.5px] border-ink bg-paper h-9 w-9 md:hidden"
            style={{ boxShadow: "2px 2px 0 var(--ink)" }}
          >
            <span className="block h-[1.5px] w-4 bg-ink" />
            <span className="block h-[1.5px] w-4 bg-ink" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          aria-label="Mobile"
          className="flex flex-col gap-1 border-t-[1.5px] border-ink px-6 pt-3 pb-5"
          style={{ background: "var(--paper)" }}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="border-b border-line py-3 font-heading text-lg font-semibold text-ink"
            >
              {link.label}
            </a>
          ))}
          <a
            href="/Resume - Vo Le Quang Vinh.pdf"
            download
            className="mt-3 rounded-full border-[1.5px] border-ink bg-tomato py-3 text-center font-semibold text-paper"
            style={{ boxShadow: "3px 3px 0 var(--ink)" }}
          >
            Download CV ↓
          </a>
        </nav>
      )}
    </header>
  );
}
