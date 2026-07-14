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

/**
 * Ask the agent, streaming. `history` is the full multi-turn transcript ending
 * with the new user turn. `onStart` fires once before the first token;
 * `onToken(fullTextSoFar)` fires per chunk. Returns { text, demo } — demo=true
 * means the local fallback answered (callbacks were NOT fired).
 */
export async function askAgentStream(history, { onStart, onToken } = {}) {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok || !res.body) throw new Error(`chat api ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = "";
    let started = false;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      full += decoder.decode(value, { stream: true });
      if (!started && full.trim()) {
        started = true;
        onStart?.();
      }
      if (started) onToken?.(full);
    }
    if (!full.trim()) throw new Error("empty stream");
    return { text: full, demo: false };
  } catch {
    const lastUser = [...history].reverse().find((m) => m.role === "user");
    return { text: localAnswer(lastUser ? lastUser.content : ""), demo: true };
  }
}
