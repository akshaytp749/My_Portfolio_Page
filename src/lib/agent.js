import { fallbackAnswers, fallbackDefault } from "../data/resume.js";

const REQUEST_TIMEOUT_MS = 30000; // covers first-token latency + full stream

// Local keyword answers keep the terminal alive when /api/chat is unreachable
// (plain `npm run dev`, rate limiting, or a backend outage). First match wins.
export function localAnswer(question) {
  const q = question.toLowerCase();
  for (const { keywords, answer } of fallbackAnswers) {
    if (keywords.some((k) => q.includes(k))) return answer;
  }
  return fallbackDefault;
}

// Parse the server's `x-agent-guard: input:<reason>` header into structured meta.
function parseGuard(header) {
  if (!header) return null;
  const [layer, reason] = header.split(":");
  return { layer, reason: reason || "blocked" };
}

/**
 * Ask the agent, streaming. `history` is the full multi-turn transcript ending
 * with the new user turn. `onMeta(meta)` fires once after headers, before any
 * token (so the terminal can show a [guard] line ahead of the answer); `onStart`
 * fires once before the first token; `onToken(fullTextSoFar)` fires per chunk.
 *
 * Returns { text, demo, meta }. `meta` carries the honest request telemetry —
 * which provider/model served, whether failover fired, whether a guard tripped,
 * and the client-measured latency / first-token time. demo=true means the local
 * fallback answered (only onMeta-less; callbacks did NOT fire) and meta is null.
 */
export async function askAgentStream(history, { onMeta, onStart, onToken } = {}) {
  const t0 = performance.now();
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok || !res.body) throw new Error(`chat api ${res.status}`);

    const meta = {
      guard: parseGuard(res.headers.get("x-agent-guard")),
      provider: res.headers.get("x-agent-provider") || null,
      model: res.headers.get("x-agent-model") || null,
      failover: res.headers.get("x-agent-failover") === "1",
    };
    onMeta?.(meta);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = "";
    let started = false;
    let firstMs = null;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      full += decoder.decode(value, { stream: true });
      if (!started && full.trim()) {
        started = true;
        firstMs = Math.round(performance.now() - t0);
        onStart?.();
      }
      if (started) onToken?.(full);
    }
    if (!full.trim()) throw new Error("empty stream");
    const ms = Math.round(performance.now() - t0);
    return { text: full, demo: false, meta: { ...meta, ms, firstMs } };
  } catch {
    const lastUser = [...history].reverse().find((m) => m.role === "user");
    return { text: localAnswer(lastUser ? lastUser.content : ""), demo: true, meta: null };
  }
}
