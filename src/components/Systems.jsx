import { useReducedMotion } from "motion/react";
import { systems, systemsFootnote, signals } from "../data/resume.js";
import SpotlightCard from "./reactbits/SpotlightCard.jsx";
import CountUp from "./reactbits/CountUp.jsx";
import Reveal from "./Reveal.jsx";

function Metric({ metric }) {
  const reduce = useReducedMotion();
  const numeric = metric.match(/^(\d+)(.*)$/);
  if (!numeric || reduce) {
    return <span className="font-mono text-3xl text-[var(--accent-pink)]">{metric}</span>;
  }
  const [, value, suffix] = numeric;
  return (
    <span className="font-mono text-3xl text-[var(--accent-pink)]">
      <CountUp to={Number(value)} duration={1.6} />
      {suffix}
    </span>
  );
}

function SystemCard({ system }) {
  return (
    <SpotlightCard className="h-full p-6 transition-transform duration-300 hover:-translate-y-1">
      <div className="flex items-baseline gap-3">
        <Metric metric={system.metric} />
        <span className="font-mono text-[11px] text-[var(--text-faint)]">
          {system.metricLabel}
        </span>
      </div>
      <h3 className="mt-4 text-xl font-semibold tracking-tight text-[var(--text)]">
        {system.title}
      </h3>
      <p className="mt-3 text-[14px] leading-relaxed text-[var(--text-soft)]">
        {system.blurb}
      </p>
      <details className="mt-4">
        <summary className="dataflow-toggle cursor-pointer list-none font-mono text-[11px] text-[var(--accent-soft)] transition-colors hover:text-[var(--text)]">
          dataflow <span className="dataflow-arrow">▸</span>
        </summary>
        <div className="mt-3 overflow-x-auto rounded border border-[var(--line)] bg-black/40 px-3 py-2.5">
          <code className="whitespace-nowrap font-mono text-[11.5px] text-[var(--text-soft)]">
            {system.flow}
          </code>
        </div>
      </details>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {system.stack.map((s) => (
          <span
            key={s}
            className="rounded border border-[var(--line)] px-2 py-0.5 font-mono text-[10.5px] text-[var(--text-faint)]"
          >
            {s}
          </span>
        ))}
      </div>
    </SpotlightCard>
  );
}

export default function Systems() {
  return (
    <section id="systems" className="mx-auto max-w-[1120px] px-5 py-20">
      <Reveal>
        <p className="eyebrow">Production systems</p>
        <h2 className="mt-4 text-4xl font-bold tracking-tight text-[var(--text)]">
          Shipped at RingCentral
        </h2>
      </Reveal>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {systems.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.08}>
            <SystemCard system={s} />
          </Reveal>
        ))}
      </div>
      <Reveal>
        <p className="mt-8 text-[13px] leading-relaxed text-[var(--text-faint)]">
          {systemsFootnote}
        </p>
        <p className="mt-4 font-mono text-[11px] tracking-wide text-[var(--text-faint)]">
          {signals}
        </p>
      </Reveal>
    </section>
  );
}
