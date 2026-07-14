import { useReducedMotion } from "motion/react";
import { identity, footer } from "../data/resume.js";
import GradientText from "./reactbits/GradientText.jsx";

export default function Footer() {
  const reduce = useReducedMotion();

  return (
    <footer className="border-t border-[var(--line)] bg-white/[0.02]">
      <div className="mx-auto max-w-[1120px] px-5 py-16">
        <h2 className="text-4xl font-bold leading-[1.15] tracking-tight text-[var(--text)]">
          {footer.headline.line1}
          <br />
          {reduce ? (
            <span className="text-[var(--accent-soft)]">{footer.headline.line2}</span>
          ) : (
            <GradientText className="font-bold" animationSpeed={6}>
              {footer.headline.line2}
            </GradientText>
          )}
        </h2>
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <a
            href={`mailto:${identity.email}`}
            className="font-mono text-[12px] text-[var(--accent-pink)] underline-offset-4 hover:underline"
          >
            {identity.email}
          </a>
          <a
            href={identity.github}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[12px] text-[var(--text-soft)] transition-colors hover:text-[var(--text)]"
          >
            github ↗
          </a>
          <a
            href={identity.linkedin}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[12px] text-[var(--text-soft)] transition-colors hover:text-[var(--text)]"
          >
            linkedin ↗
          </a>
          <a
            href={identity.resumePdf}
            download
            className="font-mono text-[12px] text-[var(--text-soft)] transition-colors hover:text-[var(--text)]"
          >
            resume ↓
          </a>
        </div>
        <p className="mt-10 max-w-2xl font-mono text-[10.5px] leading-relaxed text-[var(--text-faint)]">
          {footer.smallPrint}
          {identity.sourceRepo && (
            <>
              {" · "}
              <a
                href={identity.sourceRepo}
                target="_blank"
                rel="noreferrer"
                className="text-[var(--accent-soft)] hover:underline"
              >
                view source ↗
              </a>
            </>
          )}
        </p>
      </div>
    </footer>
  );
}
