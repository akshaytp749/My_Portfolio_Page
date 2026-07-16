import { AGENT_SYSTEM_PROMPT, agentFacts } from "../src/data/resume.js";
import { notify } from "../server/notify.mjs";
import { clientIp, originAllowed } from "../server/http.mjs";

// Build the system prompt fresh per request: base facts + owner-maintained gap
// facts + a CURRENT CONTEXT line with today's date and exact tenure. The date
// line is what stops the model guessing "present" ≈ its 2024-ish training era
// (which made "years of experience" wildly wrong).
function buildSystemPrompt() {
  const now = new Date();
  const months = (now.getUTCFullYear() - 2022) * 12 + (now.getUTCMonth() - 8); // since Sept 2022
  const years = Math.floor(months / 12);
  const rem = months % 12;
  const today = now.toISOString().slice(0, 10);
  const extra = agentFacts.length
    ? "\n\nADDITIONAL OWNER-PROVIDED FACTS:\n" + agentFacts.map((f) => `- ${f}`).join("\n")
    : "";
  const context =
    `\n\nCURRENT CONTEXT — as of ${today}: Akshay has been a professional software engineer ` +
    `since September 2022, which is ${years} years and ${rem} months of experience as of today. ` +
    `Compute any tenure or "years of experience" answer from September 2022 to ${today}.`;
  return `${AGENT_SYSTEM_PROMPT}${extra}${context}`;
}

// Any OpenAI-compatible provider works — Groq (default), OpenRouter, or Gemini.
// Switch providers by changing env vars only; see .env.example.
const BASE_URL = process.env.LLM_BASE_URL || "https://api.groq.com/openai/v1";
const MODEL = process.env.LLM_MODEL || "llama-3.3-70b-versatile";
const MAX_TOKENS = 600;
const MAX_MESSAGES = 20; // ~10 user turns
const MAX_CONTENT_CHARS = 1200;
const RATE_LIMIT_PER_10_MIN = 30;
const LOG_TTL_SECONDS = 60 * 60 * 24 * 45; // logs self-delete after 45 days

// streamed plain-text response; the client reads res.body directly
export const config = { supportsResponseStreaming: true };

function validate(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return "messages must be a non-empty array";
  if (messages.length > MAX_MESSAGES) return "conversation too long — email akshaythomas.p@gmail.com instead";
  for (const m of messages) {
    if (!m || (m.role !== "user" && m.role !== "assistant")) return "invalid role";
    if (typeof m.content !== "string" || !m.content.trim()) return "content must be a non-empty string";
    if (m.content.length > MAX_CONTENT_CHARS) return "message too long";
  }
  if (messages[messages.length - 1].role !== "user") return "last message must be from the user";
  return null;
}

// Upstash Redis REST sliding-ish window (fixed 10-min buckets are fine at this
// stakes level). Skipped when Upstash env vars aren't set.
async function rateLimited(req) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return false;
  try {
    const ip = clientIp(req);
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify([
        ["INCR", `rl:${ip}`],
        ["EXPIRE", `rl:${ip}`, "600", "NX"],
      ]),
    });
    const [{ result: count }] = await res.json();
    return Number(count) > RATE_LIMIT_PER_10_MIN;
  } catch (err) {
    console.error("rate limit check failed", err);
    return false; // fail open — a Redis hiccup shouldn't kill the agent
  }
}

// Append the finished Q/A pair to a per-day Redis list (disclosed in the site
// footer). Best-effort: skipped without Upstash env, never fails the response.
async function logConversation(question, answer) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || !answer.trim()) return;
  try {
    const key = `log:${new Date().toISOString().slice(0, 10)}`;
    const entry = JSON.stringify({
      t: new Date().toISOString(),
      q: question,
      a: answer,
    });
    await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify([
        ["RPUSH", key, entry],
        ["EXPIRE", key, String(LOG_TTL_SECONDS), "NX"],
      ]),
    });
  } catch (err) {
    console.error("conversation log failed", err);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }
  if (!originAllowed(req)) {
    return res.status(403).json({ error: "forbidden" });
  }

  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "agent backend not configured" });
  }

  const { messages } = req.body ?? {};
  const invalid = validate(messages);
  if (invalid) {
    return res.status(400).json({ error: invalid });
  }

  if (await rateLimited(req)) {
    return res.status(429).json({ error: "rate limited — try again in a few minutes" });
  }

  try {
    const upstream = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        stream: true,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          ...messages.map(({ role, content }) => ({ role, content })),
        ],
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text();
      console.error("llm provider error", upstream.status, detail);
      return res.status(502).json({ error: "upstream model error" });
    }

    res.writeHead(200, {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-cache",
    });

    // provider SSE → plain text token passthrough
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let reply = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") continue;
        try {
          const delta = JSON.parse(data).choices?.[0]?.delta?.content;
          if (delta) {
            reply += delta;
            res.write(delta);
          }
        } catch {
          // partial JSON split across chunks lands back in buffer next round
        }
      }
    }
    // awaited before end(): serverless may freeze right after the response closes
    const question = messages[messages.length - 1].content;
    const ip = clientIp(req);
    await Promise.all([
      logConversation(question, reply),
      // one alert per visitor per 10 min so a multi-question session ≠ 5 emails;
      // full transcript is always in `npm run logs`
      notify("Someone is talking to your agent", `Q: ${question}`, {
        dedupeKey: `q:${ip}`,
        cooldown: 600,
      }),
    ]);
    res.end();
  } catch (err) {
    console.error("chat handler error", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "agent unavailable" });
    } else {
      res.end();
    }
  }
}
