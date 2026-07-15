import { lazy, Suspense, useState } from "react";
import { useReducedMotion } from "motion/react";
import { systems, systemsFootnote, signals } from "../data/resume.js";
import { useIsMobile } from "../lib/useIsMobile.js";
import { useSectionView } from "../lib/analytics.js";
import SpotlightCard from "./reactbits/SpotlightCard.jsx";
import CountUp from "./reactbits/CountUp.jsx";
import Reveal from "./Reveal.jsx";

// React Flow is heavy — it only downloads when a visitor opens a dataflow
const SystemDiagram = lazy(() => import("./SystemDiagram.jsx"));

function Metric({ metric }) {
  const reduce = useReducedMotion();
  const numeric = metric.match(/^(\d+)(.*)$/);
  if (!numeric || reduce) {
    return <span className="font-mono text-3xl text-[var(--accent)]">{metric}</span>;
  }
  const [, value, suffix] = numeric;
  return (
    <span className="font-mono text-3xl text-[var(--accent)]">
      <CountUp to={Number(value)} duration={1.6} />
      {suffix}
    </span>
  );
}

function Dataflow({ system }) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const flowString = (
    <div className="mt-3 overflow-x-auto rounded border border-[var(--line)] bg-black/40 px-3 py-2.5">
      <code className="whitespace-nowrap font-mono text-[11.5px] text-[var(--text-soft)]">
        {system.flow}
      </code>
    </div>
  );

  // On mobile show the scrollable text flow, not the diagram: React Flow shrinks
  // to unreadable labels on a phone and its node tooltips need hover (dead on
  // touch). Bonus: the heavy React Flow chunk never loads on mobile.
  const useDiagram = system.diagram && !isMobile;

  return (
    <details className="mt-4" onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className="dataflow-toggle cursor-pointer list-none font-mono text-[11px] text-[var(--accent)] transition-colors hover:text-[var(--text)]">
        dataflow <span className="dataflow-arrow">▸</span>
      </summary>
      {open &&
        (useDiagram ? (
          <Suspense fallback={flowString}>
            <div className="mt-3 overflow-hidden rounded border border-[var(--line)] bg-black/40">
              <SystemDiagram diagram={system.diagram} />
            </div>
            {/* the diagram is visual; keep the flow readable for screen readers */}
            <span className="sr-only">{system.flow}</span>
            <p className="mt-1.5 font-mono text-[10px] text-[var(--text-faint)]">
              hover a node for the design decision
            </p>
          </Suspense>
        ) : (
          flowString
        ))}
    </details>
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
      <Dataflow system={system} />
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
  const ref = useSectionView("systems");
  return (
    <section ref={ref} id="systems" className="mx-auto max-w-[1120px] px-5 py-20">
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
        <p className="mt-4 font-mono text-[11px] tracking-wide text-[var(--text-soft)]">
          {signals}
        </p>
      </Reveal>
    </section>
  );
}
