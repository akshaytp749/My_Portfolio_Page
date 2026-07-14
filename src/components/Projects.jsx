import { projects } from "../data/resume.js";

export default function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-[1120px] px-5 py-20">
      <p className="eyebrow">Personal projects</p>
      <h2
        className="mt-4 text-4xl text-[var(--ink)]"
        style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
      >
        Built after hours
      </h2>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {projects.map((p) => (
          <a
            key={p.repo}
            href={p.url}
            target="_blank"
            rel="noreferrer"
            className="group rounded-lg border border-[var(--line)] bg-[var(--panel)] p-6 transition-shadow hover:shadow-md"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h3
                className="text-xl text-[var(--ink)]"
                style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
              >
                {p.title}
              </h3>
              <span className="font-mono text-[11px] text-[var(--ink-faint)] transition-colors group-hover:text-[var(--amber)]">
                ↗
              </span>
            </div>
            <p className="mt-1 font-mono text-[11px] text-[var(--ink-faint)]">{p.repo}</p>
            <p className="mt-3 text-[13.5px] leading-relaxed text-[var(--ink-soft)]">
              {p.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {p.tags.map((t) => (
                <span
                  key={t}
                  className="rounded border border-[var(--line)] px-2 py-0.5 font-mono text-[10.5px] text-[var(--ink-faint)]"
                >
                  {t}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
