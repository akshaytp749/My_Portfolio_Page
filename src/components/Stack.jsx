import { stackLayers } from "../data/resume.js";
import { useSectionView } from "../lib/analytics.js";
import Reveal from "./Reveal.jsx";

export default function Stack() {
  const ref = useSectionView("stack");
  return (
    <section ref={ref} id="stack" className="mx-auto max-w-[1120px] px-5 py-20">
      <Reveal>
        <p className="eyebrow">Stack, by layer</p>
        <h2 className="mt-4 text-4xl font-bold tracking-tight text-[var(--text)]">
          What I reach for
        </h2>
      </Reveal>
      <dl className="mt-10 divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {stackLayers.map(({ layer, items, note }) => (
          <div key={layer} className="grid gap-2 py-4 sm:grid-cols-[180px_1fr] sm:gap-6">
            <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--accent)]">
              {layer}
            </dt>
            <dd className="text-[14px] leading-relaxed text-[var(--text-soft)]">
              {items.join(" · ")}
              {note && (
                <span className="text-[var(--text-faint)] italic"> — {note}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
