import { useReducedMotion } from "motion/react";
import { identity } from "../data/resume.js";
import { useIsMobile } from "../lib/useIsMobile.js";
import { trackEvent, pingNotify } from "../lib/analytics.js";
import Terminal from "./Terminal.jsx";
import SideRays from "./reactbits/SideRays.jsx";
import ShinyText from "./reactbits/ShinyText.jsx";

export default function Hero() {
  const reduce = useReducedMotion();
  const isMobile = useIsMobile();

  // overflow-clip (not overflow-hidden): on fractional-DPR displays a hidden clip
  // around the WebGL layer leaves a 1px white seam at the bottom edge during scroll;
  // clip avoids the scroll-container promotion that causes it.
  return (
    <section id="top" className="relative overflow-clip">
      {/* the ONE background effect: amber SideRays from the terminal's corner —
          the machine casting light across the graphite page. Skipped on mobile
          (fullscreen WebGL shader = jank/battery); the fixed CSS ambient in
          index.css still carries the warm top-right glow there. */}
      {!reduce && !isMobile && (
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          // mask the rays layer to transparent toward the bottom: they dissolve
          // into the fixed ambient (no dark band, no hard bright edge, no seam)
          style={{
            maskImage: "linear-gradient(to bottom, #000 45%, transparent 88%)",
            WebkitMaskImage: "linear-gradient(to bottom, #000 45%, transparent 88%)",
          }}
        >
          <SideRays
            rayColor1="#F5A623"
            rayColor2="#C2610C"
            origin="top-right"
            intensity={3.4}
            spread={2.2}
            speed={2.6}
            saturation={1.35}
            falloff={1.15}
            opacity={1}
          />
        </div>
      )}

      {/* z-10 keeps content (esp. the terminal) above SideRays' hardcoded z-[3],
          so the opaque terminal occludes the light instead of being washed by it */}
      <div className="relative z-10 mx-auto max-w-[1120px] px-5 pb-12 pt-16 sm:pt-24">
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
                onClick={() => {
                  trackEvent("resume_download", { where: "hero" });
                  pingNotify("resume_download");
                }}
                className="rounded-md border border-[var(--accent-dim)] bg-[var(--accent-tint)] px-5 py-2 font-mono text-[12px] text-[var(--text)] transition-colors hover:border-[var(--accent)]"
              >
                Resume ↓
              </a>
              <a
                href={`mailto:${identity.email}`}
                onClick={() => {
                  trackEvent("email_click", { where: "hero" });
                  pingNotify("email_click");
                }}
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
