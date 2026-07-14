import { useReducedMotion } from "motion/react";
import { systems, systemsFootnote, signals } from "../data/resume.js";
import SpotlightCard from "./reactbits/SpotlightCard.jsx";
import CountUp from "./reactbits/CountUp.jsx";
import Reveal from "./Reveal.jsx";

function Metric({ metric }) {
  const reduce = useReducedMotion();
  const numeric = metric.match(/^(\d+)(.*)$/);
  if (!numeric || reduce) {
    return <span className="font-mono text-3xl text-[var(--amber)]">{metric}</span>;
  }
  const [, value, suffix] = numeric;
  return (
    <span className="font-mono text-3xl text-[var(--amber)]">
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
      <details className="mt-4">
        <summary className="dataflow-toggle cursor-pointer list-none font-mono text-[11px] text-[var(--amber)] transition-colors hover:text-[var(--ink)]">
          dataflow <span className="dataflow-arrow">▸</span>
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
    </SpotlightCard>
  );
}

export default function Systems() {
  return (
    <section id="systems" className="mx-auto max-w-[1120px] px-5 py-20">
      <Reveal>
        <p className="eyebrow">Production systems</p>
        <h2
          className="mt-4 text-4xl text-[var(--ink)]"
          style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
        >
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
        <p className="mt-8 text-[13px] leading-relaxed text-[var(--ink-faint)]">
          {systemsFootnote}
        </p>
        <p className="mt-4 font-mono text-[11px] tracking-wide text-[var(--ink-faint)]">
          {signals}
        </p>
      </Reveal>
    </section>
  );
}
