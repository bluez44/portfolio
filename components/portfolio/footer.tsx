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
