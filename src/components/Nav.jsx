import { identity } from "../data/resume.js";

const links = [
  { label: "systems", href: "#systems" },
  { label: "projects", href: "#projects" },
  { label: "stack", href: "#stack" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--paper)]/90 backdrop-blur">
      <nav className="mx-auto flex max-w-[1120px] items-center justify-between px-5 py-4">
        <a
          href="#top"
          className="font-[var(--font-serif)] text-lg text-[var(--ink)]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {identity.name}
        </a>
        <div className="flex items-center gap-5">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="hidden font-mono text-[12px] text-[var(--ink-soft)] transition-colors hover:text-[var(--amber)] sm:inline"
            >
              {l.label}
            </a>
          ))}
          <a
            href={`mailto:${identity.email}`}
            className="font-mono text-[12px] text-[var(--amber)] transition-colors hover:text-[var(--ink)]"
          >
            email ↗
          </a>
        </div>
      </nav>
    </header>
  );
}
