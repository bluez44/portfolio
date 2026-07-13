import { navLinks } from "@/lib/portfolio-data";

export function Footer() {
  return (
    <footer className="border-t border-line px-6 py-9">
      <div className="mx-auto flex max-w-280 flex-wrap items-center justify-between gap-4.5">
        <p className="text-[13px] text-muted">
          © {new Date().getFullYear()} Quang Vinh. All rights reserved.
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
            href="https://github.com/bluez44"
            target="_blank"
            aria-label="GitHub"
            className="text-[13px] text-muted transition-colors hover:text-accent"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/vinh-quang-485331286"
            target="_blank"
            aria-label="LinkedIn"
            className="text-[13px] text-muted transition-colors hover:text-accent"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
