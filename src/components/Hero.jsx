import { useReducedMotion } from "motion/react";
import { identity } from "../data/resume.js";
import Terminal from "./Terminal.jsx";
import DarkVeil from "./reactbits/DarkVeil.jsx";
import GradientText from "./reactbits/GradientText.jsx";
import ShinyText from "./reactbits/ShinyText.jsx";

export default function Hero() {
  const reduce = useReducedMotion();

  return (
    <section id="top" className="relative overflow-hidden">
      {/* the ONE background effect: DarkVeil WebGL, hero only, melts into the page */}
      {!reduce && (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <DarkVeil noiseIntensity={0.02} scanlineIntensity={0.06} scanlineFrequency={2} speed={0.4} warpAmount={0.15} />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#060010]" />
        </div>
      )}

      <div className="relative mx-auto max-w-[1120px] px-5 pb-24 pt-16 sm:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            {reduce ? (
              <p className="eyebrow">{identity.roleLine}</p>
            ) : (
              <ShinyText
                text={identity.roleLine}
                className="eyebrow"
                color="#b497cf"
                shineColor="#ffffff"
                speed={4}
              />
            )}
            <h1 className="mt-5 text-4xl font-bold leading-[1.12] tracking-tight text-[var(--text)] sm:text-5xl lg:text-[38px] xl:text-[47px]">
              {identity.headline.line1}
              <br />
              {reduce ? (
                <span className="text-[var(--accent-soft)]">{identity.headline.line2}</span>
              ) : (
                <GradientText className="font-bold" animationSpeed={6}>
                  {identity.headline.line2}
                </GradientText>
              )}
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-[var(--text-soft)]">
              {identity.intro}
            </p>
            <div className="mt-8 flex items-center gap-4">
              <a
                href={identity.resumePdf}
                download
                className="rounded-full border border-[var(--accent-soft)] bg-[var(--accent)]/15 px-5 py-2 font-mono text-[12px] text-[var(--text)] transition-colors hover:bg-[var(--accent)]/30"
              >
                Resume ↓
              </a>
              <a
                href={`mailto:${identity.email}`}
                className="rounded-full border border-[var(--line)] px-5 py-2 font-mono text-[12px] text-[var(--text-soft)] transition-colors hover:border-[var(--accent-soft)] hover:text-[var(--text)]"
              >
                Email ↗
              </a>
            </div>
          </div>
          <Terminal />
        </div>
      </div>
    </section>
  );
}
