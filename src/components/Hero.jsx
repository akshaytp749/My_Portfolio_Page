import { identity } from "../data/resume.js";
import Terminal from "./Terminal.jsx";

export default function Hero() {
  return (
    <section id="top" className="mx-auto max-w-[1120px] px-5 pb-20 pt-16 sm:pt-24">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="eyebrow">{identity.roleLine}</p>
          <h1
            className="mt-5 text-5xl leading-[1.08] text-[var(--ink)] sm:text-6xl"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
          >
            {identity.headline.line1}
            <br />
            <em className="text-[var(--amber)]">{identity.headline.line2}</em>
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-[var(--ink-soft)]">
            {identity.intro}
          </p>
          <div className="mt-7 flex items-center gap-6">
            <a
              href={identity.resumePdf}
              download
              className="font-mono text-[12px] text-[var(--amber)] underline-offset-4 transition-colors hover:text-[var(--ink)] hover:underline"
            >
              Resume ↓
            </a>
            <a
              href={`mailto:${identity.email}`}
              className="font-mono text-[12px] text-[var(--ink-soft)] underline-offset-4 transition-colors hover:text-[var(--amber)] hover:underline"
            >
              Email ↗
            </a>
          </div>
        </div>
        <Terminal />
      </div>
    </section>
  );
}
