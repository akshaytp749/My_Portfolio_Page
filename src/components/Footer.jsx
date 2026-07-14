import { identity, footer } from "../data/resume.js";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--panel)]">
      <div className="mx-auto max-w-[1120px] px-5 py-16">
        <h2
          className="text-4xl leading-[1.15] text-[var(--ink)]"
          style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
        >
          {footer.headline.line1}
          <br />
          <em className="text-[var(--amber)]">{footer.headline.line2}</em>
        </h2>
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <a
            href={`mailto:${identity.email}`}
            className="font-mono text-[12px] text-[var(--amber)] underline-offset-4 hover:underline"
          >
            {identity.email}
          </a>
          <a
            href={identity.github}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[12px] text-[var(--ink-soft)] transition-colors hover:text-[var(--amber)]"
          >
            github ↗
          </a>
          <a
            href={identity.linkedin}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[12px] text-[var(--ink-soft)] transition-colors hover:text-[var(--amber)]"
          >
            linkedin ↗
          </a>
          <a
            href={identity.resumePdf}
            download
            className="font-mono text-[12px] text-[var(--ink-soft)] transition-colors hover:text-[var(--amber)]"
          >
            resume ↓
          </a>
        </div>
        <p className="mt-10 max-w-2xl font-mono text-[10.5px] leading-relaxed text-[var(--ink-faint)]">
          {footer.smallPrint}
          {identity.sourceRepo && (
            <>
              {" · "}
              <a
                href={identity.sourceRepo}
                target="_blank"
                rel="noreferrer"
                className="text-[var(--amber)] hover:underline"
              >
                view source ↗
              </a>
            </>
          )}
        </p>
      </div>
    </footer>
  );
}
