import { useReducedMotion } from "motion/react";
import { identity } from "../data/resume.js";
import Terminal from "./Terminal.jsx";
import SideRays from "./reactbits/SideRays.jsx";
import ShinyText from "./reactbits/ShinyText.jsx";

export default function Hero() {
  const reduce = useReducedMotion();

  return (
    <section id="top" className="relative overflow-hidden">
      {/* the ONE background effect: amber SideRays from the terminal's corner —
          the machine casting light across the graphite page */}
      {!reduce && (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <SideRays
            rayColor1="#F5A623"
            rayColor2="#B45309"
            origin="top-right"
            intensity={2.2}
            spread={2.4}
            speed={1.4}
            saturation={1.3}
            opacity={0.85}
          />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[#0b0c0e]" />
        </div>
      )}

      <div className="relative mx-auto max-w-[1120px] px-5 pb-12 pt-16 sm:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            {reduce ? (
              <p className="eyebrow">{identity.roleLine}</p>
            ) : (
              <ShinyText
                text={identity.roleLine}
                className="eyebrow"
                color="#c6cdc8"
                shineColor="#ffffff"
                speed={4}
              />
            )}
            <h1 className="mt-5 text-4xl font-bold leading-[1.12] tracking-tight text-[var(--text)] sm:text-5xl lg:text-[38px] xl:text-[47px]">
              {identity.headline.line1}
              <br />
              <span className="text-[var(--accent)]">{identity.headline.line2}</span>
              <span className="cursor-blink ml-1 text-[var(--accent)]" aria-hidden="true">
                ▍
              </span>
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-[var(--text-soft)]">
              {identity.intro}
            </p>
            <div className="mt-8 flex items-center gap-4">
              <a
                href={identity.resumePdf}
                download
                className="rounded-md border border-[var(--accent-dim)] bg-[var(--accent-tint)] px-5 py-2 font-mono text-[12px] text-[var(--text)] transition-colors hover:border-[var(--accent)]"
              >
                Resume ↓
              </a>
              <a
                href={`mailto:${identity.email}`}
                className="rounded-md border border-[var(--line)] px-5 py-2 font-mono text-[12px] text-[var(--text-soft)] transition-colors hover:border-[var(--accent-dim)] hover:text-[var(--text)]"
              >
                Email ↗
              </a>
            </div>
          </div>
          <Terminal />
        </div>
        <a
          href="#systems"
          className="mt-14 inline-flex items-center gap-2 font-mono text-[11px] text-[var(--text-faint)] transition-colors hover:text-[var(--accent)]"
        >
          ↓ the systems behind the claims
        </a>
      </div>
    </section>
  );
}
