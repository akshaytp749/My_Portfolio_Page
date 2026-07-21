import { projects } from "../data/resume.js";
import github from "../data/github.json";
import { useSectionView } from "../lib/analytics.js";
import Reveal from "./Reveal.jsx";

// "updated 4d ago" / "updated 3mo ago" — freshness as of the last deploy
function timeAgo(iso) {
  if (!iso) return null;
  const days = Math.max(0, Math.floor((Date.now() - new Date(iso)) / 86400000));
  if (days === 0) return "updated today";
  if (days < 30) return `updated ${days}d ago`;
  if (days < 365) return `updated ${Math.floor(days / 30)}mo ago`;
  return `updated ${Math.floor(days / 365)}y ago`;
}

export default function Projects() {
  const ref = useSectionView("projects");
  return (
    <section ref={ref} id="projects" className="mx-auto max-w-[1120px] px-5 py-20">
      <Reveal>
        <p className="eyebrow">Personal projects</p>
        <h2 className="mt-4 text-4xl font-bold tracking-tight text-[var(--text)]">
          Built after hours
        </h2>
      </Reveal>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {projects.map((p, i) => (
          <Reveal key={p.repo} delay={i * 0.08} className="h-full">
            <a
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="group block h-full rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent-dim)]"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-lg font-semibold tracking-tight text-[var(--text)]">
                  {p.title}
                </h3>
                <span className="font-mono text-[11px] text-[var(--text-faint)] transition-colors group-hover:text-[var(--accent)]">
                  ↗
                </span>
              </div>
              <p className="mt-1 font-mono text-[11px] text-[var(--text-faint)]">
                {p.repo}
                {github[p.repo]?.stars > 0 && ` · ★ ${github[p.repo].stars}`}
                {github[p.repo]?.pushedAt && ` · ${timeAgo(github[p.repo].pushedAt)}`}
              </p>
              <p className="mt-3 text-[13.5px] leading-relaxed text-[var(--text-soft)]">
                {p.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded border border-[var(--line)] px-2 py-0.5 font-mono text-[10.5px] text-[var(--text-faint)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
