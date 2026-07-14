import { systems, systemsFootnote, signals } from "../data/resume.js";

function SystemCard({ system }) {
  return (
    <article className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-6 transition-shadow hover:shadow-md">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-3xl text-[var(--amber)]">{system.metric}</span>
        <span className="font-mono text-[11px] text-[var(--ink-faint)]">
          {system.metricLabel}
        </span>
      </div>
      <h3
        className="mt-4 text-2xl text-[var(--ink)]"
        style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
      >
        {system.title}
      </h3>
      <p className="mt-3 text-[14px] leading-relaxed text-[var(--ink-soft)]">
        {system.blurb}
      </p>
      <details className="group mt-4">
        <summary className="cursor-pointer list-none font-mono text-[11px] text-[var(--amber)] transition-colors hover:text-[var(--ink)]">
          <span className="group-open:hidden">dataflow ▸</span>
          <span className="hidden group-open:inline">dataflow ▾</span>
        </summary>
        <div className="mt-3 overflow-x-auto rounded border border-[var(--line)] bg-[var(--paper)] px-3 py-2.5">
          <code className="whitespace-nowrap font-mono text-[11.5px] text-[var(--ink-soft)]">
            {system.flow}
          </code>
        </div>
      </details>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {system.stack.map((s) => (
          <span
            key={s}
            className="rounded border border-[var(--line)] px-2 py-0.5 font-mono text-[10.5px] text-[var(--ink-faint)]"
          >
            {s}
          </span>
        ))}
      </div>
    </article>
  );
}

export default function Systems() {
  return (
    <section id="systems" className="mx-auto max-w-[1120px] px-5 py-20">
      <p className="eyebrow">Production systems</p>
      <h2
        className="mt-4 text-4xl text-[var(--ink)]"
        style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
      >
        Shipped at RingCentral
      </h2>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {systems.map((s) => (
          <SystemCard key={s.title} system={s} />
        ))}
      </div>
      <p className="mt-8 text-[13px] leading-relaxed text-[var(--ink-faint)]">
        {systemsFootnote}
      </p>
      <p className="mt-4 font-mono text-[11px] tracking-wide text-[var(--ink-faint)]">
        {signals}
      </p>
    </section>
  );
}
