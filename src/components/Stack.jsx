import { stackLayers } from "../data/resume.js";
import Reveal from "./Reveal.jsx";

export default function Stack() {
  return (
    <section id="stack" className="mx-auto max-w-[1120px] px-5 py-20">
      <Reveal>
        <p className="eyebrow">Stack, by layer</p>
        <h2
          className="mt-4 text-4xl text-[var(--ink)]"
          style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
        >
          What I reach for
        </h2>
      </Reveal>
      <dl className="mt-10 divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {stackLayers.map(({ layer, items }) => (
          <div key={layer} className="grid gap-2 py-4 sm:grid-cols-[180px_1fr] sm:gap-6">
            <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--amber)]">
              {layer}
            </dt>
            <dd className="text-[14px] leading-relaxed text-[var(--ink-soft)]">
              {items.join(" · ")}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
