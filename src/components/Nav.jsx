import { useState } from "react";
import { Menu, X } from "lucide-react";
import { identity } from "../data/resume.js";
import { trackEvent, pingNotify } from "../lib/analytics.js";

const links = [
  { label: "systems", href: "#systems" },
  { label: "projects", href: "#projects" },
  { label: "stack", href: "#stack" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[#0b0c0e]/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-[1120px] items-center justify-between px-5 py-4">
        <a
          href="#top"
          className="text-[15px] font-semibold tracking-tight text-[var(--text)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {identity.name}
          <span className="ml-1 text-[var(--accent)]" aria-hidden="true">_</span>
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
            onClick={() => {
              trackEvent("email_click", { where: "nav" });
              pingNotify("email_click");
            }}
            className="font-mono text-[12px] text-[var(--accent)] transition-colors hover:text-[var(--text)]"
          >
            email ↗
          </a>
          {/* section links collapse into this on phones; desktop never shows it */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="text-[var(--text-soft)] transition-colors hover:text-[var(--text)] sm:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-[var(--line)] bg-[#0b0c0e] sm:hidden">
          <div className="mx-auto flex max-w-[1120px] flex-col px-5 py-2">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3 font-mono text-[13px] text-[var(--text-soft)] transition-colors hover:text-[var(--accent)]"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
