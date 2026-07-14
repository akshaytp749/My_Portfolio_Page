import { useEffect, useRef, useState } from "react";
import { bootLines, suggestions } from "../data/resume.js";
import { askAgent, localAnswer } from "../lib/agent.js";

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const BOOT_LINE_DELAY_MS = 420;
const TYPE_TICK_MS = 24;
const DEMO_DELAY_MS = 4000;
const DEMO_KEYSTROKE_MS = 38;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
  const [pending, setPending] = useState(false); // waiting for an answer (not typing/streaming)
  const [demoNoted, setDemoNoted] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const interactedRef = useRef(false); // any click/keypress kills the auto-demo
  const demoCancelRef = useRef(false);
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
    if (el) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    }
  }, [entries, bootCount, pending]);

  const appendToLast = (kind, text) =>
    setEntries((prev) => [...prev.slice(0, -1), { kind, text }]);

  const revealAnswer = async (kind, text) => {
    if (prefersReducedMotion()) {
      setEntries((prev) => [...prev, { kind, text }]);
      return;
    }
    const words = text.split(" ");
    setEntries((prev) => [...prev, { kind, text: "" }]);
    let i = 0;
    while (i < words.length) {
      i = demoCancelRef.current ? words.length : i + 1;
      appendToLast(kind, words.slice(0, i).join(" "));
      if (i < words.length) await sleep(TYPE_TICK_MS);
    }
  };

  // auto-demo: if the visitor hasn't touched anything ~4s after boot, the terminal
  // demos itself with the first chip question — LOCAL answer only, never the API
  useEffect(() => {
    if (!booted || prefersReducedMotion()) return;
    const t = setTimeout(async () => {
      if (interactedRef.current) return;
      setBusy(true);
      const q = suggestions[0];
      setEntries((prev) => [...prev, { kind: "user", text: "" }]);
      let i = 0;
      while (i < q.length) {
        i = demoCancelRef.current ? q.length : i + 1;
        appendToLast("user", q.slice(0, i));
        if (i < q.length) await sleep(DEMO_KEYSTROKE_MS);
      }
      setEntries((prev) => [
        ...prev,
        { kind: "note", text: "(auto-demo from the local index — type to ask the live agent)" },
      ]);
      if (!demoCancelRef.current) {
        setPending(true);
        await sleep(600);
        setPending(false);
      }
      await revealAnswer("answer", localAnswer(q));
      setBusy(false);
    }, DEMO_DELAY_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booted]);

  const markInteracted = () => {
    interactedRef.current = true;
    demoCancelRef.current = true; // flushes any in-flight auto-demo instantly
  };

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
    setPending(true);
    const { text, demo } = await askAgent(history);
    setPending(false);
    if (demo && !demoNoted) {
      setDemoNoted(true);
      setEntries((prev) => [
        ...prev,
        { kind: "note", text: "(demo mode — answering from the local index, not the live model)" },
      ]);
    }
    demoCancelRef.current = false;
    await revealAnswer("answer", text);
    setBusy(false);
    inputRef.current?.focus();
  };

  return (
    <div
      onPointerDownCapture={markInteracted}
      onKeyDownCapture={markInteracted}
      className="relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--term)] shadow-[0_0_50px_rgba(245,166,35,0.14),0_0_120px_rgba(82,39,255,0.10)]"
    >
      {/* chrome bar */}
      <div className="flex items-center gap-2 border-b border-[var(--term-line)] px-4 py-2.5">
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
        className="h-80 overflow-y-auto px-4 py-3 font-mono text-[13px] leading-relaxed sm:h-96"
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
        {pending && (
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

      {/* CRT scanlines + vignette, above everything, never intercepts input */}
      <div className="crt-overlay pointer-events-none absolute inset-0" aria-hidden="true" />
    </div>
  );
}
