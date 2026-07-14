import { fallbackAnswers, fallbackDefault } from "../data/resume.js";

const REQUEST_TIMEOUT_MS = 10000;

// Local keyword answers keep the terminal alive when /api/chat is unreachable
// (plain `npm run dev`, or a backend outage). First keyword match wins.
export function localAnswer(question) {
  const q = question.toLowerCase();
  for (const { keywords, answer } of fallbackAnswers) {
    if (keywords.some((k) => q.includes(k))) return answer;
  }
  return fallbackDefault;
}

/**
 * Ask the agent. `history` is the full multi-turn transcript:
 * [{ role: "user" | "assistant", content: string }, ...] ending with the new user turn.
 * Returns { text, demo } — demo=true means the local fallback answered.
 */
export async function askAgent(history) {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`chat api ${res.status}`);
    const data = await res.json();
    if (typeof data.reply !== "string" || !data.reply) {
      throw new Error("chat api returned empty reply");
    }
    return { text: data.reply, demo: false };
  } catch {
    const lastUser = [...history].reverse().find((m) => m.role === "user");
    return { text: localAnswer(lastUser ? lastUser.content : ""), demo: true };
  }
}
