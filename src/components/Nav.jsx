import { identity } from "../data/resume.js";

const links = [
  { label: "systems", href: "#systems" },
  { label: "projects", href: "#projects" },
  { label: "stack", href: "#stack" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[#060010]/70 backdrop-blur-md">
      <nav className="mx-auto flex max-w-[1120px] items-center justify-between px-5 py-4">
        <a href="#top" className="text-[15px] font-semibold tracking-tight text-[var(--text)]">
          {identity.name}
          <span className="ml-1 text-[var(--accent-pink)]">✦</span>
        </a>
        <div className="flex items-center gap-5">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="hidden font-mono text-[12px] text-[var(--text-soft)] transition-colors hover:text-[var(--text)] sm:inline"
            >
              {l.label}
            </a>
          ))}
          <a
            href={`mailto:${identity.email}`}
            className="font-mono text-[12px] text-[var(--accent-soft)] transition-colors hover:text-[var(--text)]"
          >
            email ↗
          </a>
        </div>
      </nav>
    </header>
  );
}
