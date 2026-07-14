import { AGENT_SYSTEM_PROMPT } from "../src/data/resume.js";

// Any OpenAI-compatible provider works — Groq (default), OpenRouter, or Gemini.
// Switch providers by changing env vars only; see .env.example.
const BASE_URL = process.env.LLM_BASE_URL || "https://api.groq.com/openai/v1";
const MODEL = process.env.LLM_MODEL || "llama-3.3-70b-versatile";
const MAX_TOKENS = 600;
const MAX_MESSAGES = 20; // ~10 user turns
const MAX_CONTENT_CHARS = 1200;

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
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
        messages: [
          { role: "system", content: AGENT_SYSTEM_PROMPT },
          ...messages.map(({ role, content }) => ({ role, content })),
        ],
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      console.error("llm provider error", upstream.status, detail);
      return res.status(502).json({ error: "upstream model error" });
    }

    const data = await upstream.json();
    const reply = data.choices?.[0]?.message?.content ?? "";
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("chat handler error", err);
    return res.status(500).json({ error: "agent unavailable" });
  }
}
