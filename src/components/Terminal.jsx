import { useEffect, useRef, useState } from "react";
import { bootLines, suggestions } from "../data/resume.js";
import { askAgent } from "../lib/agent.js";

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const BOOT_LINE_DELAY_MS = 420;
const TYPE_TICK_MS = 24;

const lineColors = {
  cmd: "text-[var(--term-text)]",
  dim: "text-[var(--term-dim)]",
  highlight: "text-[var(--amber-bright)]",
  user: "text-[var(--term-text)]",
  answer: "text-[var(--term-answer)]",
  error: "text-[var(--amber-bright)]",
  note: "text-[var(--term-dim)]",
};

export default function Terminal() {
  const [bootCount, setBootCount] = useState(0);
  const [entries, setEntries] = useState([]); // { kind, text }
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [demoNoted, setDemoNoted] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const booted = bootCount >= bootLines.length;

  // boot sequence: staggered line reveal, instant under reduced motion
  useEffect(() => {
    if (prefersReducedMotion()) {
      setBootCount(bootLines.length);
      return;
    }
    if (bootCount >= bootLines.length) return;
    const t = setTimeout(() => setBootCount((c) => c + 1), BOOT_LINE_DELAY_MS);
    return () => clearTimeout(t);
  }, [bootCount]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries, bootCount, busy]);

  const revealAnswer = (kind, text) =>
    new Promise((resolve) => {
      if (prefersReducedMotion()) {
        setEntries((prev) => [...prev, { kind, text }]);
        resolve();
        return;
      }
      const words = text.split(" ");
      let i = 0;
      setEntries((prev) => [...prev, { kind, text: "" }]);
      const tick = setInterval(() => {
        i += 1;
        const partial = words.slice(0, i).join(" ");
        setEntries((prev) => [
          ...prev.slice(0, -1),
          { kind, text: partial },
        ]);
        if (i >= words.length) {
          clearInterval(tick);
          resolve();
        }
      }, TYPE_TICK_MS);
    });

  const ask = async (question) => {
    const q = question.trim();
    if (!q || busy || !booted) return;
    setInput("");
    setBusy(true);

    const history = [];
    for (const e of entries) {
      if (e.kind === "user") history.push({ role: "user", content: e.text });
      if (e.kind === "answer") history.push({ role: "assistant", content: e.text });
    }
    history.push({ role: "user", content: q });

    setEntries((prev) => [...prev, { kind: "user", text: q }]);
    const { text, demo } = await askAgent(history);
    if (demo && !demoNoted) {
      setDemoNoted(true);
      setEntries((prev) => [
        ...prev,
        { kind: "note", text: "(demo mode — answering from the local index, not the live model)" },
      ]);
    }
    await revealAnswer("answer", text);
    setBusy(false);
    inputRef.current?.focus();
  };

  return (
    <div className="rounded-xl border border-[var(--term-line)] bg-[var(--term)] shadow-2xl overflow-hidden">
      {/* chrome bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--term-line)]">
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--term-line)]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--term-line)]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--term-line)]" />
        <span className="ml-2 font-mono text-[11px] text-[var(--term-dim)]">
          akshay-agent — live
        </span>
        <span
          className={`ml-auto h-1.5 w-1.5 rounded-full bg-[var(--amber-bright)] ${booted ? "pulse-dot" : ""}`}
          aria-hidden="true"
        />
      </div>

      {/* transcript */}
      <div
        ref={scrollRef}
        className="h-80 sm:h-96 overflow-y-auto px-4 py-3 font-mono text-[13px] leading-relaxed"
        aria-live="polite"
      >
        {bootLines.slice(0, bootCount).map((line, i) => (
          <div key={`boot-${i}`} className={lineColors[line.type]}>
            {line.text}
          </div>
        ))}
        {entries.map((e, i) => (
          <div key={`e-${i}`} className={`mt-2 ${lineColors[e.kind]}`}>
            {e.kind === "user" && (
              <span className="text-[var(--term-dim)]">$ </span>
            )}
            {e.kind === "answer" && (
              <span className="text-[var(--amber-dim)]">▸ </span>
            )}
            {e.text}
          </div>
        ))}
        {busy && (
          <div className="mt-2 text-[var(--term-dim)]">
            <span className="text-[var(--amber-dim)]">▸ </span>
            thinking<span className="cursor-blink">…</span>
          </div>
        )}
      </div>

      {/* input */}
      <form
        className="flex items-center gap-2 border-t border-[var(--term-line)] px-4 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
      >
        <span className="font-mono text-[13px] text-[var(--amber-bright)]" aria-hidden="true">
          ❯
        </span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!booted || busy}
          placeholder={booted ? "ask about Akshay's work…" : "booting…"}
          aria-label="Ask the agent about Akshay's work"
          className="flex-1 bg-transparent font-mono text-[13px] text-[var(--term-text)] placeholder-[var(--term-dim)] outline-none disabled:opacity-50"
        />
        {input && !busy && (
          <span className="font-mono text-[11px] text-[var(--term-dim)]">↵</span>
        )}
      </form>

      {/* suggestion chips */}
      <div className="flex flex-wrap gap-2 border-t border-[var(--term-line)] px-4 py-3">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => ask(s)}
            disabled={!booted || busy}
            className="rounded-full border border-[var(--term-line)] px-3 py-1.5 font-mono text-[11px] text-[var(--term-dim)] transition-colors hover:border-[var(--amber-dim)] hover:text-[var(--term-answer)] disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
