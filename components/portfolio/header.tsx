"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { navLinks } from "@/lib/portfolio-data";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const lastScrollY = useRef(0);
  const { theme, setTheme } = useTheme();

  // Hydration guard: the theme preference from next-themes is only available
  // after mount, so we set mounted=true in this effect to avoid rendering the
  // wrong theme initially. This intentional state update in effect is necessary
  // to prevent a dark/light flash. See react-hooks/set-state-in-effect rule docs.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY.current;

      setScrolled(currentScrollY > 12);
      setHidden(scrollingDown);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isLight = mounted && theme === "light";
  const toggleTheme = () => setTheme(isLight ? "dark" : "light");

  return (
    <header
      className="fixed inset-x-0 z-60 border-b transition-[transform,background,border-color,backdrop-filter] duration-300 ease-out"
      style={{
        background: scrolled ? "var(--header-bg)" : "transparent",
        borderBottomColor: scrolled ? "var(--line)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        transform: hidden ? "translateY(-110%)" : "translateY(0)",
        top: scrolled ? "0" : "1rem",
      }}
    >
      <div className="mx-auto flex max-w-280 items-center justify-between gap-4 px-6 py-3.5">
        <a
          href="#top"
          aria-label="Home"
          className="flex items-center gap-2.5 font-heading text-[17px] font-bold tracking-[0.02em]"
        >
          <span
            aria-hidden
            className="h-2.25 w-2.25 rounded-full bg-accent shadow-[0_0_12px_var(--glow)]"
          />
          Quang Vinh
        </a>
        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted transition-colors hover:text-accent"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label={
              isLight ? "Switch to dark mode" : "Switch to light mode"
            }
            title={isLight ? "Switch to dark mode" : "Switch to light mode"}
            className="relative h-7 w-13 cursor-pointer rounded-full border border-panel-border bg-chip"
          >
            <span
              className="absolute top-0.75 h-5 w-5 rounded-full bg-accent shadow-[0_0_10px_var(--glow)] transition-[left] duration-300"
              style={{ left: isLight ? "27px" : "3px" }}
            />
          </button>
          <a
            href="/Resume - Vo Le Quang Vinh.pdf"
            download
            className="hidden items-center gap-2 rounded-lg border border-accent px-4.5 py-2.25 text-[13.5px] font-semibold text-accent transition hover:bg-accent-dim hover:shadow-[0_0_18px_var(--glow)] md:inline-flex"
          >
            Download CV
          </a>
          <button
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className="flex flex-col gap-1.25 rounded-lg border border-panel-border p-2.5 md:hidden"
          >
            <span className="block h-0.5 w-4.5 bg-fg" />
            <span className="block h-0.5 w-4.5 bg-fg" />
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav
          aria-label="Mobile"
          className="flex flex-col gap-1 border-b border-line px-6 pt-3 pb-5 backdrop-blur-lg"
          style={{ background: "var(--header-bg)" }}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="border-b border-line py-3 text-base font-semibold"
            >
              {link.label}
            </a>
          ))}
          <a
            href="/Resume - Vo Le Quang Vinh.pdf"
            download
            className="mt-3 rounded-lg border border-accent py-3 text-center font-semibold text-accent"
          >
            Download CV
          </a>
        </nav>
      )}
    </header>
  );
}
