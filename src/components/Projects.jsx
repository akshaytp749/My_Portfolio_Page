import { projects } from "../data/resume.js";
import github from "../data/github.json";
import { useSectionView } from "../lib/analytics.js";
import Reveal from "./Reveal.jsx";
import ProjectDemo from "./ProjectDemo.jsx";

// "updated 4d ago" / "updated 3mo ago" — freshness as of the last deploy
function timeAgo(iso) {
  if (!iso) return null;
  const days = Math.max(0, Math.floor((Date.now() - new Date(iso)) / 86400000));
  if (days === 0) return "updated today";
  if (days < 30) return `updated ${days}d ago`;
  if (days < 365) return `updated ${Math.floor(days / 30)}mo ago`;
  return `updated ${Math.floor(days / 365)}y ago`;
}

// title + repo meta + description + tags. pinTags pushes the tag row to the card
// bottom so text-only cards in a row line up neatly regardless of copy length.
function CardBody({ p, pinTags }) {
  return (
    <>
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-lg font-semibold tracking-tight text-[var(--text)]">{p.title}</h3>
        <span className="font-mono text-[11px] text-[var(--text-faint)] transition-colors group-hover:text-[var(--accent)]">
          ↗
        </span>
      </div>
      <p className="mt-1 font-mono text-[11px] text-[var(--text-faint)]">
        {p.repo}
        {github[p.repo]?.stars > 0 && ` · ★ ${github[p.repo].stars}`}
        {github[p.repo]?.pushedAt && ` · ${timeAgo(github[p.repo].pushedAt)}`}
      </p>
      <p className="mt-3 text-[13.5px] leading-relaxed text-[var(--text-soft)]">{p.description}</p>
      <div className={`${pinTags ? "mt-auto pt-4" : "mt-4"} flex flex-wrap gap-1.5`}>
        {p.tags.map((t) => (
          <span
            key={t}
            className="rounded border border-[var(--line)] px-2 py-0.5 font-mono text-[10.5px] text-[var(--text-faint)]"
          >
            {t}
          </span>
        ))}
      </div>
    </>
  );
}

export default function Projects() {
  const ref = useSectionView("projects");
  // projects with a demo become full-width hero cards; the rest sit in a tidy
  // equal-height row beneath. Data-driven, so adding/removing a demo just works.
  const featured = projects.filter((p) => p.demo);
  const rest = projects.filter((p) => !p.demo);

  return (
    <section ref={ref} id="projects" className="mx-auto max-w-[1120px] px-5 py-20">
      <Reveal>
        <p className="eyebrow">Personal projects</p>
        <h2 className="mt-4 text-4xl font-bold tracking-tight text-[var(--text)]">
          Built after hours
        </h2>
      </Reveal>

      {/* hero project: bigger inline demo on the left, text on the right */}
      {featured.map((p, i) => (
        <Reveal key={p.repo} delay={i * 0.08}>
          <div className="group mt-10 grid overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent-dim)] md:grid-cols-5">
            <div className="md:col-span-3">
              <ProjectDemo variant="featured" src={p.demo} poster={p.poster} title={p.title} />
            </div>
            <a
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col justify-center p-6 md:col-span-2"
            >
              <CardBody p={p} />
            </a>
          </div>
        </Reveal>
      ))}

      {/* everything else: text-only, equal-height, aligned tag rows */}
      {rest.length > 0 && (
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {rest.map((p, i) => (
            <Reveal key={p.repo} delay={i * 0.08} className="h-full">
              <div className="group flex h-full flex-col rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent-dim)]">
                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-1 flex-col"
                >
                  <CardBody p={p} pinTags />
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
