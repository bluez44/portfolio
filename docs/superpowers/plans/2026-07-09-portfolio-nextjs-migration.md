# Portfolio Template → Next.js 16 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port `Developer Portfolio Template/Portfolio.dc.html` (a single-file HTML export from a site-builder tool) into the existing Next.js 16 App Router project at `D:\portfolio`, as a set of idiomatic React components, keeping all placeholder content and full interactive fidelity (3D hero/skills scenes, hand-tracking, scroll animation, contact form with real email delivery).

**Architecture:** Section-per-component structure under `components/portfolio/`, animation/3D logic extracted into small hooks and dedicated scene components under `lib/hooks/` and `components/portfolio/*-scene.tsx`. Styling moves from inline styles to Tailwind v4 utility classes backed by CSS custom properties for the dark/light theme. Three.js scenes are rewritten declaratively with `@react-three/fiber` instead of the original imperative Three.js code.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind v4, `next-themes`, `@react-three/fiber` + `three`, `gsap` + `gsap/ScrollTrigger`, `lenis`, `@mediapipe/hands`, `react-hook-form` + `zod` + `@hookform/resolvers`, `resend`. Package manager is **pnpm** (see `pnpm-workspace.yaml`/`pnpm-lock.yaml`) — always use `pnpm`, never `npm`/`yarn`.

## Global Constraints

- Package manager is pnpm. All install/run commands use `pnpm`.
- This repo has no test framework (no Jest/Vitest) and the approved spec (`docs/superpowers/specs/2026-07-09-portfolio-nextjs-migration-design.md`) explicitly excludes adding one, and explicitly excludes manual browser verification during implementation. Each task's verification step is therefore `pnpm exec tsc --noEmit` (typecheck) and `pnpm lint` (ESLint) instead of the usual red/green test cycle. The final task additionally runs `pnpm build` as the only end-to-end gate.
- All content stays as the original placeholder text (`[Your Name]`, `[Tech 1]`, etc.) — do not invent real personal content.
- Accent color is a fixed constant `#3D8BFF` (`ACCENT_COLOR` in `lib/portfolio-data.ts`) — the original builder's runtime-configurable `props.accent` mechanism does not apply here.
- `tsconfig.json` defines path alias `@/*` → project root. Use `@/...` imports, not relative `../../` chains, for anything outside the same folder.
- Tailwind v4 is CSS-first (no `tailwind.config.js`). All theme tokens live in `app/globals.css` under `@theme inline`.
- Every new client-side interactive file that uses hooks/refs/browser APIs must start with `"use client"`.

---

### Task 1: Dependencies, fonts, Tailwind theme tokens

**Files:**
- Modify: `package.json`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Produces: CSS custom properties `--bg`, `--bg2`, `--text`, `--muted`, `--accent`, `--accent-dim`, `--glow`, `--line`, `--panel`, `--panel-strong`, `--panel-border`, `--header-bg`, `--chip` (theme-aware via `[data-theme="light"]`), and Tailwind utilities `bg-bg`, `bg-bg2`, `text-fg`, `text-muted`, `bg-accent`/`text-accent`/`border-accent`, `bg-accent-dim`, `border-line`, `bg-panel`, `bg-panel-strong`, `border-panel-border`, `bg-header-bg`, `bg-chip`. Font CSS variables `--font-space-grotesk` (heading) and `--font-manrope` (body), exposed as `font-heading` / default body font.

- [ ] **Step 1: Install new dependencies**

```bash
pnpm add @react-three/fiber resend
```

Expected: `package.json` gains `@react-three/fiber` (^9) and `resend` (^6) under `dependencies`.

- [ ] **Step 2: Replace `app/globals.css`**

```css
@import "tailwindcss";

:root {
  --bg: #0b0d11;
  --bg2: #0e1218;
  --text: #e9edf2;
  --muted: #96a0ac;
  --accent: #3d8bff;
  --accent-dim: rgba(61, 139, 255, 0.14);
  --glow: rgba(61, 139, 255, 0.35);
  --line: rgba(255, 255, 255, 0.08);
  --panel: rgba(255, 255, 255, 0.04);
  --panel-strong: rgba(17, 22, 30, 0.72);
  --panel-border: rgba(255, 255, 255, 0.09);
  --header-bg: rgba(11, 13, 17, 0.72);
  --chip: rgba(255, 255, 255, 0.06);
}

[data-theme="light"] {
  --bg: #f3f5f8;
  --bg2: #eaeef4;
  --text: #161b22;
  --muted: #5a6572;
  --accent-dim: rgba(61, 139, 255, 0.12);
  --glow: rgba(61, 139, 255, 0.28);
  --line: rgba(12, 22, 34, 0.1);
  --panel: rgba(255, 255, 255, 0.62);
  --panel-strong: rgba(255, 255, 255, 0.82);
  --panel-border: rgba(12, 22, 34, 0.09);
  --header-bg: rgba(243, 245, 248, 0.78);
  --chip: rgba(12, 22, 34, 0.05);
}

@theme inline {
  --color-bg: var(--bg);
  --color-bg2: var(--bg2);
  --color-fg: var(--text);
  --color-muted: var(--muted);
  --color-accent: var(--accent);
  --color-accent-dim: var(--accent-dim);
  --color-line: var(--line);
  --color-panel: var(--panel);
  --color-panel-strong: var(--panel-strong);
  --color-panel-border: var(--panel-border);
  --color-header-bg: var(--header-bg);
  --color-chip: var(--chip);
  --font-heading: var(--font-space-grotesk);
  --font-sans: var(--font-manrope);
}

@keyframes pulse-dot {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-manrope), "Helvetica Neue", Helvetica, sans-serif;
  -webkit-font-smoothing: antialiased;
  transition:
    background 0.35s ease,
    color 0.35s ease;
}

a {
  color: var(--text);
  text-decoration: none;
  transition: color 0.25s ease;
}

::selection {
  background: var(--accent-dim);
  color: var(--text);
}

input:focus-visible,
textarea:focus-visible,
button:focus-visible,
a:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

- [ ] **Step 3: Replace `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Space_Grotesk, Manrope } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "[Your Name] — [Job Title] | Portfolio",
  description:
    "Portfolio of [Your Name], [Job Title]. Projects, skills, experience and contact.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-bg text-fg">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Typecheck and lint**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml app/layout.tsx app/globals.css
git commit -m "chore: add r3f/resend deps and portfolio theme foundation"
```

---

### Task 2: Portfolio data layer

**Files:**
- Create: `lib/portfolio-data.ts`

**Interfaces:**
- Produces: types `NavLink`, `Stat`, `TechItem`, `Project`, `Role`, `EducationEntry`, `Certification`, `SocialLink`; constants `ACCENT_COLOR`, `navLinks`, `stats`, `tierNames`, `tierLegend`, `techs`, `chipTiers`, `projects`, `roles`, `education`, `certifications`, `socials`. Every later component task imports its data from here.

- [ ] **Step 1: Create `lib/portfolio-data.ts`**

```ts
export interface NavLink {
  label: string;
  href: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface TechItem {
  tier: 0 | 1 | 2;
  label: string;
  desc: string;
  prof: number;
  profLabel: string;
  years: string;
}

export interface Project {
  title: string;
  desc: string;
  tags: string[];
}

export interface Role {
  position: string;
  company: string;
  dates: string;
  points: string[];
}

export interface EducationEntry {
  degree: string;
  school: string;
  dates: string;
  note: string;
}

export interface Certification {
  name: string;
  issuer: string;
  year: string;
}

export interface SocialLink {
  label: string;
  value: string;
  href: string;
}

export const ACCENT_COLOR = "#3D8BFF";

export const navLinks: NavLink[] = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

export const stats: Stat[] = [
  { value: "[X]+", label: "Years of experience" },
  { value: "[XX]+", label: "Projects completed" },
  { value: "[XX]", label: "Happy clients / teams" },
];

export const tierNames = ["Languages", "Frameworks", "Tools / DevOps"] as const;

export const tierLegend = [
  { kicker: "Tier 03", name: "Tools / DevOps" },
  { kicker: "Tier 02", name: "Frameworks" },
  { kicker: "Tier 01", name: "Languages · foundations" },
];

export const techs: TechItem[] = [
  { tier: 0, label: "[Tech 1]", desc: "[One-line description of how you use this language and where it shines in your work.]", prof: 90, profLabel: "[Expert]", years: "[X] yrs" },
  { tier: 0, label: "[Tech 2]", desc: "[One-line description of how you use this language.]", prof: 85, profLabel: "[Advanced]", years: "[X] yrs" },
  { tier: 0, label: "[Tech 3]", desc: "[One-line description of how you use this language.]", prof: 75, profLabel: "[Advanced]", years: "[X] yrs" },
  { tier: 0, label: "[Tech 4]", desc: "[One-line description of how you use this language.]", prof: 65, profLabel: "[Proficient]", years: "[X] yrs" },
  { tier: 1, label: "[Tech 5]", desc: "[One-line description of how you use this framework and typical projects built with it.]", prof: 88, profLabel: "[Expert]", years: "[X] yrs" },
  { tier: 1, label: "[Tech 6]", desc: "[One-line description of how you use this framework.]", prof: 80, profLabel: "[Advanced]", years: "[X] yrs" },
  { tier: 1, label: "[Tech 7]", desc: "[One-line description of how you use this framework.]", prof: 72, profLabel: "[Proficient]", years: "[X] yrs" },
  { tier: 1, label: "[Tech 8]", desc: "[One-line description of how you use this framework.]", prof: 68, profLabel: "[Proficient]", years: "[X] yrs" },
  { tier: 2, label: "[Tech 9]", desc: "[One-line description of how you use this tool in your delivery pipeline.]", prof: 82, profLabel: "[Advanced]", years: "[X] yrs" },
  { tier: 2, label: "[Tech 10]", desc: "[One-line description of how you use this tool.]", prof: 70, profLabel: "[Proficient]", years: "[X] yrs" },
  { tier: 2, label: "[Tech 11]", desc: "[One-line description of how you use this tool.]", prof: 60, profLabel: "[Familiar]", years: "[X] yrs" },
];

export const chipTiers = tierNames.map((name, tierIndex) => ({
  name,
  items: techs
    .map((tech, index) => ({ ...tech, index }))
    .filter((tech) => tech.tier === tierIndex)
    .map((tech) => ({ label: tech.label, index: tech.index })),
}));

export const projects: Project[] = [
  { title: "[Project Title 1]", desc: "[Short description — what the project does, who it serves, and one impressive technical detail.]", tags: ["[Tag]", "[Tag]", "[Tag]"] },
  { title: "[Project Title 2]", desc: "[Short description — what the project does and the problem it solves.]", tags: ["[Tag]", "[Tag]"] },
  { title: "[Project Title 3]", desc: "[Short description — highlight measurable impact if possible.]", tags: ["[Tag]", "[Tag]", "[Tag]"] },
  { title: "[Project Title 4]", desc: "[Short description — what the project does and your specific role.]", tags: ["[Tag]", "[Tag]"] },
  { title: "[Project Title 5]", desc: "[Short description — a side project or open-source contribution.]", tags: ["[Tag]", "[Tag]", "[Tag]"] },
  { title: "[Project Title 6]", desc: "[Short description — an experiment, tool, or library you built.]", tags: ["[Tag]", "[Tag]"] },
];

const roleRotations = [-2.2, 1.9, -1.7, 2.4];
const baseRoles: Role[] = [
  { position: "[Position — e.g. Senior Engineer]", company: "[Company 1]", dates: "[2024 — Present]", points: ["[Key achievement with a measurable outcome.]", "[Second achievement — scope, team size, or technology led.]", "[Third achievement — shipped feature, system, or improvement.]"] },
  { position: "[Position]", company: "[Company 2]", dates: "[2022 — 2024]", points: ["[Key achievement with a measurable outcome.]", "[Second achievement.]"] },
  { position: "[Position]", company: "[Company 3]", dates: "[2020 — 2022]", points: ["[Key achievement.]", "[Second achievement.]"] },
  { position: "[Position — e.g. Junior Developer]", company: "[Company 4]", dates: "[2018 — 2020]", points: ["[Where it all started — first role, core skills built.]"] },
];

export const roles: (Role & {
  rotation: number;
  align: "flex-start" | "flex-end";
})[] = baseRoles.map((role, index) => ({
  ...role,
  rotation: roleRotations[index % roleRotations.length],
  align: index % 2 ? "flex-end" : "flex-start",
}));

export const education: EducationEntry[] = [
  { degree: "[Degree — e.g. B.Sc. Computer Science]", school: "[University Name]", dates: "[2014 — 2018]", note: "[Optional note — honors, thesis topic, relevant coursework.]" },
  { degree: "[Degree or Program]", school: "[Institution Name]", dates: "[Year]", note: "[Optional note.]" },
];

export const certifications: Certification[] = [
  { name: "[Certification 1]", issuer: "[Issuing organization]", year: "[Year]" },
  { name: "[Certification 2]", issuer: "[Issuing organization]", year: "[Year]" },
  { name: "[Certification 3]", issuer: "[Issuing organization]", year: "[Year]" },
  { name: "[Course / Nanodegree]", issuer: "[Platform]", year: "[Year]" },
];

export const socials: SocialLink[] = [
  { label: "Email", value: "[you@example.com]", href: "mailto:you@example.com" },
  { label: "GitHub", value: "[github.com/yourhandle]", href: "#" },
  { label: "LinkedIn", value: "[linkedin.com/in/yourhandle]", href: "#" },
  { label: "X / Twitter", value: "[@yourhandle]", href: "#" },
];
```

- [ ] **Step 2: Typecheck and lint**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/portfolio-data.ts
git commit -m "feat: add portfolio placeholder data layer"
```

---

### Task 3: Contact form validation schema

**Files:**
- Create: `lib/schemas/contact.ts`

**Interfaces:**
- Produces: `contactSchema` (zod object), `ContactFormValues` type. Consumed by Task 16 (API route) and Task 17 (form component).

- [ ] **Step 1: Create `lib/schemas/contact.ts`**

```ts
import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name."),
  email: z.string().trim().email("Please enter a valid email address."),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters."),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
```

- [ ] **Step 2: Typecheck and lint**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/schemas/contact.ts
git commit -m "feat: add contact form zod schema"
```

---

### Task 4: Theme provider

**Files:**
- Create: `components/providers/theme-provider.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `<ThemeProvider>` component wrapping `{children}` in the root layout with `attribute="data-theme"`, `defaultTheme="dark"`, `enableSystem={false}`, `storageKey="portfolio-theme"`. Later components call `useTheme()` from `"next-themes"` directly (no custom hook needed).

- [ ] **Step 1: Create `components/providers/theme-provider.tsx`**

```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

- [ ] **Step 2: Wire it into `app/layout.tsx`**

Replace the `<body>` block from Task 1 with:

```tsx
import { ThemeProvider } from "@/components/providers/theme-provider";
```

(add this import alongside the existing ones), and change the body to:

```tsx
      <body className="flex min-h-full flex-col bg-bg text-fg">
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="portfolio-theme"
        >
          {children}
        </ThemeProvider>
        <SpeedInsights />
      </body>
```

- [ ] **Step 3: Typecheck and lint**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/providers/theme-provider.tsx app/layout.tsx
git commit -m "feat: wire next-themes provider into root layout"
```

---

### Task 5: Smooth scroll provider + scroll-reveal hook

**Files:**
- Create: `components/providers/smooth-scroll-provider.tsx`
- Create: `lib/hooks/use-scroll-reveal.ts`
- Modify: `app/layout.tsx`

**Interfaces:**
- Produces: `<SmoothScrollProvider>` (wraps `{children}`, sets up Lenis + gsap ticker + anchor-scroll, no props). `useScrollReveal<T extends HTMLElement>(stagger?: boolean): RefObject<T | null>` — every section component attaches this ref to the element it wants to fade in on scroll (or to the parent of a list of children, when `stagger` is true).

- [ ] **Step 1: Create `components/providers/smooth-scroll-provider.tsx`**

```tsx
"use client";

import { useEffect, type ReactNode } from "react";
import gsap from "gsap";
import Lenis from "lenis";

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });

    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    const onAnchorClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>(
        'a[href^="#"]',
      );
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.length < 2) return;
      const target = document.querySelector<HTMLElement>(href);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { offset: -64, duration: 1.15 });
    };
    document.addEventListener("click", onAnchorClick);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
```

- [ ] **Step 2: Create `lib/hooks/use-scroll-reveal.ts`**

```ts
"use client";

import { useEffect, useRef, type RefObject } from "react";

export function useScrollReveal<T extends HTMLElement>(
  stagger = false,
): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    const targets = stagger ? (Array.from(el.children) as HTMLElement[]) : [el];
    if (targets.length === 0) return;

    const y = stagger ? 22 : 26;
    const duration = stagger ? 0.7 : 0.8;

    targets.forEach((target) => {
      target.style.opacity = "0";
      target.style.transform = `translateY(${y}px)`;
      target.style.transition = `opacity ${duration}s ease, transform ${duration}s ease`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target as HTMLElement;
          const delay = stagger ? targets.indexOf(target) * 0.08 : 0;
          target.style.transitionDelay = `${delay}s`;
          target.style.opacity = "1";
          target.style.transform = "none";
          observer.unobserve(target);
        });
      },
      { threshold: 0.12 },
    );

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, [stagger]);

  return ref;
}
```

- [ ] **Step 3: Wire the provider into `app/layout.tsx`**

Add the import:

```tsx
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
```

Wrap `{children}` inside `<ThemeProvider>` with it:

```tsx
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="portfolio-theme"
        >
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </ThemeProvider>
```

- [ ] **Step 4: Typecheck and lint**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/providers/smooth-scroll-provider.tsx lib/hooks/use-scroll-reveal.ts app/layout.tsx
git commit -m "feat: add lenis smooth scroll provider and scroll-reveal hook"
```

---

### Task 6: Header component

**Files:**
- Create: `components/portfolio/header.tsx`

**Interfaces:**
- Consumes: `navLinks` from `@/lib/portfolio-data`; `useTheme` from `next-themes`.
- Produces: `<Header />` (no props), used by Task 18's `app/page.tsx`.

- [ ] **Step 1: Create `components/portfolio/header.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { navLinks } from "@/lib/portfolio-data";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isLight = mounted && theme === "light";
  const toggleTheme = () => setTheme(isLight ? "dark" : "light");

  return (
    <header
      className="fixed inset-x-0 top-0 z-[60] border-b transition-[background,border-color,backdrop-filter] duration-300"
      style={{
        background: scrolled ? "var(--header-bg)" : "transparent",
        borderBottomColor: scrolled ? "var(--line)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
      }}
    >
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 px-6 py-[14px]">
        <a
          href="#top"
          aria-label="Home"
          className="flex items-center gap-[10px] font-heading text-[17px] font-bold tracking-[0.02em]"
        >
          <span
            aria-hidden
            className="h-[9px] w-[9px] rounded-full bg-accent shadow-[0_0_12px_var(--glow)]"
          />
          [Your Name]
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
            aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
            title={isLight ? "Switch to dark mode" : "Switch to light mode"}
            className="relative h-7 w-[52px] cursor-pointer rounded-full border border-panel-border bg-chip"
          >
            <span
              className="absolute top-[3px] h-5 w-5 rounded-full bg-accent shadow-[0_0_10px_var(--glow)] transition-[left] duration-300"
              style={{ left: isLight ? "27px" : "3px" }}
            />
          </button>
          <a
            href="#"
            download
            className="hidden items-center gap-2 rounded-lg border border-accent px-[18px] py-[9px] text-[13.5px] font-semibold text-accent transition hover:bg-accent-dim hover:shadow-[0_0_18px_var(--glow)] md:inline-flex"
          >
            Download CV
          </a>
          <button
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className="flex flex-col gap-[5px] rounded-lg border border-panel-border p-[10px] md:hidden"
          >
            <span className="block h-0.5 w-[18px] bg-fg" />
            <span className="block h-0.5 w-[18px] bg-fg" />
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
            href="#"
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
```

- [ ] **Step 2: Typecheck and lint**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/portfolio/header.tsx
git commit -m "feat: add portfolio header with theme toggle and mobile menu"
```

---

### Task 7: Hero section (R3F particle scene)

**Files:**
- Create: `components/portfolio/canvas-error-boundary.tsx`
- Create: `components/portfolio/hero-scene.tsx`
- Create: `components/portfolio/hero.tsx`

**Interfaces:**
- Produces: `<CanvasErrorBoundary fallback={ReactNode}>` (class component, catches render errors from its children and shows `fallback` instead — reused by Task 11's Skills section). `<HeroScene accent tParticlesEnabled visible reducedMotion />` (default export named `HeroScene`, R3F `<Canvas>`-based). `<Hero />` (no props), used by Task 18's `app/page.tsx`.

- [ ] **Step 1: Create `components/portfolio/canvas-error-boundary.tsx`**

```tsx
"use client";

import { Component, type ReactNode } from "react";

interface CanvasErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface CanvasErrorBoundaryState {
  hasError: boolean;
}

export class CanvasErrorBoundary extends Component<
  CanvasErrorBoundaryProps,
  CanvasErrorBoundaryState
> {
  state: CanvasErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): CanvasErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("WebGL scene failed to initialize", error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
```

- [ ] **Step 2: Create `components/portfolio/hero-scene.tsx`**

```tsx
"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function ParticleField({
  accent,
  reducedMotion,
}: {
  accent: string;
  reducedMotion: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const isMobile = window.innerWidth < 700;
    const count = reducedMotion ? 250 : isMobile ? 350 : 700;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 13;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return pos;
  }, [reducedMotion]);

  useFrame(() => {
    if (reducedMotion || !pointsRef.current) return;
    pointsRef.current.rotation.y += 0.00045;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={accent}
        size={0.045}
        transparent
        opacity={0.55}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

function HeroGrid({ accent }: { accent: string }) {
  const grid = useMemo(
    () => new THREE.GridHelper(40, 36, accent as unknown as THREE.Color, accent as unknown as THREE.Color),
    [accent],
  );

  useEffect(() => {
    const material = grid.material as THREE.Material;
    material.transparent = true;
    material.opacity = 0.07;
  }, [grid]);

  return <primitive object={grid} position={[0, -4.2, 0]} />;
}

function HeroCameraRig({ reducedMotion }: { reducedMotion: boolean }) {
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (reducedMotion) return;
    const onPointerMove = (event: PointerEvent) => {
      pointer.current.x = event.clientX / window.innerWidth - 0.5;
      pointer.current.y = event.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [reducedMotion]);

  useFrame(({ camera }) => {
    if (reducedMotion) return;
    camera.position.x += (pointer.current.x * 0.9 - camera.position.x) * 0.03;
    camera.position.y +=
      (0.4 - pointer.current.y * 0.6 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

interface HeroSceneProps {
  accent: string;
  visible: boolean;
  reducedMotion: boolean;
}

export function HeroScene({ accent, visible, reducedMotion }: HeroSceneProps) {
  return (
    <Canvas
      style={{ position: "absolute", inset: 0 }}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      dpr={[1, 2]}
      camera={{ fov: 58, near: 0.1, far: 100, position: [0, 0.4, 9] }}
      frameloop={visible ? "always" : "never"}
    >
      <ParticleField accent={accent} reducedMotion={reducedMotion} />
      <HeroGrid accent={accent} />
      <HeroCameraRig reducedMotion={reducedMotion} />
    </Canvas>
  );
}
```

- [ ] **Step 3: Create `components/portfolio/hero.tsx`**

```tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { CanvasErrorBoundary } from "./canvas-error-boundary";
import { ACCENT_COLOR } from "@/lib/portfolio-data";

const HeroScene = dynamic(
  () => import("./hero-scene").then((mod) => mod.HeroScene),
  { ssr: false },
);

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.02 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      <CanvasErrorBoundary fallback={null}>
        <HeroScene
          accent={ACCENT_COLOR}
          visible={visible}
          reducedMotion={reducedMotion}
        />
      </CanvasErrorBoundary>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 45%, transparent 30%, var(--bg) 100%)",
        }}
      />
      <div className="relative z-10 mx-auto w-full max-w-[1120px] px-6 pt-[120px] pb-20">
        <p className="mb-[18px] flex items-center font-mono text-[13px] tracking-[0.18em] text-accent uppercase">
          <span
            aria-hidden
            className="mr-[10px] inline-block h-[7px] w-[7px] rounded-full bg-accent shadow-[0_0_10px_var(--glow)]"
            style={{ animation: "pulse-dot 2.4s ease-in-out infinite" }}
          />
          Available for work
        </p>
        <h1 className="font-heading text-[clamp(2.7rem,7.5vw,5.4rem)] leading-[1.04] font-bold tracking-[-0.02em]">
          [Your Name]
        </h1>
        <p className="mt-[18px] font-heading text-[clamp(1.25rem,2.6vw,1.8rem)] font-medium text-accent">
          [Job Title]
        </p>
        <p className="mt-[22px] max-w-[560px] text-[clamp(1rem,1.6vw,1.125rem)] leading-[1.7] text-muted">
          [A short tagline — one or two sentences about what you build, the
          problems you solve, and what makes your work distinctive.]
        </p>
        <div className="mt-[38px] flex flex-wrap gap-[14px]">
          <a
            href="#projects"
            className="rounded-lg bg-accent px-[26px] py-[13px] text-[15px] font-semibold text-white shadow-[0_0_24px_var(--glow)] transition hover:-translate-y-0.5 hover:shadow-[0_0_36px_var(--glow)]"
          >
            View Projects
          </a>
          <a
            href="#contact"
            className="rounded-lg border border-panel-border bg-panel px-[26px] py-[13px] text-[15px] font-semibold backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-accent hover:text-accent"
          >
            Contact Me
          </a>
        </div>
      </div>
      <a
        href="#about"
        aria-label="Scroll to About"
        className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[12px] tracking-[0.2em] text-muted uppercase"
      >
        scroll
        <span
          aria-hidden
          className="h-[34px] w-px"
          style={{ background: "linear-gradient(var(--accent), transparent)" }}
        />
      </a>
    </section>
  );
}
```

- [ ] **Step 4: Typecheck and lint**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/portfolio/canvas-error-boundary.tsx components/portfolio/hero-scene.tsx components/portfolio/hero.tsx
git commit -m "feat: add hero section with r3f particle scene"
```

---

### Task 8: About section

**Files:**
- Create: `components/portfolio/about.tsx`

**Interfaces:**
- Consumes: `stats` from `@/lib/portfolio-data`; `useScrollReveal` from `@/lib/hooks/use-scroll-reveal`.
- Produces: `<About />` (no props), used by Task 18's `app/page.tsx`.

- [ ] **Step 1: Create `components/portfolio/about.tsx`**

```tsx
"use client";

import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";
import { stats } from "@/lib/portfolio-data";

export function About() {
  const revealRef = useScrollReveal<HTMLDivElement>();
  const statsRef = useScrollReveal<HTMLDivElement>(true);

  return (
    <section id="about" className="px-6 py-[clamp(72px,10vw,120px)]">
      <div ref={revealRef} className="mx-auto max-w-[1120px]">
        <p className="mb-[10px] font-mono text-[12.5px] tracking-[0.18em] text-accent uppercase">
          01 / About
        </p>
        <h2 className="mb-11 font-heading text-[clamp(1.8rem,4vw,2.6rem)] font-bold tracking-[-0.01em]">
          A little about me
        </h2>
        <div className="grid items-start gap-11 [grid-template-columns:repeat(auto-fit,minmax(290px,1fr))]">
          <div className="relative max-w-[380px]">
            <div
              role="img"
              aria-label="Portrait placeholder — replace with your photo"
              className="flex aspect-[4/5] items-center justify-center rounded-2xl border border-panel-border bg-bg2"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(-45deg, var(--panel) 0 12px, transparent 12px 24px)",
              }}
            >
              <span className="font-mono text-xs tracking-[0.08em] text-muted">
                [ portrait photo ]
              </span>
            </div>
            <div
              aria-hidden
              className="absolute -z-10 rounded-2xl border"
              style={{
                inset: "14px -14px -14px 14px",
                borderColor: "var(--accent-dim)",
              }}
            />
          </div>
          <div>
            <p className="text-[16.5px] leading-[1.85] text-muted">
              [Short bio — a few sentences about your background, the kind of
              engineering you love, notable domains you&apos;ve worked in,
              and what you&apos;re looking for next. Keep it human and
              specific.]
            </p>
            <p className="mt-[18px] text-[16.5px] leading-[1.85] text-muted">
              [Optional second paragraph — interests outside of code,
              open-source work, writing, or community involvement.]
            </p>
            <div
              ref={statsRef}
              className="mt-[38px] grid gap-[14px] [grid-template-columns:repeat(auto-fit,minmax(130px,1fr))]"
            >
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-panel-border bg-panel p-[20px_18px] backdrop-blur-sm"
                >
                  <p className="font-heading text-[30px] font-bold text-accent">
                    {stat.value}
                  </p>
                  <p className="mt-[6px] text-[13px] text-muted">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/portfolio/about.tsx
git commit -m "feat: add about section"
```

---

### Task 9: Tech scene (R3F skills 3D)

**Files:**
- Create: `components/portfolio/tech-scene.tsx`

**Interfaces:**
- Consumes: `TechItem` type from `@/lib/portfolio-data`.
- Produces: `export interface TechSceneHandle { focusTech(index: number): void; closeFocus(): void; setRotationTarget(rotY: number, tilt: number): void; }`, `export interface TechSceneProps { techs: TechItem[]; accent: string; reducedMotion: boolean; visible: boolean; focusedIndex: number | null; onFocus: (index: number | null) => void; }`, `export const TechScene = forwardRef<TechSceneHandle, TechSceneProps>(...)`. Consumed by Task 10 (hand-tracking hook needs the `TechSceneHandle` type) and Task 11 (Skills section renders `<TechScene ref={...} .../>`).

- [ ] **Step 1: Create `components/portfolio/tech-scene.tsx`**

```tsx
"use client";

import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  type MutableRefObject,
} from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { TechItem } from "@/lib/portfolio-data";

export interface TechSceneHandle {
  focusTech: (index: number) => void;
  closeFocus: () => void;
  setRotationTarget: (rotY: number, tilt: number) => void;
}

export interface TechSceneProps {
  techs: TechItem[];
  accent: string;
  reducedMotion: boolean;
  visible: boolean;
  focusedIndex: number | null;
  onFocus: (index: number | null) => void;
}

const TIERS = [
  { y: -1.7, r: 2.5, dir: 1 },
  { y: 0.25, r: 2.0, dir: -1 },
  { y: 2.05, r: 1.5, dir: 1 },
] as const;

const CAMERA_HOME = new THREE.Vector3(0, 0.7, 8.4);

function buildTierGeometry(tier: number): THREE.BufferGeometry {
  if (tier === 0) return new THREE.IcosahedronGeometry(0.3, 0);
  if (tier === 1) return new THREE.OctahedronGeometry(0.32, 0);
  return new THREE.DodecahedronGeometry(0.28, 0);
}

function computeTechPosition(
  tier: (typeof TIERS)[number],
  tierIndex: number,
  angle0: number,
  orbitTime: number,
  index: number,
  reducedMotion: boolean,
): THREE.Vector3 {
  const angle = reducedMotion
    ? angle0
    : angle0 + orbitTime * tier.dir * (1 + tierIndex * 0.18);
  const y =
    tier.y + (reducedMotion ? 0 : Math.sin(orbitTime * 1.3 + index) * 0.07);
  return new THREE.Vector3(Math.cos(angle) * tier.r, y, Math.sin(angle) * tier.r);
}

interface TechMeshProps {
  tech: TechItem;
  index: number;
  angle0: number;
  accent: string;
  reducedMotion: boolean;
  focused: boolean;
  dimmed: boolean;
  growRef: MutableRefObject<number>;
  orbitTimeRef: MutableRefObject<number>;
  dragMovedRef: MutableRefObject<number>;
  onSelect: (index: number) => void;
}

function TechMesh({
  tech,
  index,
  angle0,
  accent,
  reducedMotion,
  focused,
  dimmed,
  growRef,
  orbitTimeRef,
  dragMovedRef,
  onSelect,
}: TechMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const scaleRef = useRef(0.001);
  const opacityRef = useRef(0);
  const hoveredRef = useRef(false);
  const tier = TIERS[tech.tier];

  const geometry = useMemo(() => buildTierGeometry(tech.tier), [tech.tier]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const grow = growRef.current;
    const ease = grow < 1 ? 1 - Math.pow(1 - grow, 3) : 1;
    const tierReveal = Math.max(
      0,
      Math.min(1, (ease - (0.25 + tech.tier * 0.22)) / 0.25),
    );

    mesh.position.copy(
      computeTechPosition(
        tier,
        tech.tier,
        angle0,
        orbitTimeRef.current,
        index,
        reducedMotion,
      ),
    );

    let targetScale = tierReveal;
    if (focused) targetScale *= 1.5;
    else if (hoveredRef.current) targetScale *= 1.25;
    scaleRef.current += (targetScale - scaleRef.current) * 0.12;
    mesh.scale.setScalar(Math.max(0.001, scaleRef.current));

    if (!reducedMotion) {
      mesh.rotation.y += 0.4 / 60;
      mesh.rotation.x += 0.15 / 60;
    }

    const targetOpacity = dimmed ? 0.13 : 1;
    opacityRef.current += (targetOpacity - opacityRef.current) * 0.1;
    const material = mesh.material as THREE.MeshStandardMaterial;
    material.opacity = opacityRef.current;
    material.emissiveIntensity = focused || hoveredRef.current ? 0.9 : 0.3;

    const wire = mesh.children[0] as THREE.LineSegments | undefined;
    const wireMaterial = wire?.material as THREE.LineBasicMaterial | undefined;
    if (wireMaterial) {
      wireMaterial.opacity =
        opacityRef.current * (focused || hoveredRef.current ? 0.95 : 0.5);
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      onPointerOver={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        if (dragMovedRef.current > 0) return;
        hoveredRef.current = true;
      }}
      onPointerOut={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        hoveredRef.current = false;
      }}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        if (dragMovedRef.current >= 12) return;
        onSelect(index);
      }}
    >
      <meshStandardMaterial
        color={0x232c3a}
        emissive={accent}
        emissiveIntensity={0.3}
        roughness={0.35}
        metalness={0.45}
        transparent
        opacity={0}
      />
      <lineSegments>
        <primitive object={edges} attach="geometry" />
        <lineBasicMaterial color={accent} transparent opacity={0.5} />
      </lineSegments>
    </mesh>
  );
}

function TechTrunk({
  accent,
  growRef,
}: {
  accent: string;
  growRef: MutableRefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const tipMaterialRef = useRef<THREE.MeshBasicMaterial>(null);

  const trunkMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x2a3442,
        emissive: accent,
        emissiveIntensity: 0.35,
        roughness: 0.4,
        metalness: 0.3,
      }),
    [accent],
  );

  const trunkGeometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.035, 0.11, 5.8, 10);
    geo.translate(0, 2.9, 0);
    return geo;
  }, []);

  const roots = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => {
        const geo = new THREE.CylinderGeometry(0.012, 0.05, 1.1, 6);
        geo.translate(0, -0.55, 0);
        const angle = (i / 5) * Math.PI * 2;
        return {
          geo,
          rotationZ: Math.cos(angle) * 0.85,
          rotationX: Math.sin(angle) * 0.85,
        };
      }),
    [],
  );

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    const grow = growRef.current;
    const ease = grow < 1 ? 1 - Math.pow(1 - grow, 3) : 1;
    group.scale.y = Math.max(0.001, ease);
    if (tipMaterialRef.current) tipMaterialRef.current.opacity = ease;
  });

  return (
    <group ref={groupRef} position={[0, -2.9, 0]}>
      <mesh geometry={trunkGeometry} material={trunkMaterial} />
      {roots.map((root, i) => (
        <mesh
          key={i}
          geometry={root.geo}
          material={trunkMaterial}
          rotation={[root.rotationX, 0, root.rotationZ]}
        />
      ))}
      <mesh position={[0, 5.85, 0]}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshBasicMaterial ref={tipMaterialRef} color={accent} transparent opacity={0} />
      </mesh>
    </group>
  );
}

function OrbitRings({ accent }: { accent: string }) {
  return (
    <>
      {TIERS.map((tier, i) => (
        <mesh key={i} position={[0, tier.y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[tier.r, 0.005, 8, 90]} />
          <meshBasicMaterial color={accent} transparent opacity={0.16} />
        </mesh>
      ))}
    </>
  );
}

function TechLights({ accent }: { accent: string }) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <pointLight color={accent} intensity={1.1} distance={40} position={[3, 5, 5]} />
      <pointLight color={0xffffff} intensity={0.35} distance={40} position={[-4, -2, 4]} />
    </>
  );
}

function DragCatcher({
  rotYTargetRef,
  tiltTargetRef,
  dragMovedRef,
}: {
  rotYTargetRef: MutableRefObject<number>;
  tiltTargetRef: MutableRefObject<number>;
  dragMovedRef: MutableRefObject<number>;
}) {
  const draggingRef = useRef(false);
  const lastRef = useRef({ x: 0, y: 0 });

  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    draggingRef.current = true;
    dragMovedRef.current = 0;
    lastRef.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!draggingRef.current) return;
    const dx = event.clientX - lastRef.current.x;
    const dy = event.clientY - lastRef.current.y;
    lastRef.current = { x: event.clientX, y: event.clientY };
    dragMovedRef.current += Math.abs(dx) + Math.abs(dy);
    rotYTargetRef.current += dx * 0.006;
    tiltTargetRef.current = Math.max(
      -0.5,
      Math.min(0.5, tiltTargetRef.current + dy * 0.003),
    );
  };
  const onPointerUp = () => {
    draggingRef.current = false;
  };

  return (
    <mesh
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerOut={onPointerUp}
    >
      <sphereGeometry args={[20, 8, 8]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.BackSide} />
    </mesh>
  );
}

function TechCameraRig({
  techs,
  angle0s,
  focusedIndex,
  orbitTimeRef,
  rotYRef,
  tiltRef,
  reducedMotion,
}: {
  techs: TechItem[];
  angle0s: number[];
  focusedIndex: number | null;
  orbitTimeRef: MutableRefObject<number>;
  rotYRef: MutableRefObject<number>;
  tiltRef: MutableRefObject<number>;
  reducedMotion: boolean;
}) {
  const camTarget = useRef(CAMERA_HOME.clone());
  const lookTarget = useRef(new THREE.Vector3(0, 0, 0));
  const look = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(({ camera }) => {
    if (focusedIndex !== null) {
      const tech = techs[focusedIndex];
      const tier = TIERS[tech.tier];
      const localPos = computeTechPosition(
        tier,
        tech.tier,
        angle0s[focusedIndex],
        orbitTimeRef.current,
        focusedIndex,
        reducedMotion,
      );
      const euler = new THREE.Euler(tiltRef.current * 0.4, rotYRef.current, 0);
      const worldPos = localPos.clone().applyEuler(euler);
      const dir = worldPos
        .clone()
        .sub(new THREE.Vector3(0, worldPos.y, 0))
        .normalize();
      camTarget.current
        .copy(worldPos)
        .add(dir.multiplyScalar(2.1))
        .add(new THREE.Vector3(0, 0.35, 0));
      lookTarget.current.copy(worldPos);
    } else {
      camTarget.current.copy(CAMERA_HOME);
      lookTarget.current.set(0, 0, 0);
    }
    camera.position.lerp(camTarget.current, 0.06);
    look.current.lerp(lookTarget.current, 0.08);
    camera.lookAt(look.current);
  });

  return null;
}

interface TechWorldProps {
  techs: TechItem[];
  accent: string;
  reducedMotion: boolean;
  growStarted: boolean;
  focusedIndex: number | null;
  onFocus: (index: number | null) => void;
}

const TechWorld = forwardRef<TechSceneHandle, TechWorldProps>(
  function TechWorld(
    { techs, accent, reducedMotion, growStarted, focusedIndex, onFocus },
    ref,
  ) {
    const worldGroupRef = useRef<THREE.Group>(null);
    const growRef = useRef(0);
    const orbitTimeRef = useRef(0);
    const rotYRef = useRef(0);
    const rotYTargetRef = useRef(0);
    const tiltRef = useRef(0);
    const tiltTargetRef = useRef(0);
    const dragMovedRef = useRef(0);

    const angle0s = useMemo(() => {
      const perTier = [0, 0, 0];
      techs.forEach((tech) => perTier[tech.tier]++);
      const counters = [0, 0, 0];
      return techs.map((tech) => {
        const angle = (counters[tech.tier] / perTier[tech.tier]) * Math.PI * 2;
        counters[tech.tier]++;
        return angle;
      });
    }, [techs]);

    useImperativeHandle(
      ref,
      () => ({
        focusTech: (index: number) => onFocus(index),
        closeFocus: () => onFocus(null),
        setRotationTarget: (rotY: number, tilt: number) => {
          rotYTargetRef.current = rotY;
          tiltTargetRef.current = Math.max(-0.5, Math.min(0.5, tilt));
        },
      }),
      [onFocus],
    );

    useFrame((_, delta) => {
      if (growStarted && growRef.current < 1) {
        growRef.current = Math.min(1, growRef.current + delta * 0.7);
      }
      if (focusedIndex === null && !reducedMotion) {
        orbitTimeRef.current += delta * 0.18;
      }
      rotYRef.current += (rotYTargetRef.current - rotYRef.current) * 0.07;
      tiltRef.current += (tiltTargetRef.current - tiltRef.current) * 0.07;
      const group = worldGroupRef.current;
      if (group) {
        group.rotation.y = rotYRef.current;
        group.rotation.x = tiltRef.current * 0.4;
      }
    });

    return (
      <>
        <TechLights accent={accent} />
        <DragCatcher
          rotYTargetRef={rotYTargetRef}
          tiltTargetRef={tiltTargetRef}
          dragMovedRef={dragMovedRef}
        />
        <group ref={worldGroupRef}>
          <TechTrunk accent={accent} growRef={growRef} />
          <OrbitRings accent={accent} />
          {techs.map((tech, index) => (
            <TechMesh
              key={tech.label}
              tech={tech}
              index={index}
              angle0={angle0s[index]}
              accent={accent}
              reducedMotion={reducedMotion}
              focused={focusedIndex === index}
              dimmed={focusedIndex !== null && focusedIndex !== index}
              growRef={growRef}
              orbitTimeRef={orbitTimeRef}
              dragMovedRef={dragMovedRef}
              onSelect={onFocus}
            />
          ))}
        </group>
        <TechCameraRig
          techs={techs}
          angle0s={angle0s}
          focusedIndex={focusedIndex}
          orbitTimeRef={orbitTimeRef}
          rotYRef={rotYRef}
          tiltRef={tiltRef}
          reducedMotion={reducedMotion}
        />
      </>
    );
  },
);

export const TechScene = forwardRef<TechSceneHandle, TechSceneProps>(
  function TechScene(
    { techs, accent, reducedMotion, visible, focusedIndex, onFocus },
    ref,
  ) {
    const growStartedRef = useRef(false);
    if (visible) growStartedRef.current = true;

    return (
      <Canvas
        style={{ display: "block", width: "100%", height: "100%" }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
        camera={{ fov: 50, near: 0.1, far: 100, position: [0, 0.7, 8.4] }}
        frameloop={visible ? "always" : "never"}
      >
        <TechWorld
          ref={ref}
          techs={techs}
          accent={accent}
          reducedMotion={reducedMotion}
          growStarted={growStartedRef.current}
          focusedIndex={focusedIndex}
          onFocus={onFocus}
        />
      </Canvas>
    );
  },
);
```

- [ ] **Step 2: Typecheck and lint**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/portfolio/tech-scene.tsx
git commit -m "feat: add r3f orbiting tech-tree scene"
```

---

### Task 10: Hand-tracking hook

**Files:**
- Create: `lib/hooks/use-hand-tracking.ts`

**Interfaces:**
- Consumes: `TechSceneHandle` type from `@/components/portfolio/tech-scene`; `Hands`/`Results` types from `@mediapipe/hands` (dynamically imported at call time, not at module top level).
- Produces: `useHandTracking({ sceneRef, focusedIndex, techCount }): { handOn: boolean; handStatus: string; toggleHands: () => void }`. Consumed by Task 11's Skills section.

- [ ] **Step 1: Create `lib/hooks/use-hand-tracking.ts`**

```ts
"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { Hands as HandsInstance } from "@mediapipe/hands";
import type { TechSceneHandle } from "@/components/portfolio/tech-scene";

interface UseHandTrackingOptions {
  sceneRef: RefObject<TechSceneHandle | null>;
  focusedIndex: number | null;
  techCount: number;
}

export function useHandTracking({
  sceneRef,
  focusedIndex,
  techCount,
}: UseHandTrackingOptions) {
  const [handOn, setHandOn] = useState(false);
  const [handStatus, setHandStatus] = useState("");
  const streamRef = useRef<MediaStream | null>(null);
  const handsRef = useRef<HandsInstance | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aliveRef = useRef(false);
  const cycleRef = useRef(-1);
  const lastPinchRef = useRef(0);
  const focusedIndexRef = useRef(focusedIndex);
  focusedIndexRef.current = focusedIndex;

  const stopHands = useCallback(() => {
    aliveRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    handsRef.current?.close();
    handsRef.current = null;
  }, []);

  useEffect(() => stopHands, [stopHands]);

  const startHands = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Camera API unavailable");
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 320, height: 240 },
    });
    const video = document.createElement("video");
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    await video.play();
    streamRef.current = stream;

    const { Hands } = await import("@mediapipe/hands");
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 0,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results) => {
      const scene = sceneRef.current;
      const landmarks = results.multiHandLandmarks[0];
      if (!scene || !landmarks) return;

      scene.setRotationTarget((0.5 - landmarks[0].x) * 5, (landmarks[0].y - 0.5) * 0.8);

      const pinchDistance = Math.hypot(
        landmarks[4].x - landmarks[8].x,
        landmarks[4].y - landmarks[8].y,
      );
      const now = performance.now();
      if (pinchDistance < 0.05 && now - lastPinchRef.current > 1200) {
        lastPinchRef.current = now;
        if (focusedIndexRef.current === null) {
          cycleRef.current = (cycleRef.current + 1) % techCount;
          scene.focusTech(cycleRef.current);
        } else {
          scene.closeFocus();
        }
      }
    });

    handsRef.current = hands;
    aliveRef.current = true;

    const pump = async () => {
      if (!aliveRef.current) return;
      try {
        await hands.send({ image: video });
      } catch {
        // frame skipped, keep pumping
      }
      timerRef.current = setTimeout(pump, 90);
    };
    pump();

    setHandStatus(
      "Hand control active — move your hand to rotate, pinch to focus/close.",
    );
  }, [sceneRef, techCount]);

  const toggleHands = useCallback(() => {
    if (handOn) {
      stopHands();
      setHandOn(false);
      setHandStatus("Hand control off — mouse/touch active.");
      return;
    }
    setHandOn(true);
    setHandStatus("Loading hand-tracking…");
    startHands().catch((error) => {
      console.warn(error);
      stopHands();
      setHandOn(false);
      setHandStatus(
        "Hand-tracking unavailable (camera denied or unsupported) — mouse control still works great.",
      );
    });
  }, [handOn, startHands, stopHands]);

  return { handOn, handStatus, toggleHands };
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/hooks/use-hand-tracking.ts
git commit -m "feat: add mediapipe hand-tracking hook"
```

---

### Task 11: Tech focus panel + Skills section

**Files:**
- Create: `components/portfolio/tech-focus-panel.tsx`
- Create: `components/portfolio/skills.tsx`

**Interfaces:**
- Consumes: `TechScene`/`TechSceneHandle` from Task 9; `useHandTracking` from Task 10; `useScrollReveal` from Task 5; `ACCENT_COLOR`, `chipTiers`, `techs`, `tierLegend`, `TechItem` from `@/lib/portfolio-data`; `CanvasErrorBoundary` from Task 7.
- Produces: `<TechFocusPanel tech={TechItem} onClose={() => void} />`. `<Skills />` (no props), used by Task 18's `app/page.tsx`.

- [ ] **Step 1: Create `components/portfolio/tech-focus-panel.tsx`**

```tsx
"use client";

import type { TechItem } from "@/lib/portfolio-data";

const TIER_NAMES = ["Languages", "Frameworks", "Tools / DevOps"];

export function TechFocusPanel({
  tech,
  onClose,
}: {
  tech: TechItem;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-label="Technology details"
      className="pointer-events-none absolute top-4 right-4 bottom-4 flex w-[min(320px,calc(100%-32px))] flex-col justify-center"
    >
      <div
        className="pointer-events-auto rounded-2xl border border-panel-border p-6 shadow-[0_12px_44px_rgba(0,0,0,.35)] backdrop-blur-xl"
        style={{ background: "var(--panel-strong)" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] tracking-[0.14em] text-accent uppercase">
              {TIER_NAMES[tech.tier]}
            </p>
            <h3 className="mt-[6px] font-heading text-[22px] font-bold">
              {tech.label}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close details and return to full view"
            className="flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-panel-border bg-chip text-[15px] leading-none transition hover:border-accent hover:text-accent"
          >
            ×
          </button>
        </div>
        <p className="mt-[14px] text-sm leading-[1.7] text-muted">{tech.desc}</p>
        <div className="mt-[18px]">
          <div className="mb-[6px] flex justify-between text-[12.5px] text-muted">
            <span>Proficiency</span>
            <span className="font-semibold text-fg">{tech.profLabel}</span>
          </div>
          <div className="h-[5px] overflow-hidden rounded-full bg-chip">
            <div
              className="h-full rounded-full bg-accent shadow-[0_0_10px_var(--glow)] transition-[width] duration-500"
              style={{ width: `${tech.prof}%` }}
            />
          </div>
        </div>
        <p className="mt-[14px] text-[13px] text-muted">
          Experience — <span className="font-semibold text-fg">{tech.years}</span>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `components/portfolio/skills.tsx`**

```tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { CanvasErrorBoundary } from "./canvas-error-boundary";
import { TechFocusPanel } from "./tech-focus-panel";
import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";
import { useHandTracking } from "@/lib/hooks/use-hand-tracking";
import { ACCENT_COLOR, chipTiers, techs, tierLegend } from "@/lib/portfolio-data";
import type { TechSceneHandle } from "./tech-scene";

const TechScene = dynamic(
  () => import("./tech-scene").then((mod) => mod.TechScene),
  { ssr: false },
);

function WebglFallback() {
  return (
    <div
      className="flex h-[clamp(360px,50vh,520px)] items-center justify-center"
      style={{
        backgroundImage:
          "repeating-linear-gradient(-45deg, var(--panel) 0 12px, transparent 12px 24px)",
      }}
    >
      <p className="font-mono text-[13px] text-muted">
        [ 3D unavailable on this device — skills listed below ]
      </p>
    </div>
  );
}

export function Skills() {
  const revealRef = useScrollReveal<HTMLDivElement>();
  const chipsRef = useScrollReveal<HTMLDivElement>(true);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<TechSceneHandle>(null);

  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  useEffect(() => {
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { handOn, handStatus, toggleHands } = useHandTracking({
    sceneRef,
    focusedIndex,
    techCount: techs.length,
  });

  const focusedTech = focusedIndex !== null ? techs[focusedIndex] : null;

  return (
    <section
      id="skills"
      className="border-y border-line px-6 py-[clamp(72px,10vw,120px)]"
      style={{ background: "var(--bg2)" }}
    >
      <div className="mx-auto max-w-[1120px]">
        <div ref={revealRef}>
          <p className="mb-[10px] font-mono text-[12.5px] tracking-[0.18em] text-accent uppercase">
            02 / Skills
          </p>
          <h2 className="mb-3 font-heading text-[clamp(1.8rem,4vw,2.6rem)] font-bold tracking-[-0.01em]">
            The knowledge path
          </h2>
          <p className="mb-8 max-w-[600px] text-[15.5px] leading-[1.7] text-muted">
            A living map of my stack — foundations at the root, specialized
            tools at the crown. Drag to orbit, click a node (or a chip below)
            to inspect it.
          </p>
        </div>

        <div
          ref={wrapperRef}
          className="relative overflow-hidden rounded-2xl border border-panel-border bg-bg"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 70% at 50% 40%, var(--accent-dim) 0%, transparent 55%)",
          }}
        >
          <CanvasErrorBoundary fallback={<WebglFallback />}>
            <div className="h-[clamp(420px,62vh,640px)] cursor-grab [touch-action:pan-y]">
              <TechScene
                ref={sceneRef}
                techs={techs}
                accent={ACCENT_COLOR}
                reducedMotion={reducedMotion}
                visible={visible}
                focusedIndex={focusedIndex}
                onFocus={setFocusedIndex}
              />
            </div>
          </CanvasErrorBoundary>

          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-5 hidden -translate-y-1/2 flex-col gap-11 md:flex"
          >
            {tierLegend.map((tier) => (
              <div key={tier.kicker} className="flex items-center gap-[10px]">
                <span className="h-px w-[22px] bg-accent opacity-60" />
                <div>
                  <p className="font-mono text-[11px] tracking-[0.14em] text-accent uppercase">
                    {tier.kicker}
                  </p>
                  <p className="mt-[2px] text-[12.5px] text-muted">{tier.name}</p>
                </div>
              </div>
            ))}
          </div>

          {focusedTech && (
            <TechFocusPanel
              tech={focusedTech}
              onClose={() => sceneRef.current?.closeFocus()}
            />
          )}

          <div className="absolute bottom-[14px] left-4 flex flex-wrap items-center gap-[10px]">
            <button
              onClick={toggleHands}
              aria-pressed={handOn}
              className="rounded-full border px-[14px] py-2 text-xs font-semibold backdrop-blur-md transition hover:border-accent hover:text-accent"
              style={{
                borderColor: handOn ? "var(--accent)" : "var(--panel-border)",
                background: handOn ? "var(--accent-dim)" : "var(--panel-strong)",
                color: handOn ? "var(--accent)" : "var(--muted)",
              }}
            >
              {handOn ? "✕ Disable hand control" : "Enable hand control (webcam)"}
            </button>
            {handStatus && (
              <p role="status" className="max-w-[320px] text-xs text-muted">
                {handStatus}
              </p>
            )}
          </div>
        </div>

        <div ref={chipsRef} className="mt-7 flex flex-col gap-4">
          {chipTiers.map((tier) => (
            <div key={tier.name} className="flex flex-wrap items-center gap-[10px]">
              <p className="w-[120px] flex-none font-mono text-[11px] tracking-[0.12em] text-muted uppercase">
                {tier.name}
              </p>
              {tier.items.map((item) => (
                <button
                  key={item.index}
                  onClick={() => sceneRef.current?.focusTech(item.index)}
                  className="rounded-full border border-panel-border bg-chip px-[15px] py-2 text-[13px] font-medium transition hover:border-accent hover:shadow-[0_0_14px_var(--glow)]"
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Typecheck and lint**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/portfolio/tech-focus-panel.tsx components/portfolio/skills.tsx
git commit -m "feat: add skills section wiring tech scene and hand tracking"
```

---

### Task 12: Projects section

**Files:**
- Create: `components/portfolio/projects.tsx`

**Interfaces:**
- Consumes: `projects`, `Project` type from `@/lib/portfolio-data`.
- Produces: `<Projects />` (no props), used by Task 18's `app/page.tsx`.

- [ ] **Step 1: Create `components/portfolio/projects.tsx`**

```tsx
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { projects, type Project } from "@/lib/portfolio-data";

const ACCENT_GLOW = "rgba(61, 139, 255, 0.30)";

export function Projects() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const progress = progressRef.current;
    if (!viewport || !progress) return;

    const onScroll = () => {
      const max = viewport.scrollWidth - viewport.clientWidth;
      const pct = max > 0 ? (viewport.scrollLeft / max) * 100 : 0;
      progress.style.width = `${pct}%`;
    };
    viewport.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => viewport.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      id="projects"
      className="relative overflow-hidden py-[clamp(72px,8vw,100px)]"
    >
      <div className="mx-auto max-w-[1120px] px-6">
        <p className="mb-[10px] font-mono text-[12.5px] tracking-[0.18em] text-accent uppercase">
          03 / Projects
        </p>
        <h2 className="font-heading text-[clamp(1.8rem,4vw,2.6rem)] font-bold tracking-[-0.01em]">
          Selected work
        </h2>
        <p className="mt-[10px] text-sm text-muted">
          Keep scrolling — the gallery glides sideways.
        </p>
      </div>
      <div
        ref={viewportRef}
        className="overflow-x-auto px-6 py-8 [-webkit-overflow-scrolling:touch] [overscroll-behavior-x:contain] [scrollbar-width:none]"
      >
        <div className="flex w-max items-stretch gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-[1120px] px-6">
        <div className="h-0.5 max-w-[320px] overflow-hidden rounded-full bg-line">
          <div
            ref={progressRef}
            className="h-full w-0 bg-accent shadow-[0_0_8px_var(--glow)]"
          />
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const cardRef = useRef<HTMLElement>(null);

  const onEnter = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      y: -6,
      boxShadow: `0 14px 40px rgba(0,0,0,.28), 0 0 24px ${ACCENT_GLOW}`,
      duration: 0.35,
      ease: "power2.out",
    });
  };

  const onLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      y: 0,
      boxShadow: "0 0 0 rgba(0,0,0,0)",
      duration: 0.45,
      ease: "power2.out",
    });
  };

  return (
    <article
      ref={cardRef}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="flex w-[min(400px,80vw)] flex-none flex-col overflow-hidden rounded-2xl border border-panel-border bg-panel backdrop-blur-sm"
    >
      <div
        role="img"
        aria-label="Project preview placeholder"
        className="relative aspect-video overflow-hidden border-b border-line"
      >
        <div
          className="absolute inset-y-0 -inset-x-8 flex items-center justify-center bg-bg2"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, var(--chip) 0 12px, transparent 12px 24px)",
          }}
        >
          <span className="font-mono text-[11.5px] tracking-[0.08em] text-muted">
            [ project preview ]
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-[22px]">
        <h3 className="font-heading text-[19px] font-semibold">{project.title}</h3>
        <p className="mt-[10px] text-sm leading-[1.65] text-muted">{project.desc}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-accent-dim px-[11px] py-1 font-mono text-[11px] tracking-[0.04em] text-accent"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-auto flex gap-[18px] border-t border-line pt-[18px]">
          <a
            href="#"
            className="inline-flex items-center gap-[6px] text-[13.5px] font-semibold text-accent"
          >
            Live Demo <span aria-hidden>↗</span>
          </a>
          <a
            href="#"
            className="text-[13.5px] font-semibold text-muted transition-colors hover:text-accent"
          >
            Source Code
          </a>
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/portfolio/projects.tsx
git commit -m "feat: add projects horizontal scroll gallery"
```

---

### Task 13: Timeline thread hook

**Files:**
- Create: `lib/hooks/use-timeline-thread.ts`

**Interfaces:**
- Produces: `useTimelineThread(containerRef: RefObject<HTMLDivElement | null>, entrySelector: string): { svgRef: RefObject<SVGSVGElement | null>; pathRef: RefObject<SVGPathElement | null>; knotRef: RefObject<SVGCircleElement | null>; }`. Consumed by Task 14's Experience section.

- [ ] **Step 1: Create `lib/hooks/use-timeline-thread.ts`**

```ts
"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function useTimelineThread(
  containerRef: RefObject<HTMLDivElement | null>,
  entrySelector: string,
) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const knotRef = useRef<SVGCircleElement>(null);
  const lengthRef = useRef(0);
  const progressRef = useRef(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const container = containerRef.current;
    const svg = svgRef.current;
    const path = pathRef.current;
    if (!container || !svg || !path) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const setProgress = (progress: number) => {
      progressRef.current = progress;
      if (!lengthRef.current) return;
      path.style.strokeDashoffset = String(lengthRef.current * (1 - progress));
      const knot = knotRef.current;
      if (!knot) return;
      knot.style.opacity = progress > 0.005 && progress < 0.995 ? "1" : "0";
      const point = path.getPointAtLength(
        lengthRef.current * Math.max(0, Math.min(1, progress)),
      );
      knot.setAttribute("cx", point.x.toFixed(1));
      knot.setAttribute("cy", point.y.toFixed(1));
    };

    const build = () => {
      const cards = container.querySelectorAll<HTMLElement>(entrySelector);
      if (cards.length === 0) return;
      const containerRect = container.getBoundingClientRect();
      if (!containerRect.width || !containerRect.height) return;
      svg.setAttribute(
        "viewBox",
        `0 0 ${Math.round(containerRect.width)} ${Math.round(containerRect.height)}`,
      );
      const points = Array.from(cards).map((card) => {
        const rect = card.getBoundingClientRect();
        return {
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top,
        };
      });
      let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1];
        const b = points[i];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        d += ` C ${(a.x - dx * 0.3).toFixed(1)} ${(a.y + dy * 0.5).toFixed(1)}, ${(b.x + dx * 0.3).toFixed(1)} ${(b.y - dy * 0.5).toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
      }
      path.setAttribute("d", d);
      lengthRef.current = path.getTotalLength();
      path.style.strokeDasharray = String(lengthRef.current);
      setProgress(progressRef.current);
    };

    build();
    const onResize = () => build();
    window.addEventListener("resize", onResize);

    let scrollTrigger: ScrollTrigger | undefined;
    if (reduceMotion) {
      setProgress(1);
    } else {
      const proxy = { progress: 0 };
      const tween = gsap.to(proxy, {
        progress: 1,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top 68%",
          end: "bottom 60%",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
        onUpdate: () => setProgress(proxy.progress),
      });
      scrollTrigger = tween.scrollTrigger ?? undefined;
      ScrollTrigger.addEventListener("refreshInit", build);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      ScrollTrigger.removeEventListener("refreshInit", build);
      scrollTrigger?.kill();
    };
  }, [containerRef, entrySelector]);

  return { svgRef, pathRef, knotRef };
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/hooks/use-timeline-thread.ts
git commit -m "feat: add scroll-scrubbed timeline thread hook"
```

---

### Task 14: Experience section

**Files:**
- Create: `components/portfolio/experience.tsx`

**Interfaces:**
- Consumes: `roles` from `@/lib/portfolio-data`; `useScrollReveal` from Task 5; `useTimelineThread` from Task 13.
- Produces: `<Experience />` (no props), used by Task 18's `app/page.tsx`.

- [ ] **Step 1: Create `components/portfolio/experience.tsx`**

```tsx
"use client";

import { useRef } from "react";
import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";
import { useTimelineThread } from "@/lib/hooks/use-timeline-thread";
import { roles } from "@/lib/portfolio-data";

export function Experience() {
  const headingRef = useScrollReveal<HTMLDivElement>();
  const timelineRef = useRef<HTMLDivElement>(null);
  const { svgRef, pathRef, knotRef } = useTimelineThread(
    timelineRef,
    "[data-tl-entry]",
  );

  return (
    <section
      id="experience"
      className="border-y border-line px-6 py-[clamp(72px,10vw,120px)]"
      style={{ background: "var(--bg2)" }}
    >
      <div className="mx-auto max-w-[960px]">
        <div ref={headingRef}>
          <p className="mb-[10px] font-mono text-[12.5px] tracking-[0.18em] text-accent uppercase">
            04 / Experience
          </p>
          <h2 className="mb-14 font-heading text-[clamp(1.8rem,4vw,2.6rem)] font-bold tracking-[-0.01em]">
            Where I&apos;ve worked
          </h2>
        </div>
        <div ref={timelineRef} className="relative">
          <svg
            ref={svgRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          >
            <path
              ref={pathRef}
              d=""
              fill="none"
              stroke="var(--accent)"
              strokeWidth={1.8}
              strokeLinecap="round"
              style={{ filter: "drop-shadow(0 0 6px var(--glow))" }}
            />
            <circle
              ref={knotRef}
              r={4.5}
              fill="var(--accent)"
              style={{
                filter: "drop-shadow(0 0 9px var(--glow))",
                opacity: 0,
                transition: "opacity .3s ease",
              }}
            />
          </svg>
          <div className="flex flex-col gap-[clamp(44px,7vw,80px)]">
            {roles.map((role) => (
              <article
                key={role.company}
                data-tl-entry
                className="relative w-[min(440px,100%)] rounded-lg border border-panel-border p-[14px_14px_20px] shadow-[0_18px_44px_rgba(0,0,0,.28)] backdrop-blur-md"
                style={{
                  alignSelf: role.align,
                  transform: `rotate(${role.rotation}deg)`,
                  background: "var(--panel-strong)",
                }}
              >
                <span
                  aria-hidden
                  className="absolute -top-[7px] left-1/2 h-[13px] w-[13px] -translate-x-1/2 rounded-full border-2 bg-accent shadow-[0_0_10px_var(--glow)]"
                  style={{ borderColor: "var(--bg2)" }}
                />
                <div
                  role="img"
                  aria-label="Photo placeholder for this role — replace with a memory from this chapter"
                  className="mb-4 flex aspect-[3/2] items-center justify-center rounded border border-line bg-bg"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(-45deg, var(--chip) 0 12px, transparent 12px 24px)",
                  }}
                >
                  <span className="font-mono text-[11.5px] tracking-[0.08em] text-muted">
                    [ memory photo ]
                  </span>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-heading text-[18px] font-semibold">
                    {role.position}
                  </h3>
                  <span className="font-mono text-[11.5px] text-accent">
                    {role.dates}
                  </span>
                </div>
                <p className="mt-[5px] text-sm font-semibold text-muted">
                  {role.company}
                </p>
                <ul className="mt-3 flex flex-col gap-[7px] pl-[18px]">
                  {role.points.map((point) => (
                    <li key={point} className="text-[13.5px] leading-[1.6] text-muted">
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/portfolio/experience.tsx
git commit -m "feat: add experience timeline section"
```

---

### Task 15: Education and Footer sections

**Files:**
- Create: `components/portfolio/education.tsx`
- Create: `components/portfolio/footer.tsx`

**Interfaces:**
- Consumes: `education`, `certifications`, `navLinks` from `@/lib/portfolio-data`; `useScrollReveal` from Task 5.
- Produces: `<Education />`, `<Footer />` (no props), used by Task 18's `app/page.tsx`.

- [ ] **Step 1: Create `components/portfolio/education.tsx`**

```tsx
"use client";

import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";
import { certifications, education } from "@/lib/portfolio-data";

export function Education() {
  const revealRef = useScrollReveal<HTMLDivElement>();

  return (
    <section id="education" className="px-6 py-[clamp(72px,10vw,120px)]">
      <div ref={revealRef} className="mx-auto max-w-[1120px]">
        <p className="mb-[10px] font-mono text-[12.5px] tracking-[0.18em] text-accent uppercase">
          05 / Education
        </p>
        <h2 className="mb-11 font-heading text-[clamp(1.8rem,4vw,2.6rem)] font-bold tracking-[-0.01em]">
          Education &amp; certifications
        </h2>
        <div className="grid items-start gap-6 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
          <div className="flex flex-col gap-[18px]">
            {education.map((entry) => (
              <div
                key={entry.degree}
                className="rounded-2xl border border-panel-border bg-panel p-[24px_26px] backdrop-blur-sm"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-heading text-[17px] font-semibold">
                    {entry.degree}
                  </h3>
                  <span className="font-mono text-xs text-accent">{entry.dates}</span>
                </div>
                <p className="mt-[6px] text-sm text-muted">{entry.school}</p>
                <p className="mt-[10px] text-[13.5px] leading-[1.6] text-muted">
                  {entry.note}
                </p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-panel-border bg-panel p-[24px_26px] backdrop-blur-sm">
            <p className="mb-[14px] font-mono text-[11.5px] tracking-[0.14em] text-muted uppercase">
              Certifications
            </p>
            <div className="flex flex-col">
              {certifications.map((cert) => (
                <div
                  key={cert.name}
                  className="flex flex-wrap items-baseline justify-between gap-[6px] border-b border-line py-[13px]"
                >
                  <div>
                    <p className="text-[14.5px] font-semibold">{cert.name}</p>
                    <p className="mt-[3px] text-[12.5px] text-muted">{cert.issuer}</p>
                  </div>
                  <span className="font-mono text-xs text-accent">{cert.year}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `components/portfolio/footer.tsx`**

```tsx
import { navLinks } from "@/lib/portfolio-data";

export function Footer() {
  return (
    <footer className="border-t border-line px-6 py-9">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-[18px]">
        <p className="text-[13px] text-muted">
          © {new Date().getFullYear()} [Your Name]. All rights reserved.
        </p>
        <nav aria-label="Footer" className="flex flex-wrap gap-5">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[13px] text-muted transition-colors hover:text-accent"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex gap-4">
          <a
            href="#"
            aria-label="GitHub"
            className="text-[13px] text-muted transition-colors hover:text-accent"
          >
            GitHub
          </a>
          <a
            href="#"
            aria-label="LinkedIn"
            className="text-[13px] text-muted transition-colors hover:text-accent"
          >
            LinkedIn
          </a>
          <a
            href="#"
            aria-label="X / Twitter"
            className="text-[13px] text-muted transition-colors hover:text-accent"
          >
            X
          </a>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Typecheck and lint**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/portfolio/education.tsx components/portfolio/footer.tsx
git commit -m "feat: add education and footer sections"
```

---

### Task 16: Contact API route

**Files:**
- Create: `app/api/contact/route.ts`
- Create: `.env.example`

**Interfaces:**
- Consumes: `contactSchema` from `@/lib/schemas/contact`; `Resend` from `resend`; `process.env.RESEND_API_KEY`, `process.env.CONTACT_TO_EMAIL`.
- Produces: `POST /api/contact` — accepts JSON `{ name, email, message }`, returns `{ success: true }` (200), `{ error, issues? }` (400), or `{ error }` (500/502). Consumed by Task 17's contact form.

- [ ] **Step 1: Create `app/api/contact/route.ts`**

```ts
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactSchema } from "@/lib/schemas/contact";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid form data.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    return NextResponse.json(
      { error: "Email service is not configured." },
      { status: 500 },
    );
  }

  const { name, email, message } = parsed.data;
  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: "Portfolio Contact <onboarding@resend.dev>",
    to,
    replyTo: email,
    subject: `New message from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
  });

  if (error) {
    return NextResponse.json({ error: "Failed to send message." }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Create `.env.example`**

```bash
# Resend API key used by app/api/contact/route.ts to send the contact form email.
# Get one at https://resend.com/api-keys
RESEND_API_KEY=

# Destination inbox that receives contact form submissions.
CONTACT_TO_EMAIL=
```

- [ ] **Step 3: Typecheck and lint**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/api/contact/route.ts .env.example
git commit -m "feat: add contact form API route with resend"
```

---

### Task 17: Contact form component

**Files:**
- Create: `components/portfolio/contact.tsx`

**Interfaces:**
- Consumes: `contactSchema`, `ContactFormValues` from `@/lib/schemas/contact`; `socials` from `@/lib/portfolio-data`; `useScrollReveal` from Task 5; calls `POST /api/contact` from Task 16.
- Produces: `<Contact />` (no props), used by Task 18's `app/page.tsx`.

- [ ] **Step 1: Create `components/portfolio/contact.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useScrollReveal } from "@/lib/hooks/use-scroll-reveal";
import { contactSchema, type ContactFormValues } from "@/lib/schemas/contact";
import { socials } from "@/lib/portfolio-data";

type SubmitStatus = "idle" | "submitting" | "success" | "error";

export function Contact() {
  const revealRef = useScrollReveal<HTMLDivElement>();
  const socialsRef = useScrollReveal<HTMLDivElement>(true);
  const [status, setStatus] = useState<SubmitStatus>("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (values: ContactFormValues) => {
    setStatus("submitting");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("Request failed");
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      id="contact"
      className="border-t border-line px-6 py-[clamp(72px,10vw,120px)]"
      style={{ background: "var(--bg2)" }}
    >
      <div ref={revealRef} className="mx-auto max-w-[1120px]">
        <p className="mb-[10px] font-mono text-[12.5px] tracking-[0.18em] text-accent uppercase">
          06 / Contact
        </p>
        <h2 className="mb-11 font-heading text-[clamp(1.8rem,4vw,2.6rem)] font-bold tracking-[-0.01em]">
          Let&apos;s build something
        </h2>
        <div className="grid items-start gap-11 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <label className="flex flex-col gap-[7px] text-[13px] font-semibold text-muted">
              Name
              <input
                {...register("name")}
                type="text"
                placeholder="[Sender name]"
                className="rounded-[10px] border border-panel-border bg-panel px-[15px] py-[13px] text-[14.5px] text-fg"
              />
              {errors.name && (
                <span className="text-xs font-normal text-red-400">
                  {errors.name.message}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-[7px] text-[13px] font-semibold text-muted">
              Email
              <input
                {...register("email")}
                type="email"
                placeholder="name@example.com"
                className="rounded-[10px] border border-panel-border bg-panel px-[15px] py-[13px] text-[14.5px] text-fg"
              />
              {errors.email && (
                <span className="text-xs font-normal text-red-400">
                  {errors.email.message}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-[7px] text-[13px] font-semibold text-muted">
              Message
              <textarea
                {...register("message")}
                rows={5}
                placeholder="Tell me about your project…"
                className="resize-y rounded-[10px] border border-panel-border bg-panel px-[15px] py-[13px] text-[14.5px] text-fg"
              />
              {errors.message && (
                <span className="text-xs font-normal text-red-400">
                  {errors.message.message}
                </span>
              )}
            </label>
            <button
              type="submit"
              disabled={status === "submitting"}
              className="mt-[6px] rounded-[10px] bg-accent p-[14px] text-[15px] font-semibold text-white shadow-[0_0_20px_var(--glow)] transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {status === "submitting" ? "Sending…" : "Send Message"}
            </button>
            {status === "success" && (
              <p role="status" className="text-[13.5px] text-accent">
                Message sent — thanks for reaching out, I&apos;ll reply within a day.
              </p>
            )}
            {status === "error" && (
              <p role="status" className="text-[13.5px] text-red-400">
                Something went wrong sending your message. Please try again or
                email me directly.
              </p>
            )}
          </form>
          <div ref={socialsRef} className="flex flex-col gap-[14px]">
            <p className="mb-[6px] text-[15px] leading-[1.7] text-muted">
              Prefer email or socials? I usually reply within a day.
            </p>
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="flex items-center justify-between gap-3 rounded-xl border border-panel-border bg-panel p-[17px_20px] backdrop-blur-sm transition hover:translate-x-1 hover:border-accent"
              >
                <span className="flex flex-col gap-[2px]">
                  <span className="text-[14.5px] font-semibold">{social.label}</span>
                  <span className="text-[12.5px] text-muted">{social.value}</span>
                </span>
                <span aria-hidden className="text-accent">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/portfolio/contact.tsx
git commit -m "feat: add contact form with rhf/zod validation and api submit"
```

---

### Task 18: Assemble page, clean up scaffold, final verification

**Files:**
- Modify: `app/page.tsx`
- Delete: `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg`

**Interfaces:**
- Consumes: `Header`, `Hero`, `About`, `Skills`, `Projects`, `Experience`, `Education`, `Contact`, `Footer` from `@/components/portfolio/*`.

- [ ] **Step 1: Replace `app/page.tsx`**

```tsx
import { Header } from "@/components/portfolio/header";
import { Hero } from "@/components/portfolio/hero";
import { About } from "@/components/portfolio/about";
import { Skills } from "@/components/portfolio/skills";
import { Projects } from "@/components/portfolio/projects";
import { Experience } from "@/components/portfolio/experience";
import { Education } from "@/components/portfolio/education";
import { Contact } from "@/components/portfolio/contact";
import { Footer } from "@/components/portfolio/footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Education />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Remove unused create-next-app scaffold assets**

```bash
git rm public/file.svg public/globe.svg public/next.svg public/vercel.svg public/window.svg
```

- [ ] **Step 3: Typecheck and lint**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 4: Production build (final end-to-end gate)**

Run: `pnpm build`
Expected: build completes successfully with no errors (warnings about the Resend/contact route needing `RESEND_API_KEY`/`CONTACT_TO_EMAIL` at *runtime* are fine — those are read at request time, not build time, so the build itself must still succeed without them set).

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx
git commit -m "feat: assemble portfolio page and remove unused scaffold assets"
```

---

## Self-Review

**Spec coverage:** Header/nav/theme toggle/mobile menu → Task 6. Hero 3D particles → Task 7. About/stats → Task 8. Skills 3D tech-tree + focus panel + chips + WebGL fallback → Tasks 9, 11. Hand-tracking → Task 10, wired in Task 11. Projects horizontal gallery + GSAP hover + progress bar → Task 12. Experience timeline + SVG thread → Tasks 13, 14. Education/certifications → Task 15. Contact form + real email delivery → Tasks 16, 17. Footer → Task 15. Theme/Tailwind foundation → Task 1. Data layer → Task 2. Smooth scroll (Lenis) → Task 5. Final assembly/cleanup/build gate → Task 18. All sections from the spec are covered.

**Placeholder scan:** No TBD/TODO markers; all component code is complete and directly runnable. All content strings intentionally retain the original template's bracketed placeholders (`[Your Name]`, `[Tech 1]`, etc.), which is the explicit, approved scope — not an unfinished-plan placeholder.

**Type consistency:** `TechSceneHandle` (`focusTech(index: number)`, `closeFocus()`, `setRotationTarget(rotY: number, tilt: number)`) is defined once in Task 9 and used identically in Task 10 (hand-tracking hook), Task 11 (Skills section — chip buttons and focus-panel close button). `TechSceneProps` (`techs`, `accent`, `reducedMotion`, `visible`, `focusedIndex`, `onFocus`) defined in Task 9 matches the props passed to `<TechScene>` in Task 11. `useScrollReveal<T>(stagger?)` signature from Task 5 is used consistently (positional boolean, not an options object) in Tasks 8, 11, 14, 15, 17. `ContactFormValues`/`contactSchema` from Task 3 match the fields read in Task 16's route (`name`, `email`, `message`) and the fields registered in Task 17's form.
